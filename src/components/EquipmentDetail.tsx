import React from 'react';
import { Equipment } from '../types'; // EquipmentCategory removed as categoryName is passed
import {
  Package, Tag, Hash, CalendarDays, MapPin, Info, Wrench, Layers,
  X, ArrowLeft, Edit3, ListChecks
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatting'; // Import utilities

interface EquipmentDetailProps {
  equipment: Equipment | null;
  categoryName?: string; // Category name is now passed as a prop
  onClose: () => void;
  onEdit: (equipment: Equipment) => void;
  onViewMaintenance: (equipmentId: string) => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({
  equipment,
  categoryName, // Use the passed categoryName
  onClose,
  onEdit,
  onViewMaintenance
}) => {
  if (!equipment) {
    return null;
  }

  // formatDate and formatCurrency are now imported

  const handleEditClick = () => {
    onEdit(equipment);
  };

  const handleViewMaintenanceClick = () => {
    onViewMaintenance(String(equipment.equipment_id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-lg bg-light-gray-50 h-full overflow-y-auto animate-slide-in-right shadow-2xl">
        <div className="sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-light-gray-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-dark-text" />
            </button>
            <h2 className="text-xl font-semibold text-brand-blue flex items-center">
              <Package className="h-6 w-6 mr-2" /> Equipment Details
            </h2>
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleEditClick}
                    className="p-2 rounded-full hover:bg-light-gray-100 text-brand-blue"
                    aria-label="Edit Equipment"
                >
                    <Edit3 className="h-5 w-5" />
                </button>
                <button
                    onClick={handleViewMaintenanceClick}
                    className="p-2 rounded-full hover:bg-light-gray-100 text-green-600"
                    aria-label="View Maintenance Records"
                >
                    <ListChecks className="h-5 w-5" />
                </button>
                 <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-light-gray-100"
                    aria-label="Close"
                >
                    <X className="h-5 w-5 text-dark-text" />
                </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue/90 rounded-lg p-6 text-white mb-6 shadow">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <Package className="h-8 w-8 text-brand-blue" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{equipment.equipment_name || 'Unnamed Equipment'}</h3>
                <p className="text-white/80">ID: {equipment.equipment_id}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
                Basic Information
              </h4>
              <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-light-gray-200">
                  {equipment.description && (
                    <div className="flex p-4 items-start">
                      <Info className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Description</p>
                        <p className="text-sm text-dark-text break-words">{equipment.description}</p>
                      </div>
                    </div>
                  )}
                  {categoryName && ( // Use the passed categoryName
                    <div className="flex p-4 items-start">
                      <Layers className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Category</p>
                        <p className="text-sm text-dark-text">{categoryName}</p>
                      </div>
                    </div>
                  )}
                  {equipment.model && (
                    <div className="flex p-4 items-start">
                      <Tag className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Model</p>
                        <p className="text-sm text-dark-text">{equipment.model}</p>
                      </div>
                    </div>
                  )}
                  {equipment.make && (
                    <div className="flex p-4 items-start">
                      <Tag className="h-5 w-5 text-dark-text/70 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Make</p>
                        <p className="text-sm text-dark-text">{equipment.make}</p>
                      </div>
                    </div>
                  )}
                  {equipment.serial_number && (
                    <div className="flex p-4 items-start">
                      <Hash className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Serial Number</p>
                        <p className="text-sm text-dark-text">{equipment.serial_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
                Financial & Status
              </h4>
              <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-light-gray-200">
                  {equipment.purchase_date && (
                    <div className="flex p-4 items-start">
                      <CalendarDays className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Purchase Date</p>
                        <p className="text-sm text-dark-text">{formatDate(equipment.purchase_date)}</p>
                      </div>
                    </div>
                  )}
                  {(equipment.rental_rate !== null && equipment.rental_rate !== undefined) && (
                    <div className="flex p-4 items-start">
                      {/* Using text-green-600 for currency icon as before, but formatCurrency handles the symbol */}
                       <span className={`h-5 w-5 mr-3 mt-1 flex-shrink-0 text-brand-blue font-semibold`}>{formatCurrency(equipment.rental_rate).charAt(0)}</span>
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Rental Rate (per day)</p>
                        <p className="text-sm text-dark-text">{formatCurrency(equipment.rental_rate)}</p>
                      </div>
                    </div>
                  )}
                  {equipment.status && (
                    <div className="flex p-4 items-start">
                      <Info className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Status</p>
                        <p className="text-sm text-dark-text">{equipment.status}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
                Maintenance & Location
              </h4>
              <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-light-gray-200">
                  {equipment.last_maintenance_date && (
                    <div className="flex p-4 items-start">
                      <Wrench className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Last Maintenance</p>
                        <p className="text-sm text-dark-text">{formatDate(equipment.last_maintenance_date)}</p>
                      </div>
                    </div>
                  )}
                  {equipment.next_calibration_date && (
                    <div className="flex p-4 items-start">
                      <CalendarDays className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Next Calibration</p>
                        <p className="text-sm text-dark-text">{formatDate(equipment.next_calibration_date)}</p>
                      </div>
                    </div>
                  )}
                  {equipment.location && (
                    <div className="flex p-4 items-start">
                      <MapPin className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Location</p>
                        <p className="text-sm text-dark-text">{equipment.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
