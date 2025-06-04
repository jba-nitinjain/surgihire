import React, { useState, useEffect, useCallback } from 'react';
import { Customer, CustomerFormData, PincodeApiResponse, PostOffice } from '../types';
import { useCrud } from '../context/CrudContext';
import { Save, X, Loader2, Search } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer | null; // For editing, null/undefined for creating
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: CustomerFormData = {
  full_name: '',
  mobile_number_1: '',
  mobile_number_2: '',
  mobile_number_3: '',
  email: '',
  shipping_address: '',
  shipping_area: '',
  shipping_city: '',
  shipping_state: '',
  shipping_pincode: '',
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();

  // State for pincode lookup
  const [pincodeDetailsLoading, setPincodeDetailsLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [areaOptions, setAreaOptions] = useState<{ value: string; label: string }[]>([]);
  const [isAreaSelect, setIsAreaSelect] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        mobile_number_1: customer.mobile_number_1 || '',
        mobile_number_2: customer.mobile_number_2 || '',
        mobile_number_3: customer.mobile_number_3 || '',
        email: customer.email || '',
        shipping_address: customer.shipping_address || '',
        shipping_area: customer.shipping_area || '',
        shipping_city: customer.shipping_city || '',
        shipping_state: customer.shipping_state || '',
        shipping_pincode: customer.shipping_pincode || '',
      });
      // If editing, and there's a pincode, determine if area should be select or input
      // This might require re-fetching pincode details if area options are not stored,
      // or assuming that if shipping_area is set, it was correctly chosen.
      // For simplicity, we'll let it be a text input on edit unless pincode is changed.
      setIsAreaSelect(false); 
    } else {
      setFormData(initialFormData);
      setIsAreaSelect(false);
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CustomerFormData, string>> = {};
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required.';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid.';
    }
    if (formData.shipping_pincode && !/^\d{6}$/.test(formData.shipping_pincode)) {
        errors.shipping_pincode = 'Pincode must be 6 digits.';
    }
    if (formData.mobile_number_1 && formData.mobile_number_1.trim() && !/^\d{10}$/.test(formData.mobile_number_1)) {
        errors.mobile_number_1 = 'Mobile number must be 10 digits.';
    }
    if (isAreaSelect && !formData.shipping_area) {
        errors.shipping_area = 'Please select an area.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CustomerFormData]) {
        setFormErrors(prev => ({...prev, [name]: undefined}));
    }

    // If pincode is changed, reset related fields and area options
    if (name === 'shipping_pincode') {
        setFormData(prev => ({
            ...prev,
            shipping_area: '',
            shipping_city: '',
            shipping_state: '',
            [name]: value // ensure pincode itself is updated
        }));
        setIsAreaSelect(false);
        setAreaOptions([]);
        setPincodeError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const apiData = { ...formData };
      // Ensure null for empty optional fields if API expects null instead of ""
      for (const key in apiData) {
        if (apiData[key as keyof CustomerFormData] === '') {
          // apiData[key as keyof CustomerFormData] = null; // Uncomment if API prefers null
        }
      }

      if (customer && customer.customer_id) {
        await updateItem('customers', customer.customer_id, apiData);
      } else {
        await createItem('customers', apiData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save customer:', err);
    }
  };

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const fetchPincodeDetails = useCallback(async (pincode: string) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPincodeError(null); // Clear error if not a 6 digit pincode
      setFormData(prev => ({
        ...prev,
        shipping_area: prev.shipping_pincode === pincode ? prev.shipping_area : '', // Keep area if pincode hasn't changed from what caused options
        shipping_city: '',
        shipping_state: '',
      }));
      setIsAreaSelect(false);
      setAreaOptions([]);
      return;
    }

    setPincodeDetailsLoading(true);
    setPincodeError(null);
    setAreaOptions([]);
    setIsAreaSelect(false);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data: PincodeApiResponse = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        const firstPostOffice = postOffices[0];
        
        setFormData(prev => ({
          ...prev,
          shipping_city: firstPostOffice.District || '',
          shipping_state: firstPostOffice.State || '',
          // Set area if only one option, otherwise clear for selection
          shipping_area: postOffices.length === 1 ? firstPostOffice.Name || '' : '', 
        }));

        if (postOffices.length > 1) {
          setAreaOptions(postOffices.map(po => ({ value: po.Name, label: po.Name })));
          setIsAreaSelect(true);
        } else {
          setIsAreaSelect(false);
        }
      } else if (data && data[0] && (data[0].Status === 'Error' || data[0].Status === '404' || !data[0].PostOffice || data[0].PostOffice.length === 0) ) {
        setPincodeError(data[0].Message || 'Pincode not found or no post offices listed.');
         setFormData(prev => ({ ...prev, shipping_city: '', shipping_state: '', shipping_area: '' }));
      } else {
        setPincodeError('Invalid response from pincode API.');
        setFormData(prev => ({ ...prev, shipping_city: '', shipping_state: '', shipping_area: '' }));
      }
    } catch (err) {
      console.error("Pincode API error:", err);
      setPincodeError('Failed to fetch pincode details. Check network connection.');
      setFormData(prev => ({ ...prev, shipping_city: '', shipping_state: '', shipping_area: '' }));
    } finally {
      setPincodeDetailsLoading(false);
    }
  }, []); // No dependencies, it's a stable function

  const debouncedFetchPincodeDetails = useCallback(debounce(fetchPincodeDetails, 700), [fetchPincodeDetails]);

  useEffect(() => {
    if (formData.shipping_pincode && formData.shipping_pincode.length === 6) {
      debouncedFetchPincodeDetails(formData.shipping_pincode);
    } else {
      // Clear suggestions if pincode is not 6 digits
      setAreaOptions([]);
      setIsAreaSelect(false);
      // Optionally clear city/state if pincode is incomplete/invalid
      // setFormData(prev => ({ ...prev, shipping_city: '', shipping_state: '' }));
    }
  }, [formData.shipping_pincode, debouncedFetchPincodeDetails]);


  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm";
  const labelClass = "block text-sm font-medium text-dark-text";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
          <h2 className="text-xl font-semibold text-brand-blue">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
            <X className="h-5 w-5 text-dark-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p className="font-bold">Error saving data</p>
              <p>{crudError}</p>
            </div>
          )}
          
          <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full">Personal Information</legend>
            <div>
              <label htmlFor="full_name" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} required />
              {formErrors.full_name && <p className="text-xs text-red-500 mt-1">{formErrors.full_name}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className={inputClass} />
              {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="mobile_number_1" className={labelClass}>Mobile Number 1</label>
              <input type="tel" name="mobile_number_1" id="mobile_number_1" value={formData.mobile_number_1 || ''} onChange={handleChange} className={inputClass} />
               {formErrors.mobile_number_1 && <p className="text-xs text-red-500 mt-1">{formErrors.mobile_number_1}</p>}
            </div>
            <div>
              <label htmlFor="mobile_number_2" className={labelClass}>Mobile Number 2</label>
              <input type="tel" name="mobile_number_2" id="mobile_number_2" value={formData.mobile_number_2 || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label htmlFor="mobile_number_3" className={labelClass}>Mobile Number 3</label>
              <input type="tel" name="mobile_number_3" id="mobile_number_3" value={formData.mobile_number_3 || ''} onChange={handleChange} className={inputClass} />
            </div>
          </fieldset>

          <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full">Shipping Information</legend>
            <div className="md:col-span-2">
              <label htmlFor="shipping_address" className={labelClass}>Address Line</label>
              <textarea name="shipping_address" id="shipping_address" value={formData.shipping_address || ''} onChange={handleChange} rows={2} className={inputClass}></textarea>
            </div>
            
            <div>
              <label htmlFor="shipping_pincode" className={labelClass}>Pincode</label>
              <div className="relative">
                <input 
                    type="text" 
                    name="shipping_pincode" 
                    id="shipping_pincode" 
                    value={formData.shipping_pincode || ''} 
                    onChange={handleChange} 
                    className={inputClass} 
                    maxLength={6}
                />
                {pincodeDetailsLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                )}
              </div>
              {formErrors.shipping_pincode && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_pincode}</p>}
              {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
            </div>

            <div>
              <label htmlFor="shipping_area" className={labelClass}>Area</label>
              {isAreaSelect ? (
                <select name="shipping_area" id="shipping_area" value={formData.shipping_area || ''} onChange={handleChange} className={inputClass}>
                  <option value="">Select Area</option>
                  {areaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input type="text" name="shipping_area" id="shipping_area" value={formData.shipping_area || ''} onChange={handleChange} className={inputClass} readOnly={areaOptions.length > 0 && !isAreaSelect} />
              )}
              {formErrors.shipping_area && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_area}</p>}
            </div>

            <div>
              <label htmlFor="shipping_city" className={labelClass}>City</label>
              <input type="text" name="shipping_city" id="shipping_city" value={formData.shipping_city || ''} onChange={handleChange} className={inputClass} readOnly />
            </div>
            <div>
              <label htmlFor="shipping_state" className={labelClass}>State</label>
              <input type="text" name="shipping_state" id="shipping_state" value={formData.shipping_state || ''} onChange={handleChange} className={inputClass} readOnly />
            </div>
          </fieldset>
          
          <div className="flex justify-end items-center pt-4 border-t border-light-gray-200 mt-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={crudLoading || pincodeDetailsLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
            >
              <X className="inline h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={crudLoading || pincodeDetailsLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
            >
              {(crudLoading || pincodeDetailsLoading) ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="inline h-4 w-4 mr-1" />
              )}
              {customer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
