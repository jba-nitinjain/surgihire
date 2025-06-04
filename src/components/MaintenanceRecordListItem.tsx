import React from 'react';
import { MaintenanceRecord } from '../types';

interface MaintenanceRecordListItemProps {
  record: MaintenanceRecord;
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (recordId: number) => void;
}

const MaintenanceRecordListItem: React.FC<MaintenanceRecordListItemProps> = ({ record, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.equipment_name || record.equipment_id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.maintenance_date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.maintenance_type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.technician}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.cost !== null ? `$${record.cost.toFixed(2)}` : 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{record.notes}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(record)}
          className="text-indigo-600 hover:text-indigo-900 mr-3"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(record.maintenance_id)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default MaintenanceRecordListItem;