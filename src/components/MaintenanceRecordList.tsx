import React from 'react';
import { MaintenanceRecord } from '../types';
import MaintenanceRecordListItem from './MaintenanceRecordListItem';
import { useMaintenanceRecords } from '../context/MaintenanceRecordContext'; // Assuming context provides these

interface MaintenanceRecordListProps {
  onEditRecord: (record: MaintenanceRecord) => void;
  onDeleteRecord: (recordId: number) => void;
  initialFilters?: { equipment_id?: string; maintenance_type?: string };
}

const MaintenanceRecordList: React.FC<MaintenanceRecordListProps> = ({ onEditRecord, onDeleteRecord, initialFilters }) => {
  const { maintenanceRecords, loading, error, setFilters } = useMaintenanceRecords();

  React.useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
    // Optional: Clear filters when component unmounts or initialFilters are removed
    // return () => {
    //   if (initialFilters) { // Only clear if they were set by this instance
    //      setFilters({}); // Or set to default filters
    //   }
    // };
  }, [initialFilters, setFilters]);

  if (loading) {
    return <div className="p-4 text-center">Loading maintenance records...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!maintenanceRecords || maintenanceRecords.length === 0) {
    return <div className="p-4 text-center text-gray-500">No maintenance records found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {maintenanceRecords.map(record => (
            <MaintenanceRecordListItem
              key={record.maintenance_id}
              record={record}
              onEdit={onEditRecord}
              onDelete={onDeleteRecord}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceRecordList;