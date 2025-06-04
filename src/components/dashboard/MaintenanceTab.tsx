import React, { useState, useEffect } from 'react';
import { useMaintenanceRecords } from '../../context/MaintenanceRecordContext';
import { useCrud } from '../../context/CrudContext';
import MaintenanceRecordList from '../MaintenanceRecordList';
import MaintenanceRecordForm from '../MaintenanceRecordForm';
import SearchBox from '../ui/SearchBox';
import ConfirmationModal from '../ui/ConfirmationModal';
import { PlusCircle, ListChecks } from 'lucide-react';
import { MaintenanceRecord, MaintenanceRecordFormData } from '../../types';

interface MaintenanceTabProps {
  initialEquipmentIdFilter?: string | null;
  navigateToEquipmentDetail: (equipmentId: number) => void;
}

const maintenanceTypesForFilter = ['Routine', 'Repair', 'Inspection', 'Upgrade', 'Calibration', 'Emergency'];

const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  initialEquipmentIdFilter,
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

  const { createItem, updateItem, deleteItem, loading: crudLoading } = useCrud();

  const [activeMaintenanceSubTab, setActiveMaintenanceSubTab] = useState('list');
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [editingMaintenanceRecord, setEditingMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (equipmentListForFilter.length === 0 && !loadingEquipmentList) {
      fetchEquipmentListForFilter();
    }
  }, [equipmentListForFilter.length, loadingEquipmentList, fetchEquipmentListForFilter]);

  useEffect(() => {
    if (initialEquipmentIdFilter) {
      setMaintenanceFilters({ equipment_id: initialEquipmentIdFilter, maintenance_type: null });
      setMaintenanceSearchQuery('');
    }
  }, [initialEquipmentIdFilter, setMaintenanceFilters, setMaintenanceSearchQuery]);

  const maintenanceSubTabsData = [
    { id: 'list', label: 'Records List', icon: <ListChecks size={16} /> },
  ];

  const handleOpenMaintenanceFormForCreate = () => {
    setEditingMaintenanceRecord(null);
    setIsMaintenanceFormOpen(true);
  };

  const handleOpenMaintenanceFormForEdit = (record: MaintenanceRecord) => {
    setEditingMaintenanceRecord(record);
    setIsMaintenanceFormOpen(true);
  };

  const handleCloseMaintenanceForm = () => {
    setIsMaintenanceFormOpen(false);
    setEditingMaintenanceRecord(null);
    setActiveMaintenanceSubTab('list');
  };

  const handleSaveMaintenanceForm = async (data: MaintenanceRecordFormData) => {
    const apiData: any = {
      ...data,
      cost: data.cost ? parseFloat(data.cost) : null,
      equipment_id: parseInt(String(data.equipment_id), 10),
    };
    if (apiData.maintenance_type === '') apiData.maintenance_type = null;
    if (apiData.technician === '') apiData.technician = null;
    if (apiData.notes === '') apiData.notes = null;

    try {
      if (editingMaintenanceRecord && editingMaintenanceRecord.maintenance_id) {
        await updateItem('maintenance_records', editingMaintenanceRecord.maintenance_id, apiData);
      } else {
        await createItem('maintenance_records', apiData);
      }
      refreshMaintenanceRecords();
      handleCloseMaintenanceForm();
    } catch (error) {
      console.error("Failed to save maintenance record:", error);
    }
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
                setIsMaintenanceFormOpen(false);
                setEditingMaintenanceRecord(null);
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

      {activeMaintenanceSubTab === 'list' && !isMaintenanceFormOpen && (
        <>
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label htmlFor="maintenanceSearch" className="block text-sm font-medium text-dark-text mb-1">Search Records</label>
                <SearchBox
                  value={maintenanceSearchQuery}
                  onChange={setMaintenanceSearchQuery}
                  placeholder="Search by technician, notes..."
                />
              </div>
              <div>
                <label htmlFor="maintenanceTypeFilter" className="block text-sm font-medium text-dark-text mb-1">Maintenance Type</label>
                <select
                  id="maintenanceTypeFilter"
                  name="maintenance_type"
                  value={maintenanceFilters.maintenance_type || 'all'}
                  onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, maintenance_type: e.target.value === 'all' ? null : e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
                >
                  <option value="all">All Types</option>
                  {maintenanceTypesForFilter.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="maintenanceEquipmentFilter" className="block text-sm font-medium text-dark-text mb-1">Equipment</label>
                <select
                  id="maintenanceEquipmentFilter"
                  name="equipment_id"
                  value={maintenanceFilters.equipment_id || 'all'}
                  onChange={(e) => setMaintenanceFilters({ ...maintenanceFilters, equipment_id: e.target.value === 'all' ? null : e.target.value })}
                  disabled={loadingEquipmentList}
                  className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
                >
                  <option value="all">{loadingEquipmentList ? "Loading Equipment..." : "All Equipment"}</option>
                  {!loadingEquipmentList && equipmentListForFilter.map(eq => (
                    <option key={eq.equipment_id} value={String(eq.equipment_id)}>{eq.equipment_name} ({eq.serial_number || 'N/A'})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <button onClick={handleOpenMaintenanceFormForCreate} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
              <PlusCircle className="h-5 w-5 mr-2" />Add New Record
            </button>
          </div>
          <MaintenanceRecordList
            onEditRecord={handleOpenMaintenanceFormForEdit}
            onDeleteRecord={handleDeleteRecordClick} // This now correctly matches the expected signature
            onViewEquipmentDetail={navigateToEquipmentDetail}
          />
        </>
      )}

      {isMaintenanceFormOpen && (
        <MaintenanceRecordForm
          record={editingMaintenanceRecord ? {
            equipment_id: String(editingMaintenanceRecord.equipment_id),
            maintenance_date: editingMaintenanceRecord.maintenance_date,
            maintenance_type: editingMaintenanceRecord.maintenance_type || '',
            technician: editingMaintenanceRecord.technician || '',
            cost: editingMaintenanceRecord.cost !== null ? String(editingMaintenanceRecord.cost) : '',
            notes: editingMaintenanceRecord.notes || '',
          } : undefined}
          onSave={handleSaveMaintenanceForm}
          onCancel={handleCloseMaintenanceForm}
          isEditMode={!!editingMaintenanceRecord}
        />
      )}

       <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        title="Delete Maintenance Record"
        message={`Are you sure you want to delete the maintenance record for "${recordToDelete?.equipment_name || `ID: ${recordToDelete?.equipment_id}`}" on ${recordToDelete?.maintenance_date}? This action cannot be undone.`}
        onConfirm={confirmDeleteRecord}
        onCancel={() => setIsConfirmDeleteModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default MaintenanceTab;
