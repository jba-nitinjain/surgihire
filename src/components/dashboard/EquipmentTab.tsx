import React from 'react';
import { useEquipment } from '../../context/EquipmentContext';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';
import EquipmentList from '../EquipmentList';
import EquipmentForm from '../EquipmentForm';
import EquipmentDetail from '../EquipmentDetail';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import { Equipment } from '../../types';

interface EquipmentTabProps {
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  isEquipmentFormOpen: boolean;
  setIsEquipmentFormOpen: (isOpen: boolean) => void;
  editingEquipment: Equipment | null;
  setEditingEquipment: (equipment: Equipment | null) => void;
  handleViewMaintenanceForEquipment: (equipmentId: string) => void;
  equipmentSearchQuery: string; // Added for search functionality
  setEquipmentSearchQuery: (query: string) => void; // Added for search functionality
}

const equipmentStatusesForFilter = ['Available', 'Rented', 'Maintenance', 'Decommissioned', 'Lost'];

const EquipmentTab: React.FC<EquipmentTabProps> = ({
  selectedEquipment,
  setSelectedEquipment,
  isEquipmentFormOpen,
  setIsEquipmentFormOpen,
  editingEquipment,
  setEditingEquipment,
  handleViewMaintenanceForEquipment,
  equipmentSearchQuery, // Destructure new prop
  setEquipmentSearchQuery, // Destructure new prop
}) => {
  const {
    // searchQuery: equipmentSearchQuery, // Now passed as prop
    // setSearchQuery: setEquipmentSearchQuery, // Now passed as prop
    refreshEquipmentData,
    filters: equipmentFilters,
    setFilters: setEquipmentFilters,
  } = useEquipment();

  const { categories: allEquipmentCategories, loading: eqCategoriesLoadingForFilter, error: eqCategoriesFilterError } = useEquipmentCategories();

  const handleSelectEquipmentForDetail = (equipment: Equipment) => setSelectedEquipment(equipment);
  const handleCloseEquipmentDetail = () => setSelectedEquipment(null);
  const handleOpenEquipmentFormForCreate = () => { setEditingEquipment(null); setIsEquipmentFormOpen(true); };
  const handleOpenEquipmentFormForEdit = (item: Equipment) => { setEditingEquipment(item); setIsEquipmentFormOpen(true); };
  const handleCloseEquipmentForm = () => { setIsEquipmentFormOpen(false); setEditingEquipment(null); };
  const handleSaveEquipmentForm = () => { handleCloseEquipmentForm(); refreshEquipmentData(); };

  return (
    <>
      {/* ====== EQUIPMENT FILTERS UI ====== */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="equipmentSearch" className="block text-sm font-medium text-dark-text mb-1">Search Equipment</label>
            <SearchBox
              value={equipmentSearchQuery}
              onChange={setEquipmentSearchQuery}
              placeholder="Search by name, serial..."
            />
          </div>
          <div>
            <label htmlFor="equipmentStatusFilter" className="block text-sm font-medium text-dark-text mb-1">Status</label>
            <select
              id="equipmentStatusFilter"
              name="status"
              value={equipmentFilters.status || 'all'}
              onChange={(e) => setEquipmentFilters({ status: e.target.value === 'all' ? null : e.target.value })}
              className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
            >
              <option value="all">All Statuses</option>
              {equipmentStatusesForFilter.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="equipmentCategoryFilter" className="block text-sm font-medium text-dark-text mb-1">Category</label>
            <select
              id="equipmentCategoryFilter"
              name="category_id"
              value={equipmentFilters.category_id || 'all'}
              onChange={(e) => setEquipmentFilters({ category_id: e.target.value === 'all' ? null : e.target.value })}
              disabled={eqCategoriesLoadingForFilter || !!eqCategoriesFilterError}
              className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
            >
              <option value="all">{eqCategoriesLoadingForFilter ? "Loading..." : (eqCategoriesFilterError ? "Error" : "All Categories")}</option>
              {!eqCategoriesLoadingForFilter && !eqCategoriesFilterError && allEquipmentCategories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* ====== END EQUIPMENT FILTERS UI ====== */}

      <div className="mb-6 flex justify-end">
        <button onClick={handleOpenEquipmentFormForCreate} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
          <PlusCircle className="h-5 w-5 mr-2" />Add New Equipment
        </button>
      </div>
      <EquipmentList onEditEquipment={handleOpenEquipmentFormForEdit} onViewMaintenance={handleViewMaintenanceForEquipment} onViewDetail={handleSelectEquipmentForDetail} />

      {isEquipmentFormOpen && <EquipmentForm equipment={editingEquipment} onSave={handleSaveEquipmentForm} onCancel={handleCloseEquipmentForm}/>}
      {selectedEquipment && 
        <EquipmentDetail 
          equipment={selectedEquipment} 
          onClose={handleCloseEquipmentDetail} 
          onEdit={() => {
            handleOpenEquipmentFormForEdit(selectedEquipment); 
            setSelectedEquipment(null); // Close detail view when opening edit form
          }} 
        />
      }
    </>
  );
};

export default EquipmentTab;