import React, { useState, useEffect } from 'react';
import { useEquipment } from '../../context/EquipmentContext';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';
import { getEquipmentItem } from '../../services/api/equipment'; // Import for fetching single equipment
import EquipmentList from '../EquipmentList';
import { useNavigate } from 'react-router-dom';
import EquipmentDetail from '../EquipmentDetail';
import EquipmentFilterPanel from './EquipmentFilterPanel';
import { PlusCircle } from 'lucide-react';
import { Equipment } from '../../types';
import Spinner from '../ui/Spinner'; // For loading state

interface EquipmentTabProps {
  onViewMaintenanceForEquipment: (equipmentId: string) => void;
  initialEquipmentIdToView: number | null; // To show specific equipment detail on load
  clearInitialEquipmentIdToView: () => void; // To clear the ID after use
}


const EquipmentTab: React.FC<EquipmentTabProps> = ({
  onViewMaintenanceForEquipment,
  initialEquipmentIdToView,
  clearInitialEquipmentIdToView,
}) => {
  const {
    equipmentList, // Use the list from context
    searchQuery: equipmentSearchQuery,
    setSearchQuery: setEquipmentSearchQuery,
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
  const navigate = useNavigate();
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
  };

  const handleCloseEquipmentDetail = () => {
    setSelectedEquipment(null);
  };

  const handleOpenEquipmentFormForCreate = () => {
    setSelectedEquipment(null);
    navigate('/equipment/new');
  };

  const handleOpenEquipmentFormForEdit = (item: Equipment) => {
    setSelectedEquipment(null);
    navigate(`/equipment/${item.equipment_id}/edit`, { state: { equipment: item } });
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
        <EquipmentFilterPanel
          searchQuery={equipmentSearchQuery}
          onSearchChange={setEquipmentSearchQuery}
          filters={equipmentFilters}
          onFiltersChange={setEquipmentFilters}
          categories={allEquipmentCategories}
          loadingCategories={eqCategoriesLoadingForFilter}
          categoriesError={eqCategoriesFilterError}
        />

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

      {selectedEquipment && (
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
