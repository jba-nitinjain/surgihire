import React, { useState, useEffect } from 'react';
import { EquipmentCategory, EquipmentCategoryFormData } from '../../types';
import { useCrud } from '../../context/CrudContext';
import { Save, X, Loader2, Tag, Info } from 'lucide-react';

interface EquipmentCategoryFormProps {
  category?: EquipmentCategory | null;
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: EquipmentCategoryFormData = {
  category_name: '',
  description: '',
};

const EquipmentCategoryForm: React.FC<EquipmentCategoryFormProps> = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EquipmentCategoryFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EquipmentCategoryFormData, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || '',
        description: category.description || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [category]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EquipmentCategoryFormData, string>> = {};
    if (!formData.category_name.trim()) {
      errors.category_name = 'Category name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof EquipmentCategoryFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const apiData = { ...formData };
     if (apiData.description === '') {
        // apiData.description = null; // Or undefined, depending on API preference for empty optional fields
    }


    try {
      if (category && category.category_id) {
        await updateItem('equipment_categories', category.category_id, apiData);
      } else {
        await createItem('equipment_categories', apiData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save equipment category:', err);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm";
  const labelClass = "block text-sm font-medium text-dark-text";
  const iconClass = "h-5 w-5 text-gray-400";


  return (
    <div className="bg-white rounded-lg shadow max-w-lg mx-auto">
      <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
        <h2 className="text-xl font-semibold text-brand-blue flex items-center">
          <Tag className="h-6 w-6 mr-2 text-brand-blue" />
          {category ? 'Edit Equipment Category' : 'Add New Equipment Category'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
          <X className="h-5 w-5 text-dark-text" />
        </button>
      </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Error Saving Category</p>
              <p>{crudError}</p>
            </div>
          )}

          <div>
            <label htmlFor="category_name" className={labelClass}>Category Name <span className="text-red-500">*</span></label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className={iconClass} /></div>
                <input type="text" name="category_name" id="category_name" value={formData.category_name} onChange={handleChange} className={`${inputClass} pl-10`} required />
            </div>
            {formErrors.category_name && <p className="text-xs text-red-500 mt-1">{formErrors.category_name}</p>}
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
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default EquipmentCategoryForm;
