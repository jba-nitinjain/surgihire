import React, { useState } from 'react';
import { RentalTransaction } from '../../types';
import { Edit3, Trash2, IndianRupee } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { formatDate, formatCurrency } from '../../utils/formatting';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

interface RentalTransactionListItemProps {
  rental: RentalTransaction;
  onEdit: (rental: RentalTransaction) => void;
}

const RentalTransactionListItem: React.FC<RentalTransactionListItemProps> = ({ rental, onEdit }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshRentalTransactions } = useRentalTransactions();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteItem('rental_transactions', rental.rental_id);
      refreshRentalTransactions();
    } finally {
      setConfirmOpen(false);
    }
  };

  const recordPayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/payments/new', { state: { payment: { rental_id: rental.rental_id } } });
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ID: {rental.rental_id}
          </Typography>
          <Typography variant="body1" component="div">
            {rental.customer_name || rental.customer_id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rental Date: {formatDate(rental.rental_date)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {rental.status || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rental.total_amount !== null ? formatCurrency(rental.total_amount) : '-'}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton size="small" color="primary" onClick={() => onEdit(rental)} disabled={crudLoading}>
            <Edit3 size={18} />
          </IconButton>
          <IconButton size="small" color="primary" onClick={recordPayment}>
            <IndianRupee size={18} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setConfirmOpen(true)} disabled={crudLoading}>
            <Trash2 size={18} />
          </IconButton>
        </CardActions>
      </Card>
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Delete Rental Transaction"
        message={`Are you sure you want to delete rental transaction ID ${rental.rental_id}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default RentalTransactionListItem;
