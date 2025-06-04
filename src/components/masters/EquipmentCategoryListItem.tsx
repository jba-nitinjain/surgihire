import React, { useState } from 'react';
import { EquipmentCategory } from '../../types';
import { Tag, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';

interface EquipmentCategoryListItemProps {
  category: EquipmentCategory;
  onEdit: (category: EquipmentCategory) => void;
}

const EquipmentCategoryListItem: React.FC<EquipmentCategoryListItemProps> = ({ category, onEdit }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshCategories } = useEquipmentCategories();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleEdit = () => {
    onEdit(category);
  };

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem('equipment_categories', category.category_id);
      refreshCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <tr className="bg-white hover:bg-light-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{category.category_id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text flex items-center">
            <Tag size={16} className="mr-2 text-brand-blue" /> {category.category_name}
        </td>
        <td className="px-6 py-4 whitespace-normal text-sm text-dark-text/80 max-w-md truncate" title={category.description || ''}>
            {category.description || <span className="italic text-gray-400">No description</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button
            onClick={handleEdit}
            disabled={crudLoading}
            className="text-brand-blue hover:text-brand-blue/80 disabled:opacity-50 p-1 rounded hover:bg-brand-blue/10"
            title="Edit Category"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={crudLoading}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1 rounded hover:bg-red-100"
            title="Delete Category"
          >
            {crudLoading && isConfirmModalOpen ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </td>
      </tr>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Equipment Category"
        message={`Are you sure you want to delete "${category.category_name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default EquipmentCategoryListItem;
