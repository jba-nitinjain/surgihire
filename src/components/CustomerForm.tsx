import React, { useState, useEffect, useRef } from 'react';
import { Customer, CustomerFormData } from '../types';
import { useCrud } from '../context/CrudContext';
import { Save, X, Loader2 } from 'lucide-react';
import CustomerPersonalInfoSection from './customers/CustomerPersonalInfoSection';
import CustomerShippingInfoSection from './customers/CustomerShippingInfoSection';
import usePincodeLookup from '../utils/usePincodeLookup';

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

  const originalPincodeRef = useRef<string>(customer?.shipping_pincode || '');
  const [lookupPincode, setLookupPincode] = useState('');

  const {
    loading: pincodeDetailsLoading,
    error: pincodeError,
    areaOptions,
    city: pincodeCity,
    state: pincodeState,
    isAreaSelect,
  } = usePincodeLookup(lookupPincode);

  useEffect(() => {
    if (customer) {
      originalPincodeRef.current = customer.shipping_pincode || '';
      setLookupPincode('');
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
    } else {
      originalPincodeRef.current = '';
      setLookupPincode('');
      setFormData(initialFormData);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'shipping_pincode') {
      if (value !== originalPincodeRef.current) {
        setLookupPincode(value);
        setFormData(prev => ({
          ...prev,
          shipping_pincode: value,
          shipping_area: '',
          shipping_city: '',
          shipping_state: '',
        }));
      } else {
        setLookupPincode('');
        setFormData(prev => ({ ...prev, shipping_pincode: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name as keyof CustomerFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
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

  useEffect(() => {
    if (!lookupPincode) {
      return;
    }
    setFormData(prev => {
      let area = prev.shipping_area;
      if (areaOptions.length === 1 && !isAreaSelect) {
        area = areaOptions[0].value;
      } else if (areaOptions.length === 0) {
        area = '';
      }
      if (
        prev.shipping_city === pincodeCity &&
        prev.shipping_state === pincodeState &&
        prev.shipping_area === area
      ) {
        return prev;
      }
      return {
        ...prev,
        shipping_city: pincodeCity,
        shipping_state: pincodeState,
        shipping_area: area,
      };
    });
  }, [lookupPincode, pincodeCity, pincodeState, areaOptions, isAreaSelect]);


  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm";
  const labelClass = "block text-sm font-medium text-dark-text";

  return (
    <div className="bg-white w-full">
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
          
          <CustomerPersonalInfoSection
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <CustomerShippingInfoSection
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            pincodeDetailsLoading={pincodeDetailsLoading}
            pincodeError={pincodeError}
            areaOptions={areaOptions}
            isAreaSelect={isAreaSelect}
            inputClass={inputClass}
            labelClass={labelClass}
          />
          
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
  );
};

export default CustomerForm;
