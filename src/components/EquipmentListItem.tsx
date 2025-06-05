import React, { useState } from 'react';
import { Equipment } from '../types';
import { Edit3, Trash2, Wrench } from 'lucide-react';
import { useCrud } from '../context/CrudContext';
import ConfirmationModal from './ui/ConfirmationModal';
import { useEquipment } from '../context/EquipmentContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

interface EquipmentListItemProps {
  equipment: Equipment;
  categoryName?: string;
  onEdit: (equipment: Equipment) => void;
  onViewMaintenance: (equipmentId: string) => void;
  onViewDetail: (equipment: Equipment) => void;
}

const EquipmentListItem: React.FC<EquipmentListItemProps> = ({ equipment, categoryName, onEdit, onViewMaintenance, onViewDetail }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshEquipmentData } = useEquipment();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteItem('equipment', equipment.equipment_id);
      refreshEquipmentData();
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => onViewDetail(equipment)}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ID: {equipment.equipment_id}
          </Typography>
          <Typography variant="h6" component="div">
            {equipment.equipment_name || 'Unnamed'}
          </Typography>
          {categoryName && (
            <Typography variant="body2" color="text.secondary">
              {categoryName}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Status: {equipment.status || '-'}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            color="primary"
            onClick={e => {
              e.stopPropagation();
              onViewMaintenance(String(equipment.equipment_id));
            }}
          >
            <Wrench size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={e => {
              e.stopPropagation();
              onEdit(equipment);
            }}
            disabled={crudLoading}
          >
            <Edit3 size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={e => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            disabled={crudLoading}
          >
            <Trash2 size={18} />
          </IconButton>
        </CardActions>
      </Card>
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${equipment.equipment_name || 'this equipment'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default EquipmentListItem;
