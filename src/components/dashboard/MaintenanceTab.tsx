import React, { useState, useEffect } from 'react';
import { useMaintenanceRecords } from '../../context/MaintenanceRecordContext';
import { useCrud } from '../../context/CrudContext';
import MaintenanceRecordList from '../MaintenanceRecordList';
import MaintenanceFilterBar from './MaintenanceFilterBar';
import DeleteMaintenanceModal from './DeleteMaintenanceModal';
import { PlusCircle, ListChecks } from 'lucide-react';
import { MaintenanceRecord } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface MaintenanceTabProps {
  navigateToEquipmentDetail: (equipmentId: number) => void;
}


const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  navigateToEquipmentDetail,
}) => {
  const {
    maintenanceRecords, // Get the full list of records to find the one to delete
    searchQuery: maintenanceSearchQuery,
    setSearchQuery: setMaintenanceSearchQuery,
    refreshMaintenanceRecords,
    filters: maintenanceFilters,
    setFilters: setMaintenanceFilters,
    fetchEquipmentListForFilter,
    equipmentListForFilter,
    loadingEquipmentList,
  } = useMaintenanceRecords();

  const { deleteItem, loading: crudLoading } = useCrud();

  const [activeMaintenanceSubTab, setActiveMaintenanceSubTab] = useState('list');
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation() as { state?: { equipmentId?: string } };

  useEffect(() => {
    if (equipmentListForFilter.length === 0 && !loadingEquipmentList) {
      fetchEquipmentListForFilter();
    }
  }, [equipmentListForFilter.length, loadingEquipmentList, fetchEquipmentListForFilter]);

  useEffect(() => {
    if (location.state?.equipmentId) {
      setMaintenanceFilters({ equipment_id: location.state.equipmentId, maintenance_type: null });
      setMaintenanceSearchQuery('');
      navigate('/maintenance', { replace: true });
    }
  }, [location.state, setMaintenanceFilters, setMaintenanceSearchQuery, navigate]);

  const maintenanceSubTabsData = [
    { id: 'list', label: 'Records List', icon: <ListChecks size={16} /> },
  ];

  const handleOpenMaintenanceFormForCreate = () => {
    navigate('/maintenance/new');
  };

  const handleOpenMaintenanceFormForEdit = (record: MaintenanceRecord) => {
    navigate(`/maintenance/${record.maintenance_id}/edit`, { state: { record } });
  };

  // Corrected handleDeleteRecordClick to accept recordId
  const handleDeleteRecordClick = (recordId: number) => {
    const recordToSet = maintenanceRecords.find(r => r.maintenance_id === recordId);
    if (recordToSet) {
      setRecordToDelete(recordToSet);
      setIsConfirmDeleteModalOpen(true);
    } else {
      console.error("Maintenance record not found for deletion:", recordId);
      // Optionally, show an error to the user if the record isn't found
    }
  };

  const confirmDeleteRecord = async () => {
    if (recordToDelete) {
      try {
        await deleteItem('maintenance_records', recordToDelete.maintenance_id);
        refreshMaintenanceRecords();
      } catch (error) {
        console.error("Failed to delete maintenance record:", error);
      } finally {
        setIsConfirmDeleteModalOpen(false);
        setRecordToDelete(null);
      }
    }
  };

  return (
    <>
      <div className="mb-6 border-b border-light-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Maintenance Tabs">
          {maintenanceSubTabsData.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => {
                setActiveMaintenanceSubTab(subTab.id);
              }}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeMaintenanceSubTab === subTab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-dark-text/70 hover:text-dark-text hover:border-gray-300'
                }`}
            >
              {subTab.icon && <span className="mr-2">{subTab.icon}</span>}
              {subTab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeMaintenanceSubTab === 'list' && (
          <>
            <MaintenanceFilterBar
              searchQuery={maintenanceSearchQuery}
              onSearchChange={setMaintenanceSearchQuery}
              filters={maintenanceFilters}
              onFiltersChange={setMaintenanceFilters}
              equipmentList={equipmentListForFilter}
              loadingEquipmentList={loadingEquipmentList}
            />

          <div className="mb-6 flex justify-end">
            <button onClick={handleOpenMaintenanceFormForCreate} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
              <PlusCircle className="h-5 w-5 mr-2" />Add New Record
            </button>
          </div>
          <MaintenanceRecordList
            onEditRecord={handleOpenMaintenanceFormForEdit}
            onDeleteRecord={handleDeleteRecordClick}
            onViewEquipmentDetail={navigateToEquipmentDetail}
          />
        </>
      )}

       <DeleteMaintenanceModal
        isOpen={isConfirmDeleteModalOpen}
        record={recordToDelete}
        onConfirm={confirmDeleteRecord}
        onCancel={() => setIsConfirmDeleteModalOpen(false)}
        isLoading={crudLoading}
      />
    </>
  );
};

export default MaintenanceTab;
