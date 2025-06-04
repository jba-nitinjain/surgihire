import React from 'react';
import { MaintenanceRecord } from '../types';
import MaintenanceRecordListItem from './MaintenanceRecordListItem';
import { useMaintenanceRecords } from '../context/MaintenanceRecordContext';
import Spinner from './ui/Spinner';
import Pagination from './ui/Pagination';
import EmptyState from './ui/EmptyState';
import ErrorDisplay from './ui/ErrorDisplay';
import { Wrench } from 'lucide-react';

interface MaintenanceRecordListProps {
  onEditRecord: (record: MaintenanceRecord) => void;
  onDeleteRecord: (recordId: number) => void;
  onViewEquipmentDetail: (equipmentId: number) => void; // New prop
  // initialFilters is handled within MaintenanceTab now
}

const MaintenanceRecordList: React.FC<MaintenanceRecordListProps> = ({
  onEditRecord,
  onDeleteRecord,
  onViewEquipmentDetail,
}) => {
  const {
    maintenanceRecords,
    loading,
    error,
    totalRecords,
    currentPage,
    fetchMaintenanceRecordsPage,
    refreshMaintenanceRecords,
    searchQuery,
    filters, // To determine if a filter is active for EmptyState message
    equipmentListForFilter, // Get the equipment list from context
    loadingEquipmentList,
  } = useMaintenanceRecords();

  const recordsPerPage = 10; // Should match context or be a shared const
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Show main loading spinner if both records and equipment list are loading initially
  if (loading && maintenanceRecords.length === 0 && !searchQuery && loadingEquipmentList) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshMaintenanceRecords} />;
  }

  if (!loading && !loadingEquipmentList && maintenanceRecords.length === 0) {
    const isFiltered = (filters.equipment_id && filters.equipment_id !== 'all') ||
                       (filters.maintenance_type && filters.maintenance_type !== 'all') ||
                       searchQuery.trim() !== '';
    return (
      <EmptyState
        title={isFiltered ? "No records match your search/filters" : "No Maintenance Records Found"}
        message={isFiltered ? "Try adjusting your search or filters." : "Get started by adding a new maintenance record."}
        icon={<Wrench className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-gray-200">
          <thead className="bg-light-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Equipment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Technician</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Cost</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Notes</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-light-gray-200">
            {/* Show a loading indicator for equipment names if equipment list is still loading but records are present */}
            {loadingEquipmentList && maintenanceRecords.length > 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-sm text-gray-500">
                  <Spinner size="sm" /> Loading equipment details...
                </td>
              </tr>
            )}
            {!loadingEquipmentList && maintenanceRecords.map(record => (
              <MaintenanceRecordListItem
                key={record.maintenance_id}
                record={record}
                equipmentList={equipmentListForFilter} // Pass the equipment list
                onEdit={onEditRecord}
                onDelete={onDeleteRecord}
                onViewEquipmentDetail={onViewEquipmentDetail} // Pass the new callback
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Show loading spinner at the bottom if loading more pages */}
      {loading && maintenanceRecords.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchMaintenanceRecordsPage}
          />
        </div>
      )}
    </div>
  );
};

export default MaintenanceRecordList;
