import React, { useState } from 'react';
import { Equipment } from '../types';
import { Package, Edit3, Trash2, MoreVertical, Loader2, CalendarDays, Tag, Hash, MapPin, Wrench, ListChecks } from 'lucide-react'; // Removed IndianRupee, will use formatCurrency
import { useCrud } from '../context/CrudContext';
import ConfirmationModal from './ui/ConfirmationModal';
import { useEquipment } from '../context/EquipmentContext';
import { formatDate, formatCurrency } from '../utils/formatting'; // Import utilities

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onViewMaintenance: (equipmentId: string) => void;
  categoryName?: string | null;
  onViewDetail: (equipment: Equipment) => void; // Added for viewing details
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onEdit, onViewMaintenance, categoryName, onViewDetail }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshEquipmentData } = useEquipment();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // formatDate and formatCurrency are now imported

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(equipment);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmModalOpen(true);
    setIsMenuOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem('equipment', equipment.equipment_id);
      refreshEquipmentData();
    } catch (error) {
      console.error("Failed to delete equipment:", error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.equipment-card-menu-button')) {
      return;
    }
    // console.log("Equipment card clicked, opening detail:", equipment.equipment_name);
    onViewDetail(equipment); // Call onViewDetail when card is clicked
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
        case 'available': return 'bg-green-100 text-green-700';
        case 'rented': return 'bg-yellow-100 text-yellow-700';
        case 'maintenance': return 'bg-blue-100 text-blue-700';
        case 'decommissioned': return 'bg-gray-100 text-gray-700';
        case 'lost': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-500';
    }
  };


  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-light-gray-200 overflow-hidden hover:shadow-md
                  transition-shadow duration-300 cursor-pointer relative flex flex-col justify-between h-full"
        onClick={handleCardClick}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center min-w-0">
              <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-full mr-3 flex-shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="text-md font-semibold text-dark-text truncate" title={equipment.equipment_name}>
                {equipment.equipment_name || 'Unnamed Equipment'}
              </h3>
            </div>

            <div className="relative equipment-card-menu-button">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className="p-1 text-dark-text/60 hover:text-dark-text rounded-full hover:bg-light-gray-100"
                aria-label="Actions"
              >
                <MoreVertical size={20} />
              </button>
              {isMenuOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-light-gray-200" // Increased width
                    onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleEdit}
                    disabled={crudLoading}
                    className="w-full text-left px-4 py-2 text-sm text-dark-text hover:bg-light-gray-50 flex items-center disabled:opacity-50"
                  >
                    <Edit3 size={16} className="mr-2" /> Edit Equipment
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMaintenance(String(equipment.equipment_id));
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-dark-text hover:bg-light-gray-50 flex items-center"
                  >
                    <ListChecks size={16} className="mr-2" /> View Records
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={crudLoading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                  >
                    {crudLoading && isConfirmModalOpen ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
                     Delete Equipment
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-dark-text/90">
            {categoryName && (
                 <div className="flex items-center" title={`Category: ${categoryName}`}>
                    <Tag size={14} className="mr-2 text-gray-500 flex-shrink-0" /> {/* Changed icon to Tag for category consistency */}
                    <span className="truncate">{categoryName}</span>
                </div>
            )}
            {equipment.serial_number && (
                <div className="flex items-center" title={`Serial: ${equipment.serial_number}`}>
                    <Hash size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">SN: {equipment.serial_number}</span>
                </div>
            )}
            {equipment.make && equipment.model && (
                <div className="flex items-center" title={`${equipment.make} ${equipment.model}`}>
                    <Tag size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{equipment.make} - {equipment.model}</span>
                </div>
            )}
            {(equipment.rental_rate !== null && equipment.rental_rate !== undefined) && (
              <div className="flex items-center" title={`Rental Rate: ${formatCurrency(equipment.rental_rate)}`}>
                 {/* Using text-green-600 for currency icon as before, but formatCurrency handles the symbol */}
                <span className={`mr-1.5 text-green-600 font-semibold`}>{formatCurrency(equipment.rental_rate).charAt(0)}</span>
                <span className="font-medium text-green-700">{formatCurrency(equipment.rental_rate).substring(1)} / day</span>
              </div>
            )}
             {equipment.location && (
                <div className="flex items-center" title={`Location: ${equipment.location}`}>
                    <MapPin size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{equipment.location}</span>
                </div>
            )}
             {equipment.purchase_date && (
                <div className="flex items-center" title={`Purchased: ${formatDate(equipment.purchase_date)}`}>
                    <CalendarDays size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                    <span>Purchased: {formatDate(equipment.purchase_date)}</span>
                </div>
            )}
             {equipment.last_maintenance_date && (
                <div className="flex items-center" title={`Last Maintained: ${formatDate(equipment.last_maintenance_date)}`}>
                    <Wrench size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                    <span>Maintained: {formatDate(equipment.last_maintenance_date)}</span>
                </div>
            )}
          </div>
        </div>
        <div className="p-4 mt-auto border-t border-light-gray-100">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(equipment.status)}`}>
                {equipment.status || 'Unknown'}
            </span>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${equipment.equipment_name || 'this equipment'}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default EquipmentCard;
