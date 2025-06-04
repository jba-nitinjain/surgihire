import React, { useState, useEffect } from 'react';
// Equipment type is not directly used in this component's logic after fetching equipmentListForFilter,
// as equipmentListForFilter itself is typed as Equipment[] in the context.
// If you were constructing Equipment objects here, you'd keep it. For now, it can be removed.
import { MaintenanceRecordFormData } from '../types';
import { useMaintenanceRecords } from '../context/MaintenanceRecordContext'; // To get equipment list
import { useCrud } from '../context/CrudContext'; // To get loading state from CRUD operations
import { Save, X, Loader2, Wrench, ChevronDown } from 'lucide-react';
import MaintenanceRecordInfo from './maintenance/MaintenanceRecordInfo';
import MaintenanceRecordExtra from './maintenance/MaintenanceRecordExtra';

interface MaintenanceRecordFormProps {
  record?: MaintenanceRecordFormData; // For editing
  onSave: (data: MaintenanceRecordFormData) => void; // Callback after successful save
  onCancel: () => void;
  isEditMode?: boolean;
}

const initialFormData: MaintenanceRecordFormData = {
  equipment_id: '',
  maintenance_date: '',
  maintenance_type: '',
  technician: '',
  cost: '',
  notes: '',
};

// Predefined maintenance types for the dropdown
const PREDEFINED_MAINTENANCE_TYPES = [
  "Routine Check",
  "Repair",
  "Calibration",
  "Inspection",
  "Preventive Maintenance",
  "Software Update",
  "Hardware Replacement",
];
const CUSTOM_MAINTENANCE_TYPE_KEY = "__custom__"; // Special key for "Other" option

