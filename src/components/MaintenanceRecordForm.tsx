import React, { useState, useEffect } from 'react';
import { MaintenanceRecordFormData, Equipment } from '../types';
import { fetchEquipment } from '../services/api';

interface MaintenanceRecordFormProps {
  record?: MaintenanceRecordFormData;
  onSave: (data: MaintenanceRecordFormData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

const MaintenanceRecordForm: React.FC<MaintenanceRecordFormProps> = ({ record, onSave, onCancel, isEditMode = false }) => {
  const [formData, setFormData] = useState<MaintenanceRecordFormData>(record || {
    equipment_id: '',
    maintenance_date: '',
    maintenance_type: '',
    technician: '',
    cost: '',
    notes: '',
  });
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getEquipment = async () => {
      try {
        const response = await fetchEquipment({ records: 500, skip: 0 });
        if (response.success && Array.isArray(response.data)) {
          setEquipmentList(response.data as Equipment[]);
        } else {
          setError('Failed to fetch equipment list.');
        }
      } catch (err) {
        setError('Error fetching equipment list.');
      } finally {
        setLoadingEquipment(false);
      }
    };
    getEquipment();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">{isEditMode ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700">Equipment</label>
          <select
            id="equipment_id"
            name="equipment_id"
            value={formData.equipment_id}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Equipment</option>
            {loadingEquipment ? (
              <option value="">Loading...</option>
            ) : error ? (
              <option value="">Error loading equipment</option>
            ) : (
              equipmentList.map(equipment => (
                <option key={equipment.equipment_id} value={equipment.equipment_id}>
                  {equipment.equipment_name} ({equipment.serial_number})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="maintenance_date" className="block text-sm font-medium text-gray-700">Maintenance Date</label>
          <input
            type="date"
            id="maintenance_date"
            name="maintenance_date"
            value={formData.maintenance_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="maintenance_type" className="block text-sm font-medium text-gray-700">Maintenance Type</label>
          <input
            type="text"
            id="maintenance_type"
            name="maintenance_type"
            value={formData.maintenance_type || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="technician" className="block text-sm font-medium text-gray-700">Technician</label>
          <input
            type="text"
            id="technician"
            name="technician"
            value={formData.technician || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost</label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost || ''}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isEditMode ? 'Update Record' : 'Add Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceRecordForm;