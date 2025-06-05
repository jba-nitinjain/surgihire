import React, { useEffect } from 'react';
import { useEquipment } from '../../context/EquipmentContext';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';

import EquipmentList from '../EquipmentList';
import { useNavigate } from 'react-router-dom';
import EquipmentFilterPanel from './EquipmentFilterPanel';
import { PlusCircle } from 'lucide-react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Equipment } from '../../types';

interface EquipmentTabProps {
  onViewMaintenanceForEquipment: (equipmentId: string) => void;
}


const EquipmentTab: React.FC<EquipmentTabProps> = ({
  onViewMaintenanceForEquipment,
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

  const navigate = useNavigate();

  useEffect(() => {
    if (allEquipmentCategories.length === 0 && !eqCategoriesLoadingForFilter && !eqCategoriesFilterError) {
      refreshEqCategoriesForFilter();
    }
  }, [allEquipmentCategories.length, eqCategoriesLoadingForFilter, eqCategoriesFilterError, refreshEqCategoriesForFilter]);


  const handleSelectEquipmentForDetail = (equipment: Equipment) => {
    navigate(`/equipment/${equipment.equipment_id}`, { state: { equipment } });
  };

  const handleOpenEquipmentFormForCreate = () => {
    navigate('/equipment/new');
  };

  const handleOpenEquipmentFormForEdit = (item: Equipment) => {
    navigate(`/equipment/${item.equipment_id}/edit`, { state: { equipment: item } });
  };

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
        <div className="flex flex-col items-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenEquipmentFormForCreate}
            startIcon={<PlusCircle className="h-5 w-5" />}
          >
            Add New Equipment
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Register new equipment details
          </Typography>
        </div>
      </div>
      <EquipmentList
        onEditEquipment={handleOpenEquipmentFormForEdit}
        onViewMaintenance={onViewMaintenanceForEquipment}
        onViewDetail={handleSelectEquipmentForDetail}
      />
    </>
  );
};

export default EquipmentTab;
