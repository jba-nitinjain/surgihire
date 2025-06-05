import React, { useState } from 'react';
import { RentalTransaction } from '../../types';
import { Edit3, Trash2, IndianRupee } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { formatDate, formatCurrency } from '../../utils/formatting';
import { useNavigate } from 'react-router-dom';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
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
      <TableRow hover>
        <TableCell>{rental.rental_id}</TableCell>
        <TableCell>{rental.customer_name || rental.customer_id}</TableCell>
        <TableCell>{formatDate(rental.rental_date)}</TableCell>
        <TableCell>{rental.status || '-'}</TableCell>
        <TableCell>{rental.total_amount !== null ? formatCurrency(rental.total_amount) : '-'}</TableCell>
        <TableCell align="right">
          <IconButton size="small" color="primary" onClick={() => onEdit(rental)} disabled={crudLoading}>
            <Edit3 size={18} />
          </IconButton>
          <IconButton size="small" color="primary" onClick={recordPayment}>
            <IndianRupee size={18} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setConfirmOpen(true)} disabled={crudLoading}>
            <Trash2 size={18} />
          </IconButton>
        </TableCell>
      </TableRow>
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
