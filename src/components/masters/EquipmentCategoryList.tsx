import React from 'react';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';
import EquipmentCategoryListItem from './EquipmentCategoryListItem';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { EquipmentCategory } from '../../types';
import { Tag } from 'lucide-react';

interface EquipmentCategoryListProps {
  onEditCategory: (category: EquipmentCategory) => void;
}

const EquipmentCategoryList: React.FC<EquipmentCategoryListProps> = ({ onEditCategory }) => {
  const {
    categories,
    loading,
    error,
    totalCategories,
    currentPage,
    fetchCategoriesPage,
    refreshCategories,
    searchQuery,
  } = useEquipmentCategories();

  const recordsPerPage = 10; // Should match context
  const totalPages = Math.ceil(totalCategories / recordsPerPage);

  if (loading && categories.length === 0 && !searchQuery) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshCategories} />;
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? "No categories match your search" : "No Equipment Categories Found"}
        message={searchQuery ? "Try a different search term." : "Get started by adding a new equipment category."}
        icon={<Tag className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-gray-200">
          <thead className="bg-light-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Description</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-light-gray-200">
            {categories.map(category => (
              <EquipmentCategoryListItem
                key={category.category_id}
                category={category}
                onEdit={onEditCategory}
              />
            ))}
          </tbody>
        </table>
      </div>
      {loading && categories.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchCategoriesPage}
          />
        </div>
      )}
    </div>
  );
};

export default EquipmentCategoryList; // Make sure this line is exactly as is, at the end of the file.