const MaintenanceRecordForm: React.FC<MaintenanceRecordFormProps> = ({
  record,
  onSave,
  onCancel,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<MaintenanceRecordFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MaintenanceRecordFormData, string>>>({});

  // State for the maintenance type dropdown and custom input
  const [selectedDropdownMaintenanceType, setSelectedDropdownMaintenanceType] = useState<string>('');
  const [customMaintenanceTypeValue, setCustomMaintenanceTypeValue] = useState<string>('');

  const { equipmentListForFilter, loadingEquipmentList, fetchEquipmentListForFilter } = useMaintenanceRecords();
  const { loading: crudLoading, error: crudError } = useCrud();

  useEffect(() => {
    if (equipmentListForFilter.length === 0 && !loadingEquipmentList) {
      fetchEquipmentListForFilter();
    }
  }, [equipmentListForFilter, loadingEquipmentList, fetchEquipmentListForFilter]);

  useEffect(() => {
    if (record) {
      const existingType = record.maintenance_type || '';
      const isPredefined = PREDEFINED_MAINTENANCE_TYPES.includes(existingType);

      setFormData({
        equipment_id: record.equipment_id ? String(record.equipment_id) : '',
        maintenance_date: record.maintenance_date || '',
        maintenance_type: existingType, // This will be updated by the effect below
        technician: record.technician || '',
        cost: record.cost ? String(record.cost) : '',
        notes: record.notes || '',
      });

      if (isPredefined) {
        setSelectedDropdownMaintenanceType(existingType);
        setCustomMaintenanceTypeValue('');
      } else {
        setSelectedDropdownMaintenanceType(CUSTOM_MAINTENANCE_TYPE_KEY);
        setCustomMaintenanceTypeValue(existingType);
      }
    } else {
      setFormData(initialFormData);
      setSelectedDropdownMaintenanceType(''); // Reset dropdown
      setCustomMaintenanceTypeValue('');    // Reset custom input
    }
  }, [record]);

  // Effect to update formData.maintenance_type based on dropdown and custom input
  useEffect(() => {
    if (selectedDropdownMaintenanceType === CUSTOM_MAINTENANCE_TYPE_KEY) {
      setFormData(prev => ({ ...prev, maintenance_type: customMaintenanceTypeValue }));
    } else {
      setFormData(prev => ({ ...prev, maintenance_type: selectedDropdownMaintenanceType }));
    }
  }, [selectedDropdownMaintenanceType, customMaintenanceTypeValue]);


  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MaintenanceRecordFormData, string>> = {};
    if (!formData.equipment_id) {
      errors.equipment_id = 'Equipment is required.';
    }
    if (!formData.maintenance_date) {
      errors.maintenance_date = 'Maintenance date is required.';
    } else if (isNaN(new Date(formData.maintenance_date).getTime())) {
        errors.maintenance_date = 'Invalid maintenance date.';
    }
    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) {
      errors.cost = 'Cost must be a valid non-negative number.';
    }
    if (selectedDropdownMaintenanceType === CUSTOM_MAINTENANCE_TYPE_KEY && !customMaintenanceTypeValue.trim()) {
        errors.maintenance_type = 'Please specify the custom maintenance type.';
    } else if (!selectedDropdownMaintenanceType && !isEditMode && !formData.maintenance_type) { // Check formData.maintenance_type if dropdown isn't set
        // This logic might need refinement if maintenance_type is truly optional
        // errors.maintenance_type = 'Maintenance type is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDropdownMaintenanceType(value);
    if (value !== CUSTOM_MAINTENANCE_TYPE_KEY) {
      setCustomMaintenanceTypeValue(''); // Clear custom input if a predefined type is chosen
    }
    if (formErrors.maintenance_type) {
        setFormErrors(prev => ({ ...prev, maintenance_type: undefined }));
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMaintenanceTypeValue(e.target.value);
     if (formErrors.maintenance_type) {
        setFormErrors(prev => ({ ...prev, maintenance_type: undefined }));
    }
  };

  // Updated handleGenericChange to be more flexible with event types
  const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof MaintenanceRecordFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // formData.maintenance_type is already up-to-date due to the useEffect
    onSave(formData);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-light-gray-100";
  const labelClass = "block text-sm font-medium text-dark-text";
  const iconClass = "h-5 w-5 text-gray-400";

  return (
    <div className="bg-white rounded-lg shadow max-w-2xl mx-auto">
      <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
        <h2 className="text-xl font-semibold text-brand-blue flex items-center">
          <Wrench className="h-6 w-6 mr-2 text-brand-blue" />
          {isEditMode ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
          <X className="h-5 w-5 text-dark-text" />
        </button>
      </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Error Saving Record</p>
              <p>{crudError}</p>
            </div>
          )}

          <MaintenanceRecordInfo
            formData={formData}
            formErrors={formErrors}
            equipmentList={equipmentListForFilter}
            loadingEquipment={loadingEquipmentList}
            handleChange={handleGenericChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            {/* Maintenance Type Dropdown and Custom Input */}
            <div className="md:col-span-2">
              <label htmlFor="maintenance_type_dropdown" className={labelClass}>Maintenance Type</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wrench className={iconClass} /></div>
                <select
                  id="maintenance_type_dropdown"
                  name="maintenance_type_dropdown"
                  value={selectedDropdownMaintenanceType}
                  onChange={handleDropdownChange} // Specific handler for this dropdown
                  className={`${inputClass} pl-10 pr-8 appearance-none`}
                >
                  <option value="">Select Type...</option>
                  {PREDEFINED_MAINTENANCE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value={CUSTOM_MAINTENANCE_TYPE_KEY}>Other (Specify)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {formErrors.maintenance_type && selectedDropdownMaintenanceType !== CUSTOM_MAINTENANCE_TYPE_KEY && <p className="text-xs text-red-500 mt-1">{formErrors.maintenance_type}</p>}


              {selectedDropdownMaintenanceType === CUSTOM_MAINTENANCE_TYPE_KEY && (
                <div className="mt-2">
                  <label htmlFor="custom_maintenance_type" className={`${labelClass} text-xs`}>Specify Other Type:</label>
                  <input
                    type="text"
                    id="custom_maintenance_type"
                    name="custom_maintenance_type"
                    value={customMaintenanceTypeValue}
                    onChange={handleCustomInputChange} // Specific handler
                    placeholder="Enter custom maintenance type"
                    className={`${inputClass} pl-3`}
                  />
                   {formErrors.maintenance_type && <p className="text-xs text-red-500 mt-1">{formErrors.maintenance_type}</p>}
                </div>
              )}
            </div>
          </fieldset>

          <MaintenanceRecordExtra
            formData={formData}
            formErrors={formErrors}
            handleChange={handleGenericChange}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <div className="flex justify-end items-center pt-6 border-t border-light-gray-200 mt-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={crudLoading || loadingEquipmentList}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
            >
              <X className="inline h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={crudLoading || loadingEquipmentList}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
            >
              {crudLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="inline h-4 w-4 mr-1" />
              )}
              {isEditMode ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default MaintenanceRecordForm;
