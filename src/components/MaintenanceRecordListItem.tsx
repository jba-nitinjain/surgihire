import React from 'react';
import { MaintenanceRecord } from '../types';
import { formatDate, formatCurrency } from '../utils/formatting'; // Import formatting utilities
import { Edit3, Trash2 } from 'lucide-react'; // Assuming Loader2 is handled by parent during delete

interface MaintenanceRecordListItemProps {
  record: MaintenanceRecord;
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (recordId: number) => void; // Changed to pass ID for consistency
}

const MaintenanceRecordListItem: React.FC<MaintenanceRecordListItemProps> = ({ record, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-light-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {record.equipment_name || `ID: ${record.equipment_id}`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(record.maintenance_date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.maintenance_type || <span className="italic text-gray-400">N/A</span>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.technician || <span className="italic text-gray-400">N/A</span>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(record.cost)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={record.notes || undefined}>
        {record.notes || <span className="italic text-gray-400">No notes</span>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button
          onClick={() => onEdit(record)}
          className="text-brand-blue hover:text-brand-blue/80 p-1 rounded hover:bg-brand-blue/10"
          title="Edit Record"
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={() => onDelete(record.maintenance_id)}
          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
          title="Delete Record"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default MaintenanceRecordListItem;
