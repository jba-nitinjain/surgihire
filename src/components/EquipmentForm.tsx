import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentFormData, EquipmentCategory } from '../types'; 
import { useCrud } from '../context/CrudContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext'; 
import { Save, X, Loader2, Package } from 'lucide-react';
import EquipmentBasicInfo from './equipment/EquipmentBasicInfo';
import EquipmentIdentification from './equipment/EquipmentIdentification';
import EquipmentFinancial from './equipment/EquipmentFinancial';
import EquipmentDatesLocation from './equipment/EquipmentDatesLocation';

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: EquipmentFormData = {
  equipment_name: '',
  description: '',
  category_id: undefined, 
  model: '',
  make: '',
  serial_number: '',
  purchase_date: '', 
  rental_rate: '', 
  status: 'Available', 
  last_maintenance_date: '', 
  next_calibration_date: '', 
  location: 'Warehouse', 
  quantity: '1', 
};

const equipmentStatuses = ['Available', 'Rented', 'Maintenance', 'Decommissioned', 'Lost'];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipment, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EquipmentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EquipmentFormData, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();
  
  const { categories: equipmentCategories, loading: categoriesLoading, error: categoriesError, refreshCategories } = useEquipmentCategories();

  const isEditing = !!equipment; 

  useEffect(() => {
    if (equipmentCategories.length === 0 && !categoriesLoading && !categoriesError) { // Added !categoriesError to prevent multiple calls on error
        refreshCategories();
    }
  }, [equipmentCategories.length, categoriesLoading, categoriesError, refreshCategories]);


  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_name: equipment.equipment_name || '',
        description: equipment.description || '',
        category_id: equipment.category_id !== null ? equipment.category_id : undefined,
        model: equipment.model || '',
        make: equipment.make || '',
        serial_number: equipment.serial_number || '',
        purchase_date: equipment.purchase_date || '',
        rental_rate: equipment.rental_rate !== null ? String(equipment.rental_rate) : '',
        status: equipment.status || 'Available',
        last_maintenance_date: equipment.last_maintenance_date || '',
        next_calibration_date: equipment.next_calibration_date || '',
        location: equipment.location || 'Warehouse', 
        quantity: '1', 
      });
    } else {
      setFormData(initialFormData); 
    }
  }, [equipment]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EquipmentFormData, string>> = {};
    if (!formData.equipment_name.trim()) {
      errors.equipment_name = 'Equipment name is required.';
    }
    if (formData.rental_rate && isNaN(parseFloat(formData.rental_rate))) {
      errors.rental_rate = 'Rental rate must be a valid number.';
    } else if (formData.rental_rate && parseFloat(formData.rental_rate) < 0) {
      errors.rental_rate = 'Rental rate cannot be negative.';
    }
    if (formData.purchase_date && formData.purchase_date.trim() !== '' && isNaN(new Date(formData.purchase_date).getTime())) {
        errors.purchase_date = 'Invalid purchase date.';
    }
    if (!isEditing && formData.quantity) { 
        const qty = parseInt(formData.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            errors.quantity = 'Quantity must be a positive number.';
        }
        if (qty > 1 && !formData.serial_number?.trim()) {
            errors.serial_number = 'Serial number is required if quantity is more than 1 for generating unique serials.';
        }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | undefined | null = value;

    if (name === 'category_id') {
        processedValue = value === '' ? undefined : parseInt(value, 10);
    } else if (type === 'number' && (name === 'rental_rate' || name === 'quantity')) { 
        processedValue = value;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (formErrors[name as keyof EquipmentFormData]) {
        setFormErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const baseApiData: any = { ...formData };
    if (baseApiData.rental_rate && baseApiData.rental_rate !== '') {
      baseApiData.rental_rate = parseFloat(baseApiData.rental_rate);
    } else {
      baseApiData.rental_rate = null; 
    }
    if (baseApiData.category_id === undefined || baseApiData.category_id === '') {
        baseApiData.category_id = null;
    }
    
    const { quantity, ...itemDataForApi } = baseApiData;


    (Object.keys(itemDataForApi) as Array<keyof Omit<EquipmentFormData, 'quantity'>>).forEach(key => {
        if (itemDataForApi[key] === '') {
            if (key === 'purchase_date' || key === 'last_maintenance_date' || key === 'next_calibration_date') {
                itemDataForApi[key] = null; // Set empty date strings to null
            } else if (typeof itemDataForApi[key] === 'string') {
                 // itemDataForApi[key] = null; // For other optional string fields if API prefers null
            }
        }
    });

    try {
      if (isEditing && equipment && equipment.equipment_id) { 
        await updateItem('equipment', equipment.equipment_id, itemDataForApi);
      } else { 
        const qty = parseInt(quantity || '1', 10);
        if (qty > 1 && itemDataForApi.serial_number) {
          const promises = [];
          for (let i = 1; i <= qty; i++) {
            const individualItemData = {
              ...itemDataForApi,
              serial_number: `${itemDataForApi.serial_number}-${i}`,
            };
            promises.push(createItem('equipment', individualItemData));
          }
          await Promise.all(promises); 
        } else {
           const singleItemData = { ...itemDataForApi };
          await createItem('equipment', singleItemData);
        }
      }
      onSave();
    } catch (err) {
      console.error('Failed to save equipment:', err);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-light-gray-100";
  const labelClass = "block text-sm font-medium text-dark-text";
  const iconClass = "h-5 w-5 text-gray-400 mr-2";

  return (
    <div className="bg-white rounded-lg shadow max-w-3xl mx-auto">
      <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
        <h2 className="text-xl font-semibold text-brand-blue flex items-center">
          <Package className="h-6 w-6 mr-2 text-brand-blue" />
          {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
          <X className="h-5 w-5 text-dark-text" />
        </button>
      </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Error Saving Equipment</p>
              <p>{crudError}</p>
            </div>
          )}
          {categoriesError && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
                <p className="font-bold">Could not load categories</p>
                <p>{categoriesError}</p>
            </div>
          )}
          
          <EquipmentBasicInfo
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            equipmentCategories={equipmentCategories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            inputClass={inputClass}
            labelClass={labelClass}
            iconClass={iconClass}
          />

          <EquipmentIdentification
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            isEditing={isEditing}
            inputClass={inputClass}
            labelClass={labelClass}
            iconClass={iconClass}
          />

          <EquipmentFinancial
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            isEditing={isEditing}
            equipmentStatuses={equipmentStatuses}
            inputClass={inputClass}
            labelClass={labelClass}
            iconClass={iconClass}
          />

          <EquipmentDatesLocation
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            inputClass={inputClass}
            labelClass={labelClass}
            iconClass={iconClass}
          />
          
          <div className="flex justify-end items-center pt-6 border-t border-light-gray-200 mt-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={crudLoading || categoriesLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
            >
              <X className="inline h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={crudLoading || categoriesLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
            >
              {crudLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="inline h-4 w-4 mr-1" />
              )}
              {isEditing ? 'Save Changes' : 'Create Equipment'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default EquipmentForm;
