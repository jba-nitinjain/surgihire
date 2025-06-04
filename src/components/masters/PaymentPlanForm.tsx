import React, { useState, useEffect } from 'react';
import { PaymentPlan, PaymentPlanFormData } from '../../types';
import { useCrud } from '../../context/CrudContext';
import { Save, X, Loader2, ListChecks, Info, CalendarClock } from 'lucide-react';

interface PaymentPlanFormProps {
  plan?: PaymentPlan | null;
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: PaymentPlanFormData = {
  plan_name: '',
  description: '',
  frequency_in_days: '',
};

const PaymentPlanForm: React.FC<PaymentPlanFormProps> = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PaymentPlanFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentPlanFormData, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();

  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name || '',
        description: plan.description || '',
        frequency_in_days: plan.frequency_in_days !== null ? String(plan.frequency_in_days) : '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [plan]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PaymentPlanFormData, string>> = {};
    if (!formData.plan_name.trim()) {
      errors.plan_name = 'Plan name is required.';
    }
    if (formData.frequency_in_days) {
      const freq = parseInt(formData.frequency_in_days, 10);
      if (isNaN(freq) || freq <= 0) {
        errors.frequency_in_days = 'Frequency must be a positive number.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof PaymentPlanFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const apiData: any = { ...formData };
    if (apiData.frequency_in_days && apiData.frequency_in_days !== '') {
      apiData.frequency_in_days = parseInt(apiData.frequency_in_days, 10);
    } else {
      apiData.frequency_in_days = null; // Or undefined, based on API
    }
    if (apiData.description === '') {
        // apiData.description = null; // Or undefined
    }


    try {
      if (plan && plan.plan_id) {
        await updateItem('payment_plans', plan.plan_id, apiData);
      } else {
        await createItem('payment_plans', apiData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save payment plan:', err);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm";
  const labelClass = "block text-sm font-medium text-dark-text";
  const iconClass = "h-5 w-5 text-gray-400";

  return (
    <div className="bg-white rounded-lg shadow max-w-lg mx-auto">
      <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
        <h2 className="text-xl font-semibold text-brand-blue flex items-center">
          <ListChecks className="h-6 w-6 mr-2 text-brand-blue" />
          {plan ? 'Edit Payment Plan' : 'Add New Payment Plan'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
          <X className="h-5 w-5 text-dark-text" />
        </button>
      </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Error Saving Plan</p>
              <p>{crudError}</p>
            </div>
          )}

          <div>
            <label htmlFor="plan_name" className={labelClass}>Plan Name <span className="text-red-500">*</span></label>
             <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ListChecks className={iconClass} /></div>
                <input type="text" name="plan_name" id="plan_name" value={formData.plan_name} onChange={handleChange} className={`${inputClass} pl-10`} required />
            </div>
            {formErrors.plan_name && <p className="text-xs text-red-500 mt-1">{formErrors.plan_name}</p>}
          </div>

          <div>
            <label htmlFor="frequency_in_days" className={labelClass}>Frequency (in days)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarClock className={iconClass} /></div>
                <input type="number" name="frequency_in_days" id="frequency_in_days" value={formData.frequency_in_days || ''} onChange={handleChange} className={`${inputClass} pl-10`} min="1" />
            </div>
            {formErrors.frequency_in_days && <p className="text-xs text-red-500 mt-1">{formErrors.frequency_in_days}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 top-2 pl-3 flex items-start pointer-events-none"><Info className={iconClass} /></div>
                <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={4} className={`${inputClass} pl-10`}></textarea>
            </div>
          </div>


          <div className="flex justify-end items-center pt-6 border-t border-light-gray-200 mt-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={crudLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
            >
              <X className="inline h-4 w-4 mr-1" /> Cancel
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
              {plan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default PaymentPlanForm;
