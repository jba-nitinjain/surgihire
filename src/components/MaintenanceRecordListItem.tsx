import React from 'react';
import { MaintenanceRecord, Equipment } from '../types'; // Added Equipment type
import { formatDate, formatCurrency } from '../utils/formatting'; // Import utilities
import { Edit3, Trash2, ExternalLink } from 'lucide-react';

interface MaintenanceRecordListItemProps {
  record: MaintenanceRecord;
  equipmentList: Equipment[]; // Pass the full equipment list for name lookup
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (recordId: number) => void;
  onViewEquipmentDetail: (equipmentId: number) => void; // Callback to view equipment detail
}

const MaintenanceRecordListItem: React.FC<MaintenanceRecordListItemProps> = ({
  record,
  equipmentList,
  onEdit,
  onDelete,
  onViewEquipmentDetail,
}) => {
  // Function to find equipment name from the list
  const getEquipmentName = (equipmentId: number): string => {
    if (record.equipment_name) {
      return record.equipment_name; // Use if already populated
    }
    const equipment = equipmentList.find(eq => eq.equipment_id === equipmentId);
    return equipment ? equipment.equipment_name : `ID: ${equipmentId}`; // Fallback to ID if name not found
  };

  const equipmentDisplayName = getEquipmentName(record.equipment_id);

  return (
    <tr className="hover:bg-light-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <button
          onClick={() => onViewEquipmentDetail(record.equipment_id)}
          className="text-brand-blue hover:text-brand-blue/80 hover:underline flex items-center"
          title={`View details for ${equipmentDisplayName}`}
        >
          {equipmentDisplayName}
          <ExternalLink size={14} className="ml-1 opacity-70" />
        </button>
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
