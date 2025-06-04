import React from 'react';
import ConfirmationModal from '../ui/ConfirmationModal';
import { MaintenanceRecord } from '../../types';

interface DeleteMaintenanceModalProps {
  isOpen: boolean;
  record: MaintenanceRecord | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteMaintenanceModal: React.FC<DeleteMaintenanceModalProps> = ({
  isOpen,
  record,
  isLoading,
  onConfirm,
  onCancel,
}) => (
  <ConfirmationModal
    isOpen={isOpen}
    title="Delete Maintenance Record"
    message={`Are you sure you want to delete the maintenance record for "${record?.equipment_name || `ID: ${record?.equipment_id}`}" on ${record?.maintenance_date}? This action cannot be undone.`}
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
    confirmText="Delete"
  />
);

export default DeleteMaintenanceModal;
