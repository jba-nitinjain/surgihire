import React, { useState, useEffect } from 'react';
import {
  RentalTransaction,
  RentalTransactionFormData,
  RentalItemFormData,
  PaymentPlan as PaymentPlanType, // Renamed to avoid conflict
  Equipment as EquipmentType, // Renamed to avoid conflict
  Customer as CustomerType, // Renamed to avoid conflict
} from '../../types';
import { useCrud } from '../../context/CrudContext';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { usePaymentPlans } from '../../context/PaymentPlanContext';
import { useEquipment } from '../../context/EquipmentContext';
import {
  Save,
  X,
  Loader2,
  CalendarCheck2,
  User,
  IndianRupee,
  ListChecks,
  Info,
  ChevronDown,
  DollarSign,
  CalendarDays,
} from 'lucide-react';
import RentalItemsSection from './RentalItemsSection';
import { formatCurrency } from '../../utils/formatting'; // Import formatCurrency

const RENTAL_STATUSES_FORM = ["Draft", "Pending Confirmation", "Confirmed/Booked", "Active/Rented Out", "Returned/Completed", "Overdue", "Cancelled"];

interface RentalTransactionFormProps {
  rental?: RentalTransaction | null;
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: RentalTransactionFormData = {
  customer_id: '',
  rental_date: new Date().toISOString().split('T')[0],
  expected_return_date: '',
  deposit: '',
  payment_term_id: '',
  status: 'Draft',
  notes: '',
  rental_items: [],
};

const RentalTransactionForm: React.FC<RentalTransactionFormProps> = ({
  rental,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<RentalTransactionFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RentalTransactionFormData | `rental_items.${number}.equipment_id` | `rental_items.${number}.quantity` | `rental_items.${number}.unit_rental_rate`, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();

  const { customersForFilter: customers, loadingCustomers, fetchCustomersForSelection } = useRentalTransactions();
  const { paymentPlans, loading: loadingPaymentPlans, refreshPaymentPlans } = usePaymentPlans();
  const { equipmentList: availableEquipment, loading: loadingEquipment, refreshEquipmentData: refreshAvailableEquipment } = useEquipment();

  const [numberOfDays, setNumberOfDays] = useState<number>(0);
  const [calculatedTotalAmount, setCalculatedTotalAmount] = useState<number>(0);

  const isEditing = !!rental;

  useEffect(() => {
    if (customers.length === 0 && !loadingCustomers) fetchCustomersForSelection();
    if (paymentPlans.length === 0 && !loadingPaymentPlans) refreshPaymentPlans();
    if (availableEquipment.length === 0 && !loadingEquipment) refreshAvailableEquipment();
  }, [
    customers.length, loadingCustomers, fetchCustomersForSelection,
    paymentPlans.length, loadingPaymentPlans, refreshPaymentPlans,
    availableEquipment.length, loadingEquipment, refreshAvailableEquipment
  ]);

  useEffect(() => {
    if (rental) {
      setFormData({
        customer_id: rental.customer_id || '',
        rental_date: rental.rental_date ? new Date(rental.rental_date).toISOString().split('T')[0] : '',
        expected_return_date: rental.expected_return_date ? new Date(rental.expected_return_date).toISOString().split('T')[0] : '',
        deposit: rental.deposit !== null ? String(rental.deposit) : '',
        payment_term_id: rental.payment_term_id !== null ? String(rental.payment_term_id) : '',
        status: rental.status || 'Draft',
        notes: rental.notes || '',
        rental_items: rental.rental_items?.map(item => ({
          temp_id: String(item.rental_detail_id || crypto.randomUUID()),
          equipment_id: String(item.equipment_id),
          equipment_name: item.equipment_name || availableEquipment.find(eq => eq.equipment_id === item.equipment_id)?.equipment_name || 'Loading...',
          quantity: String(item.quantity),
          unit_rental_rate: String(item.unit_rental_rate),
          default_equipment_rate: availableEquipment.find(eq => eq.equipment_id === item.equipment_id)?.rental_rate,
        })) || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [rental, availableEquipment]);

  const calculateRentalDays = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
      return 0;
    }
    // Calculate the difference in time
    const timeDiff = endDate.getTime() - startDate.getTime();
    // Convert time difference from milliseconds to days, add 1 to include both start and end day
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) +1;
    return dayDiff > 0 ? dayDiff : 0;
  };

  useEffect(() => {
    const days = calculateRentalDays(formData.rental_date, formData.expected_return_date || '');
    setNumberOfDays(days);

    const dailyRateFromItems = formData.rental_items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity, 10) || 0;
      const rate = parseFloat(item.unit_rental_rate) || 0;
      return sum + (quantity * rate);
    }, 0);

    setCalculatedTotalAmount(days * dailyRateFromItems);
  }, [formData.rental_date, formData.expected_return_date, formData.rental_items]);


  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RentalTransactionFormData | `rental_items.${number}.equipment_id` | `rental_items.${number}.quantity` | `rental_items.${number}.unit_rental_rate`, string>> = {};
    if (!formData.customer_id) errors.customer_id = 'Customer is required.';
    if (!formData.rental_date) errors.rental_date = 'Rental date is required.';
    if (!formData.expected_return_date) {
      errors.expected_return_date = 'Expected return date is required.';
    } else if (formData.rental_date && new Date(formData.expected_return_date) < new Date(formData.rental_date)) {
      errors.expected_return_date = 'Return date cannot be before rental date.';
    }

