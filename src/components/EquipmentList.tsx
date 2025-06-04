import React, { useEffect } from 'react'; // Added useEffect
import { useEquipment } from '../context/EquipmentContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext'; // Import category context
import EquipmentCard from './EquipmentCard';
import Spinner from './ui/Spinner';
import Pagination from './ui/Pagination';
import EmptyState from './ui/EmptyState';
import ErrorDisplay from './ui/ErrorDisplay';
import { Equipment } from '../types';
import { Package } from 'lucide-react';

interface EquipmentListProps {
  onEditEquipment: (equipment: Equipment) => void;
  onViewMaintenance: (equipmentId: string) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  onEditEquipment,
  onViewMaintenance,
}) => {
  const { 
    equipmentList, 
    loading, 
    error, 
    totalEquipment, 
    currentPage, 
    fetchEquipmentPage, // Renamed from fetchPage for clarity if it was generic before
    refreshEquipmentData,
    searchQuery 
  } = useEquipment();

  // Fetch all categories to map IDs to names
  const { categories: equipmentCategories, loading: categoriesLoading, refreshCategories: refreshEqCategories, error: categoriesError } = useEquipmentCategories();

  useEffect(() => {
    // Fetch categories if not already loaded, or if there was an error and we want to retry
    if (equipmentCategories.length === 0 && !categoriesLoading) {
      refreshEqCategories();
    }
  }, [equipmentCategories.length, categoriesLoading, refreshEqCategories]);


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
   if (categoriesError && equipmentCategories.length === 0) { // Show error if categories failed to load and are needed
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
    <div className="space-y-6">
      {categoriesLoading && equipmentList.length > 0 && (
         <div className="my-2 flex justify-center items-center text-sm text-gray-500">
            <Spinner size="sm" /> <span className="ml-2">Loading category details...</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {equipmentList.map(item => (
          <EquipmentCard 
            key={item.equipment_id} 
            equipment={item} 
            onEdit={onEditEquipment}
            onViewMaintenance={onViewMaintenance}
            categoryName={getCategoryName(item.category_id)} // Pass the category name
          />
        ))}
      </div>
      
      {loading && equipmentList.length > 0 && (
        <div className="my-4 flex justify-center">
          <Spinner size="md" />
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchEquipmentPage}
        />
      )}
    </div>
  );
};

export default EquipmentList;
