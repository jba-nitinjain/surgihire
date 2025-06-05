import React, { useState, useEffect } from 'react';
import { Payment, PaymentFormData } from '../../types';
import { useCrud } from '../../context/CrudContext';
import { Save, X, Loader2, CalendarCheck2, IndianRupee } from 'lucide-react';

import DatePickerField from "../ui/DatePickerField";
interface PaymentFormProps {
  payment?: Payment | null;
  onSave: () => void;
  onCancel: () => void;
}

const todayStr = new Date().toISOString().split('T')[0];
const DEFAULT_MODE_KEY = 'default_payment_mode';
const getStoredDefaultMode = () =>
  typeof window !== 'undefined' && typeof localStorage !== 'undefined'
    ? localStorage.getItem(DEFAULT_MODE_KEY)
    : null;
const storedDefaultMode = getStoredDefaultMode();

const initialFormData: PaymentFormData = {
  rental_id: '',
  nature: 'rental',
  payment_date: todayStr,
  payment_amount: '',
  payment_mode: storedDefaultMode || 'Cash',
  payment_reference: '',
  notes: '',
};

const KNOWN_MODES = ['Cash', 'NEFT/RTGS', 'IMPS', 'Credit Card', 'Debit Card'];

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const [modeSelect, setModeSelect] = useState<string>('');
  const [otherMode, setOtherMode] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const { createItem, updateItem, loading: crudLoading } = useCrud();

  useEffect(() => {
    if (payment) {
      const isKnown = payment.payment_mode ? KNOWN_MODES.includes(payment.payment_mode) : false;
      setModeSelect(isKnown ? payment.payment_mode! : payment.payment_mode ? 'Others' : '');
      setOtherMode(isKnown ? '' : payment.payment_mode || '');
      setFormData({
        rental_id: payment.rental_id,
        nature: payment.nature ?? 'rental',
        payment_date: payment.payment_date,
        payment_amount: payment.payment_amount ? String(payment.payment_amount) : '',
        payment_mode: payment.payment_mode ?? '',
        payment_reference: payment.payment_reference ?? '',
        notes: payment.notes ?? '',
      });
    } else {
      const stored = getStoredDefaultMode() || 'Cash';
      const isKnown = KNOWN_MODES.includes(stored);
      setModeSelect(isKnown ? stored : 'Others');
      setOtherMode(isKnown ? '' : stored);
      setFormData({
        ...initialFormData,
        payment_date: todayStr,
        payment_mode: stored,
      });
    }
  }, [payment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setModeSelect(value);
    if (value !== 'Others') {
      setFormData(prev => ({ ...prev, payment_mode: value }));
    } else {
      setFormData(prev => ({ ...prev, payment_mode: otherMode }));
    }
  };

  const handleOtherModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherMode(value);
    setFormData(prev => ({ ...prev, payment_mode: value }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof PaymentFormData, string>> = {};
    if (!formData.rental_id) errors.rental_id = 'Rental ID is required';
    if (!formData.payment_date) errors.payment_date = 'Date is required';
    if (!formData.payment_amount) errors.payment_amount = 'Amount is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      rental_id: formData.rental_id,
      nature: formData.nature || null,
      payment_date: formData.payment_date,
      payment_amount: formData.payment_amount ? Number(formData.payment_amount) : 0,
      payment_mode: formData.payment_mode || null,
      payment_reference: formData.payment_reference || null,
      notes: formData.notes || null,
    };
    if (payment) {
      await updateItem('payments', payment.payment_id, payload);
    } else {
      await createItem('payments', payload);
    }
    onSave();
  };

  const inputClass = 'mt-1 block w-full border-light-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue sm:text-sm';

  return (
    <div className="bg-white p-6 rounded-md shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="rental_id" className="block text-sm font-medium text-dark-text mb-1">
            Rental ID
          </label>
          <input
            type="text"
            id="rental_id"
            name="rental_id"
            value={formData.rental_id}
            onChange={handleChange}
            className={inputClass}
          />
          {formErrors.rental_id && <p className="text-red-600 text-sm mt-1">{formErrors.rental_id}</p>}
        </div>
        <div>
          <span className="block text-sm font-medium text-dark-text mb-1">Nature</span>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="nature"
                value="rental"
                checked={formData.nature === 'rental'}
                onChange={handleChange}
                className="text-brand-blue focus:ring-brand-blue"
              />
              <span className="ml-2">Rental Receipt</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="nature"
                value="deposit"
                checked={formData.nature === 'deposit'}
                onChange={handleChange}
                className="text-brand-blue focus:ring-brand-blue"
              />
              <span className="ml-2">Deposit</span>
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="payment_date" className="block text-sm font-medium text-dark-text mb-1">
            Date
          </label>
          <DatePickerField
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
          />
          {formErrors.payment_date && <p className="text-red-600 text-sm mt-1">{formErrors.payment_date}</p>}
        </div>
        <div>
          <label htmlFor="payment_amount" className="block text-sm font-medium text-dark-text mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <IndianRupee size={16} />
            </span>
            <input
              type="number"
              id="payment_amount"
              name="payment_amount"
              value={formData.payment_amount || ''}
              onChange={handleChange}
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="payment_mode_select" className="block text-sm font-medium text-dark-text mb-1">
            Mode
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="payment_mode_select"
              value={modeSelect}
              onChange={handleModeSelectChange}
              className={inputClass}
            >
              <option value="">Select</option>
              {KNOWN_MODES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Others">Others</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const mode = modeSelect === 'Others' ? otherMode : modeSelect;
                if (mode) {
                  localStorage.setItem(DEFAULT_MODE_KEY, mode);
                }
              }}
              className="px-2 py-1 text-xs border rounded text-gray-600 hover:bg-light-gray-50"
            >
              Set Default
            </button>
          </div>
        </div>
        {modeSelect === 'Others' && (
          <div>
            <label htmlFor="payment_mode_other" className="block text-sm font-medium text-dark-text mb-1">
              Specify Mode
            </label>
            <input
              type="text"
              id="payment_mode_other"
              value={otherMode}
              onChange={handleOtherModeChange}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label htmlFor="payment_reference" className="block text-sm font-medium text-dark-text mb-1">
            Reference
          </label>
          <input
            type="text"
            id="payment_reference"
            name="payment_reference"
            value={formData.payment_reference || ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-dark-text mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className={inputClass}
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-dark-text hover:bg-gray-50 focus:outline-none"
          >
            <X className="inline h-4 w-4 mr-1" />Cancel
          </button>
          <button
            type="submit"
            disabled={crudLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
          >
            {crudLoading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Save className="inline h-4 w-4 mr-1" />
            )}
            {payment ? 'Save Changes' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