    if (formData.deposit && (isNaN(parseFloat(formData.deposit)) || parseFloat(formData.deposit) < 0)) {
      errors.deposit = 'Deposit must be a valid non-negative number.';
    }
    if (!formData.status) errors.status = 'Status is required.';

    formData.rental_items.forEach((item, index) => {
      if (!item.equipment_id) errors[`rental_items.${index}.equipment_id`] = 'Equipment is required.';
      if (!item.quantity || parseInt(item.quantity, 10) <= 0) errors[`rental_items.${index}.quantity`] = 'Quantity must be positive.';
      if (!item.unit_rental_rate || parseFloat(item.unit_rental_rate) < 0) errors[`rental_items.${index}.unit_rental_rate`] = 'Rate must be non-negative.';
    });

    if (formData.rental_items.length === 0) {
        errors.rental_items = 'At least one rental item is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof RentalTransactionFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleItemChange = (index: number, field: keyof RentalItemFormData, value: string) => {
    const updatedItems = [...formData.rental_items];
    const currentItem = { ...updatedItems[index], [field]: value };

    if (field === 'equipment_id') {
      const selectedEquipment = availableEquipment.find(eq => String(eq.equipment_id) === value);
      currentItem.equipment_name = selectedEquipment?.equipment_name || 'Unknown Equipment';
      currentItem.default_equipment_rate = selectedEquipment?.rental_rate;
      if (!currentItem.unit_rental_rate || currentItem.unit_rental_rate === "0") {
        currentItem.unit_rental_rate = selectedEquipment?.rental_rate !== null && selectedEquipment?.rental_rate !== undefined ? String(selectedEquipment.rental_rate) : '0';
      }
    }
    updatedItems[index] = currentItem;
    setFormData(prev => ({ ...prev, rental_items: updatedItems }));

    const errorKey = `rental_items.${index}.${field}` as keyof typeof formErrors;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      rental_items: [
        ...prev.rental_items,
        {
          temp_id: crypto.randomUUID(),
          equipment_id: '',
          equipment_name: '',
          quantity: '1',
          unit_rental_rate: '0',
          default_equipment_rate: null,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rental_items: prev.rental_items.filter((_, i) => i !== index),
    }));
    const newFormErrors = { ...formErrors };
    delete newFormErrors[`rental_items.${index}.equipment_id`];
    delete newFormErrors[`rental_items.${index}.quantity`];
    delete newFormErrors[`rental_items.${index}.unit_rental_rate`];
    setFormErrors(newFormErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const apiData: any = {
      ...formData,
      deposit: formData.deposit ? parseFloat(formData.deposit) : null,
      payment_term_id: formData.payment_term_id ? parseInt(formData.payment_term_id, 10) : null,
      total_amount: calculatedTotalAmount, // Add calculated total amount
      rental_items: formData.rental_items.map(item => ({
        equipment_id: parseInt(item.equipment_id, 10),
        quantity: parseInt(item.quantity, 10),
        unit_rental_rate: parseFloat(item.unit_rental_rate),
        ...(isEditing && rental?.rental_items?.find(ri => String(ri.equipment_id) === item.equipment_id)?.rental_detail_id
            ? { rental_detail_id: rental.rental_items.find(ri => String(ri.equipment_id) === item.equipment_id)!.rental_detail_id }
            : {})
      })),
    };

    if (apiData.expected_return_date === '') apiData.expected_return_date = null;
    if (apiData.notes === '') apiData.notes = null;

    try {
      if (isEditing && rental && rental.rental_id) {
        await updateItem('rental_transactions', rental.rental_id, apiData);
      } else {
        await createItem('rental_transactions', apiData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save rental transaction:', err);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-light-gray-100";
  const labelClass = "block text-sm font-medium text-dark-text";
  const iconClass = "h-5 w-5 text-gray-400";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-light-gray-200">
          <h2 className="text-xl font-semibold text-brand-blue flex items-center">
            <CalendarCheck2 className="h-6 w-6 mr-2 text-brand-blue" />
            {isEditing ? 'Edit Rental Transaction' : 'New Rental Transaction'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
            <X className="h-5 w-5 text-dark-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Error Saving Rental</p>
              <p>{crudError}</p>
            </div>
          )}

          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Rental Information</legend>
            <div>
              <label htmlFor="customer_id" className={labelClass}>Customer <span className="text-red-500">*</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loadingCustomers ? <Loader2 className={`${iconClass} animate-spin`} /> : <User className={iconClass} />}
                </div>
                <select name="customer_id" id="customer_id" value={formData.customer_id} onChange={handleChange} className={`${inputClass} pl-10`} required disabled={loadingCustomers}>
                  <option value="">{loadingCustomers ? "Loading..." : "Select Customer"}</option>
                  {customers.map((c: CustomerType) => <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>)}
                </select>
              </div>
              {formErrors.customer_id && <p className="text-xs text-red-500 mt-1">{formErrors.customer_id}</p>}
            </div>

            <div>
              <label htmlFor="rental_date" className={labelClass}>Rental Date <span className="text-red-500">*</span></label>
              <input type="date" name="rental_date" id="rental_date" value={formData.rental_date} onChange={handleChange} className={inputClass} required />
              {formErrors.rental_date && <p className="text-xs text-red-500 mt-1">{formErrors.rental_date}</p>}
            </div>

            <div>
              <label htmlFor="expected_return_date" className={labelClass}>Expected Return Date <span className="text-red-500">*</span></label>
              <input type="date" name="expected_return_date" id="expected_return_date" value={formData.expected_return_date || ''} onChange={handleChange} className={inputClass} required />
              {formErrors.expected_return_date && <p className="text-xs text-red-500 mt-1">{formErrors.expected_return_date}</p>}
            </div>
             <div>
                <label className={labelClass}>Number of Days</label>
                <p className="mt-1 px-3 py-2 bg-light-gray-100 border border-light-gray-300 rounded-md text-dark-text/80 sm:text-sm flex items-center">
                   <CalendarDays size={16} className="mr-2 text-brand-blue"/> {numberOfDays > 0 ? numberOfDays : 'N/A'}
                </p>
            </div>


            <div>
              <label htmlFor="status" className={labelClass}>Status <span className="text-red-500">*</span></label>
               <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ChevronDown className={iconClass} /></div>
                <select name="status" id="status" value={formData.status || ''} onChange={handleChange} className={`${inputClass} pl-10`} required>
                    {RENTAL_STATUSES_FORM.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {formErrors.status && <p className="text-xs text-red-500 mt-1">{formErrors.status}</p>}
            </div>
          </fieldset>

          <RentalItemsSection
            items={formData.rental_items}
            formErrors={formErrors as Record<string, string>}
            availableEquipment={availableEquipment}
            loadingEquipment={loadingEquipment}
            handleItemChange={handleItemChange}
            removeItem={removeItem}
            addItem={addItem}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Payment & Notes</legend>
            <div>
              <label htmlFor="payment_term_id" className={labelClass}>Payment Term</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loadingPaymentPlans ? <Loader2 className={`${iconClass} animate-spin`} /> : <ListChecks className={iconClass} />}
                </div>
                <select name="payment_term_id" id="payment_term_id" value={formData.payment_term_id || ''} onChange={handleChange} className={`${inputClass} pl-10`} disabled={loadingPaymentPlans}>
                  <option value="">{loadingPaymentPlans ? "Loading..." : "Select Payment Term"}</option>
                  {paymentPlans.map((pt: PaymentPlanType) => <option key={pt.plan_id} value={String(pt.plan_id)}>{pt.plan_name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="deposit" className={labelClass}>Deposit Amount (₹)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee className={iconClass} /></div>
                <input type="number" name="deposit" id="deposit" value={formData.deposit || ''} onChange={handleChange} className={`${inputClass} pl-10`} step="0.01" min="0"/>
              </div>
              {formErrors.deposit && <p className="text-xs text-red-500 mt-1">{formErrors.deposit}</p>}
            </div>

            <div className="md:col-span-2">
                <label className={labelClass}>Calculated Total Rental Amount</label>
                <p className="mt-1 px-3 py-2 bg-light-gray-100 border border-light-gray-300 rounded-md text-dark-text/80 sm:text-sm flex items-center font-semibold text-green-700">
                   <DollarSign size={18} className="mr-2"/> {formatCurrency(calculatedTotalAmount)}
                </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className={labelClass}>Notes</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 top-2 pl-3 flex items-start pointer-events-none"><Info className={iconClass} /></div>
                <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={`${inputClass} pl-10`}></textarea>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end items-center pt-6 border-t border-light-gray-200 mt-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={crudLoading || loadingCustomers || loadingPaymentPlans || loadingEquipment}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
            >
              <X className="inline h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={crudLoading || loadingCustomers || loadingPaymentPlans || loadingEquipment}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
            >
              {crudLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="inline h-4 w-4 mr-1" />
              )}
              {isEditing ? 'Save Changes' : 'Create Rental'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalTransactionForm;
