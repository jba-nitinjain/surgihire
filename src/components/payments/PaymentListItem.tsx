import React, { useState } from 'react';
import { Payment } from '../../types';
import { Edit3, Trash2 } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { usePayments } from '../../context/PaymentContext';
import { formatDate, formatCurrency } from '../../utils/formatting';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

interface PaymentListItemProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onView: (payment: Payment) => void;
}

const PaymentListItem: React.FC<PaymentListItemProps> = ({ payment, onEdit, onView }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshPayments } = usePayments();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteItem('payments', payment.payment_id);
      refreshPayments();
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <TableRow hover>
        <TableCell>{payment.payment_id}</TableCell>
        <TableCell>{payment.rental_id}</TableCell>
        <TableCell>{payment.nature || 'rental'}</TableCell>
        <TableCell>{formatDate(payment.payment_date)}</TableCell>
        <TableCell>{formatCurrency(payment.payment_amount)}</TableCell>
        <TableCell>{payment.payment_mode || <span className="italic text-gray-400">N/A</span>}</TableCell>
        <TableCell align="right">
          <IconButton
            onClick={() => onView(payment)}
            size="small"
            color="primary"
          >
            <span className="sr-only">View</span>
            <Edit3 size={18} className="hidden" />
          </IconButton>
          <IconButton
            onClick={() => onEdit(payment)}
            size="small"
            color="primary"
            disabled={crudLoading}
          >
            <Edit3 size={18} />
          </IconButton>
          <IconButton
            onClick={() => setIsConfirmModalOpen(true)}
            size="small"
            color="error"
            disabled={crudLoading}
          >
            <Trash2 size={18} />
          </IconButton>
        </TableCell>
      </TableRow>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Payment"
        message={`Are you sure you want to delete payment #${payment.payment_id}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default PaymentListItem;
