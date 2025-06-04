import React from 'react';
import { useMaintenanceRecords } from '../../context/MaintenanceRecordContext';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext'; // For equipment filter dropdown
import MaintenanceRecordList from '../MaintenanceRecordList';
import MaintenanceRecordForm from '../MaintenanceRecordForm';
import SearchBox from '../ui/SearchBox';
import { PlusCircle, ListChecks } from 'lucide-react';
import { MaintenanceRecord } from '../../types';

interface MaintenanceTabProps {
  isMaintenanceFormOpen: boolean;
  setIsMaintenanceFormOpen: (isOpen: boolean) => void;
  editingMaintenanceRecord: MaintenanceRecord | null;
  setEditingMaintenanceRecord: (record: MaintenanceRecord | null) => void;
  activeMaintenanceSubTab: string;
  setActiveMaintenanceSubTab: (subTab: string) => void;
  viewingMaintenanceForEquipment: string | null;
}

const maintenanceTypesForFilter = ['Routine', 'Repair', 'Inspection', 'Upgrade', 'Calibration', 'Emergency'];

const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  isMaintenanceFormOpen,
  setIsMaintenanceFormOpen,
  editingMaintenanceRecord,
  setEditingMaintenanceRecord,
  activeMaintenanceSubTab,
  setActiveMaintenanceSubTab,
  viewingMaintenanceForEquipment,
}) => {
  const {
    searchQuery: maintenanceSearchQuery,
    setSearchQuery: setMaintenanceSearchQuery,
    refreshMaintenanceRecords,
    filters: maintenanceFilters,
    setFilters: setMaintenanceFilters,
  } = useMaintenanceRecords();

  const { loading: eqCategoriesLoadingForFilter } = useEquipmentCategories(); // Placeholder for equipment loading

  const maintenanceSubTabs = [
    { id: 'list', label: 'Records List', icon: <ListChecks size={16} /> },
    { id: 'form', label: 'Add New Record', icon: <PlusCircle size={16} /> },
  ];

  const handleOpenMaintenanceFormForCreate = () => { setEditingMaintenanceRecord(null); setIsMaintenanceFormOpen(true); setActiveMaintenanceSubTab('form'); };
  const handleOpenMaintenanceFormForEdit = (record: MaintenanceRecord) => { setEditingMaintenanceRecord(record); setIsMaintenanceFormOpen(true); setActiveMaintenanceSubTab('form'); };
  const handleCloseMaintenanceForm = () => { setIsMaintenanceFormOpen(false); setEditingMaintenanceRecord(null); setActiveMaintenanceSubTab('list'); };
  const handleSaveMaintenanceForm = () => { handleCloseMaintenanceForm(); refreshMaintenanceRecords(); };

  return (
    <>
      {isMaintenanceFormOpen ? (
        <MaintenanceRecordForm
          record={editingMaintenanceRecord ? { ...editingMaintenanceRecord, equipment_id: String(editingMaintenanceRecord.equipment_id), cost: String(editingMaintenanceRecord.cost) } : undefined}
          onSave={handleSaveMaintenanceForm}
          onCancel={handleCloseMaintenanceForm}
          isEditMode={!!editingMaintenanceRecord}
        />
      ) : (
        <>
          <div className="mb-6 border-b border-light-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {maintenanceSubTabs.map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => {
                    setActiveMaintenanceSubTab(subTab.id);
                    if (subTab.id === 'form') {
                      handleOpenMaintenanceFormForCreate();
                    } else {
                      setIsMaintenanceFormOpen(false); // Ensure form closes if navigating back to list via subtab
                    }
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
              {/* Maintenance Filters UI */}
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
                      onChange={(e) => setMaintenanceFilters({ maintenance_type: e.target.value === 'all' ? null : e.target.value })}
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
                      onChange={(e) => setMaintenanceFilters({ equipment_id: e.target.value === 'all' ? null : e.target.value })}
                      disabled={eqCategoriesLoadingForFilter} // Placeholder, ideally use a loading state for equipment list if fetched separately for filters
                      className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
                    >
                      <option value="all">All Equipment</option>
                      {/* Populate with equipment options if available */}
                      {/* Example: allEquipment.map(eq => (<option key={eq.id} value={eq.id}>{eq.name}</option>)) */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex justify-end">
                <button onClick={handleOpenMaintenanceFormForCreate} className="inline-flex items-center justify-jcenter px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
                  <PlusCircle className="h-5 w-5 mr-2" />Add New Record
                </button>
              </div>
              <MaintenanceRecordList
                onEditRecord={handleOpenMaintenanceFormForEdit}
                onDeleteRecord={() => { /* Implement delete logic */ }} // Placeholder for delete
                initialFilters={viewingMaintenanceForEquipment ? { equipment_id: viewingMaintenanceForEquipment } : {}}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default MaintenanceTab;