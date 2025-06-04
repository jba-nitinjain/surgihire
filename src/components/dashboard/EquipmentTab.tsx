import React, { useState, useEffect } from 'react';
import { useEquipment } from '../../context/EquipmentContext';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';
import { getEquipmentItem } from '../../services/api'; // Import for fetching single equipment
import EquipmentList from '../EquipmentList';
import EquipmentForm from '../EquipmentForm';
import EquipmentDetail from '../EquipmentDetail';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import { Equipment } from '../../types';
import Spinner from '../ui/Spinner'; // For loading state

interface EquipmentTabProps {
  onViewMaintenanceForEquipment: (equipmentId: string) => void;
  initialEquipmentIdToView: number | null; // To show specific equipment detail on load
  clearInitialEquipmentIdToView: () => void; // To clear the ID after use
}

const equipmentStatusesForFilter = ['Available', 'Rented', 'Maintenance', 'Decommissioned', 'Lost'];

const EquipmentTab: React.FC<EquipmentTabProps> = ({
  onViewMaintenanceForEquipment,
  initialEquipmentIdToView,
  clearInitialEquipmentIdToView,
}) => {
  const {
    equipmentList, // Use the list from context
    searchQuery: equipmentSearchQuery,
    setSearchQuery: setEquipmentSearchQuery,
    refreshEquipmentData,
    filters: equipmentFilters,
    setFilters: setEquipmentFilters,
    loading: equipmentListLoading, // Loading state for the list
  } = useEquipment();

  const {
    categories: allEquipmentCategories,
    loading: eqCategoriesLoadingForFilter,
    error: eqCategoriesFilterError,
    getCategoryNameById,
    refreshCategories: refreshEqCategoriesForFilter,
  } = useEquipmentCategories();

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false); // Loading state for single equipment detail

  useEffect(() => {
    if (allEquipmentCategories.length === 0 && !eqCategoriesLoadingForFilter && !eqCategoriesFilterError) {
      refreshEqCategoriesForFilter();
    }
  }, [allEquipmentCategories.length, eqCategoriesLoadingForFilter, eqCategoriesFilterError, refreshEqCategoriesForFilter]);

  // Effect to load specific equipment detail if initialEquipmentIdToView is provided
  useEffect(() => {
    const fetchAndSetInitialEquipment = async () => {
      if (initialEquipmentIdToView !== null) {
        setDetailLoading(true);
        // First, check if the equipment is already in the list
        const existingEquipment = equipmentList.find(eq => eq.equipment_id === initialEquipmentIdToView);
        if (existingEquipment) {
            setSelectedEquipment(existingEquipment);
            setDetailLoading(false);
            clearInitialEquipmentIdToView(); // Clear the ID after loading
        } else {
            // If not in the list, fetch it
            try {
                const response = await getEquipmentItem(initialEquipmentIdToView);
                if (response.success && response.data) {
                    setSelectedEquipment(response.data as Equipment);
                } else {
                    console.error("Failed to fetch initial equipment:", response.message);
                    // Optionally, show an error to the user
                }
            } catch (error) {
                console.error("Error fetching initial equipment:", error);
            } finally {
                setDetailLoading(false);
                clearInitialEquipmentIdToView(); // Clear the ID after attempting to load
            }
        }
      }
    };
    fetchAndSetInitialEquipment();
  }, [initialEquipmentIdToView, clearInitialEquipmentIdToView, equipmentList]); // Add equipmentList as dependency

  const handleSelectEquipmentForDetail = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsEquipmentFormOpen(false);
    setEditingEquipment(null);
  };

  const handleCloseEquipmentDetail = () => {
    setSelectedEquipment(null);
  };

  const handleOpenEquipmentFormForCreate = () => {
    setEditingEquipment(null);
    setSelectedEquipment(null);
    setIsEquipmentFormOpen(true);
  };

  const handleOpenEquipmentFormForEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setSelectedEquipment(null);
    setIsEquipmentFormOpen(true);
  };

  const handleCloseEquipmentForm = () => {
    setIsEquipmentFormOpen(false);
    setEditingEquipment(null);
  };

  const handleSaveEquipmentForm = () => {
    handleCloseEquipmentForm();
    refreshEquipmentData();
  };

  if (detailLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="ml-2">Loading equipment details...</p>
      </div>
    );
  }

  return (
    <>
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
              onChange={(e) => setEquipmentFilters({ ...equipmentFilters, status: e.target.value === 'all' ? null : e.target.value })}
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
              onChange={(e) => setEquipmentFilters({ ...equipmentFilters, category_id: e.target.value === 'all' ? null : e.target.value })}
              disabled={eqCategoriesLoadingForFilter || !!eqCategoriesFilterError}
              className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
            >
              <option value="all">{eqCategoriesLoadingForFilter ? "Loading..." : (eqCategoriesFilterError ? "Error" : "All Categories")}</option>
              {!eqCategoriesLoadingForFilter && !eqCategoriesFilterError && allEquipmentCategories.map(cat => (
                <option key={cat.category_id} value={String(cat.category_id)}>{cat.category_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={handleOpenEquipmentFormForCreate} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
          <PlusCircle className="h-5 w-5 mr-2" />Add New Equipment
        </button>
      </div>
      <EquipmentList
        onEditEquipment={handleOpenEquipmentFormForEdit}
        onViewMaintenance={onViewMaintenanceForEquipment}
        onViewDetail={handleSelectEquipmentForDetail}
      />

      {isEquipmentFormOpen && (
        <EquipmentForm
          equipment={editingEquipment}
          onSave={handleSaveEquipmentForm}
          onCancel={handleCloseEquipmentForm}
        />
      )}
      {selectedEquipment && !isEquipmentFormOpen && (
        <EquipmentDetail
          equipment={selectedEquipment}
          categoryName={getCategoryNameById(selectedEquipment.category_id)}
          onClose={handleCloseEquipmentDetail}
          onEdit={() => handleOpenEquipmentFormForEdit(selectedEquipment)}
          onViewMaintenance={onViewMaintenanceForEquipment}
        />
      )}
    </>
  );
};

export default EquipmentTab;
