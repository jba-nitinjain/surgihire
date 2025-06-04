import React from 'react';
import { Equipment } from '../types'; // EquipmentCategory removed as categoryName is passed
import {
  Package,
  X,
  ArrowLeft,
  Edit3,
  ListChecks
} from 'lucide-react';

import BasicInfoSection from './equipment/detail/BasicInfoSection';
import FinancialStatusSection from './equipment/detail/FinancialStatusSection';
import MaintenanceLocationSection from './equipment/detail/MaintenanceLocationSection';
import Modal from './ui/Modal';

interface EquipmentDetailProps {
  equipment: Equipment | null;
  categoryName?: string; // Category name is now passed as a prop
  onClose: () => void;
  onEdit: (equipment: Equipment) => void;
  onViewMaintenance: (equipmentId: string) => void;
  /** When true (default) render inside a modal overlay */
  isModal?: boolean;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({
  equipment,
  categoryName, // Use the passed categoryName
  onClose,
  onEdit,
  onViewMaintenance,
  isModal = true,
}) => {
  if (!equipment) {
    return null;
  }


  const handleEditClick = () => {
    onEdit(equipment);
  };

  const handleViewMaintenanceClick = () => {
    onViewMaintenance(String(equipment.equipment_id));
  };

  const content = (
        <>
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
            <BasicInfoSection equipment={equipment} categoryName={categoryName} />
            <FinancialStatusSection equipment={equipment} />
            <MaintenanceLocationSection equipment={equipment} />
          </div>
        </div>
    </>
  );

  return isModal ? (
    <Modal widthClasses="max-w-lg h-full overflow-y-auto animate-slide-in-right shadow-2xl bg-light-gray-50" onClose={onClose}>
      {content}
    </Modal>
  ) : (
    <div className="w-full mx-auto bg-white rounded-lg shadow">{content}</div>
  );
};

export default EquipmentDetail;
