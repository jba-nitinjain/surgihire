import React, { useEffect } from 'react';
import { useEquipment } from '../context/EquipmentContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext';
import EquipmentListItem from './EquipmentListItem';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import { Equipment } from '../types';
import { Package } from 'lucide-react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

interface EquipmentListProps {
  onEditEquipment: (equipment: Equipment) => void;
  onViewMaintenance: (equipmentId: string) => void;
  onViewDetail: (equipment: Equipment) => void; // Added prop for viewing details
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  onEditEquipment,
  onViewMaintenance,
  onViewDetail, // Destructure new prop
}) => {
  const {
    equipmentList,
    loading,
    error,
    totalEquipment,
    currentPage,
    fetchEquipmentPage,
    refreshEquipmentData,
    searchQuery
  } = useEquipment();

  const { categories: equipmentCategories, loading: categoriesLoading, refreshCategories: refreshEqCategories, error: categoriesError } = useEquipmentCategories();

  useEffect(() => {
    if (equipmentCategories.length === 0 && !categoriesLoading && !categoriesError) { // Added !categoriesError
      refreshEqCategories();
    }
  }, [equipmentCategories.length, categoriesLoading, categoriesError, refreshEqCategories]);


  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalEquipment / recordsPerPage);

  const getCategoryName = (categoryId: number | null): string | undefined => {
    if (categoryId === null || categoryId === undefined) return undefined;
    const category = equipmentCategories.find(cat => cat.category_id === categoryId);
    return category?.category_name;
  };

  if (loading && equipmentList.length === 0 && !searchQuery) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshEquipmentData} />;
  }
   if (categoriesError && equipmentCategories.length === 0) {
    return <ErrorDisplay message={`Failed to load equipment categories: ${categoriesError}`} onRetry={refreshEqCategories} />;
  }


  if (equipmentList.length === 0) {
    return <EmptyState
             title={searchQuery ? "No equipment matches your search" : "No equipment found"}
             message={searchQuery ? "Try a different search term." : "Get started by adding new equipment."}
             icon={<Package className="w-16 h-16 text-gray-400" />}
           />;
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden', p: 2 }}>
      {categoriesLoading && equipmentList.length > 0 && (
        <div className="my-2 flex justify-center items-center text-sm text-gray-500">
          <Spinner size="sm" /> <span className="ml-2">Loading category details...</span>
        </div>
      )}
      <Grid container spacing={2}>
        {equipmentList.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={item.equipment_id}>
            <EquipmentListItem
              equipment={item}
              onEdit={onEditEquipment}
              onViewMaintenance={onViewMaintenance}
              onViewDetail={onViewDetail}
              categoryName={getCategoryName(item.category_id)}
            />
          </Grid>
        ))}
      </Grid>
      {loading && equipmentList.length > 0 && (
        <div className="my-4 flex justify-center">
          <Spinner size="md" />
        </div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchEquipmentPage} />
        </div>
      )}
    </Paper>
  );
};

export default EquipmentList;
