import React, { useState } from 'react';
import { Payment } from '../../types';
import { Edit3, Trash2 } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { usePayments } from '../../context/PaymentContext';
import { formatDate, formatCurrency } from '../../utils/formatting';
import { useNavigate } from 'react-router-dom';

interface PaymentListItemProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onView: (payment: Payment) => void;
}

const PaymentListItem: React.FC<PaymentListItemProps> = ({ payment, onEdit, onView }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshPayments } = usePayments();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

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
      <tr className="bg-white hover:bg-light-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text font-medium">
          {payment.payment_id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <button
            onClick={() =>
              navigate('/rentals', {
                state: { customerId: payment.customer_id, from: '/payments' },
              })
            }
            className="text-brand-blue hover:underline"
          >
            {payment.customer_name || `Rental #${payment.rental_id}`}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">
          {payment.nature || 'rental'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">
          {formatDate(payment.payment_date)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">
          {formatCurrency(payment.payment_amount)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">
          {payment.payment_mode || <span className="italic text-gray-400">N/A</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button
            onClick={() => onView(payment)}
            className="text-brand-blue hover:text-brand-blue/80 p-1 rounded hover:bg-brand-blue/10"
            title="View Payment"
          >
            <span className="sr-only">View</span>
            <Edit3 size={18} className="hidden" />
          </button>
          <button
            onClick={() => onEdit(payment)}
            disabled={crudLoading}
            className="text-brand-blue hover:text-brand-blue/80 p-1 rounded hover:bg-brand-blue/10"
            title="Edit Payment"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={crudLoading}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
            title="Delete Payment"
          >
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
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
