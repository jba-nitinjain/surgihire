import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentFormData, EquipmentCategory } from '../types'; 
import { useCrud } from '../context/CrudContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext'; 
import { Save, X, Loader2, Package, Tag, Hash, CalendarDays, MapPin, Info, Wrench, Layers, IndianRupee } from 'lucide-react'; // Changed DollarSign to IndianRupee
import Modal from './ui/Modal';

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
    <Modal
      title={(
        <span className="flex items-center">
          <Package className="h-6 w-6 mr-2 text-brand-blue" />
          {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
        </span>
      )}
      widthClasses="max-w-3xl"
      onClose={onCancel}
    >
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
          
          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Basic Information</legend>
            <div className="md:col-span-2">
              <label htmlFor="equipment_name" className={labelClass}>Equipment Name <span className="text-red-500">*</span></label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className={iconClass} /></div>
                <input type="text" name="equipment_name" id="equipment_name" value={formData.equipment_name} onChange={handleChange} className={`${inputClass} pl-10`} required />
              </div>
              {formErrors.equipment_name && <p className="text-xs text-red-500 mt-1">{formErrors.equipment_name}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClass}>Description</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 top-2 pl-3 flex items-start pointer-events-none"><Info className={iconClass} /></div>
                <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3} className={`${inputClass} pl-10`}></textarea>
              </div>
            </div>

            <div>
              <label htmlFor="category_id" className={labelClass}>Category</label>
               <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {categoriesLoading ? <Loader2 className={`${iconClass} animate-spin`} /> : <Tag className={iconClass} />}
                </div>
                <select 
                    name="category_id" 
                    id="category_id" 
                    value={formData.category_id === undefined ? '' : String(formData.category_id)} 
                    onChange={handleChange} 
                    className={`${inputClass} pl-10`}
                    disabled={categoriesLoading || !!categoriesError}
                >
                    <option value="">{categoriesLoading ? 'Loading...' : 'Select Category'}</option>
                    {equipmentCategories.map(cat => <option key={cat.category_id} value={String(cat.category_id)}>{cat.category_name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className={labelClass}>Status</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className={iconClass} /></div>
                <select name="status" id="status" value={formData.status || ''} onChange={handleChange} className={`${inputClass} pl-10`}>
                    {equipmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Identification, Quantity & Financials</legend>
            <div>
              <label htmlFor="make" className={labelClass}>Make/Brand</label>
              <input type="text" name="make" id="make" value={formData.make || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="model" className={labelClass}>Model</label>
              <input type="text" name="model" id="model" value={formData.model || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="serial_number" className={labelClass}>Serial Number {isEditing ? '(Editing specific item)' : '(Base for quantity)'}</label>
               <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash className={iconClass} /></div>
                <input type="text" name="serial_number" id="serial_number" value={formData.serial_number || ''} onChange={handleChange} className={`${inputClass} pl-10`} />
              </div>
              {formErrors.serial_number && <p className="text-xs text-red-500 mt-1">{formErrors.serial_number}</p>}
            </div>
            
            {!isEditing && ( 
                <div>
                    <label htmlFor="quantity" className={labelClass}>Quantity</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Layers className={iconClass}/></div>
                        <input type="number" name="quantity" id="quantity" value={formData.quantity || '1'} onChange={handleChange} className={`${inputClass} pl-10`} min="1" />
                    </div>
                    {formErrors.quantity && <p className="text-xs text-red-500 mt-1">{formErrors.quantity}</p>}
                </div>
            )}


            <div className={isEditing ? "md:col-span-2" : ""}> 
              <label htmlFor="rental_rate" className={labelClass}>Rental Rate (₹ per unit/day)</label> 
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee className={iconClass} /></div> {/* Changed icon */}
                <input type="number" name="rental_rate" id="rental_rate" value={formData.rental_rate || ''} onChange={handleChange} className={`${inputClass} pl-10`} step="0.01" min="0"/>
              </div>
              {formErrors.rental_rate && <p className="text-xs text-red-500 mt-1">{formErrors.rental_rate}</p>}
            </div>
          </fieldset>

          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Dates & Location</legend>
            <div>
              <label htmlFor="purchase_date" className={labelClass}>Purchase Date</label>
              <input type="date" name="purchase_date" id="purchase_date" value={formData.purchase_date || ''} onChange={handleChange} className={inputClass} />
               {formErrors.purchase_date && <p className="text-xs text-red-500 mt-1">{formErrors.purchase_date}</p>}
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>Current Location</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className={iconClass} /></div>
                <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label htmlFor="last_maintenance_date" className={labelClass}>Last Maintenance Date</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wrench className={iconClass} /></div>
                <input type="date" name="last_maintenance_date" id="last_maintenance_date" value={formData.last_maintenance_date || ''} onChange={handleChange} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label htmlFor="next_calibration_date" className={labelClass}>Next Calibration Date</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDays className={iconClass} /></div>
                <input type="date" name="next_calibration_date" id="next_calibration_date" value={formData.next_calibration_date || ''} onChange={handleChange} className={`${inputClass} pl-10`} />
              </div>
            </div>
          </fieldset>
          
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
    </Modal>
  );
};

export default EquipmentForm;
