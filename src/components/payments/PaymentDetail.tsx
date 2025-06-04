import React from 'react';
import { Payment } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatting';
import Modal from '../ui/Modal';
import { X, IndianRupee } from 'lucide-react';

interface PaymentDetailProps {
  payment: Payment | null;
  onClose: () => void;
  isModal?: boolean;
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({ payment, onClose, isModal = true }) => {
  if (!payment) return null;

  const content = (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-dark-text">Payment #{payment.payment_id}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-dark-text">Rental ID: {payment.rental_id}</div>
        <div className="text-sm text-dark-text">Nature: {payment.nature || 'rental'}</div>
        <div className="text-sm text-dark-text">Date: {formatDate(payment.payment_date)}</div>
        <div className="text-sm text-dark-text flex items-center">
          <IndianRupee size={14} className="mr-1" /> {formatCurrency(payment.payment_amount)}
        </div>
        <div className="text-sm text-dark-text">Mode: {payment.payment_mode || 'N/A'}</div>
        {payment.payment_reference && (
          <div className="text-sm text-dark-text">Reference: {payment.payment_reference}</div>
        )}
        {payment.notes && <div className="text-sm text-dark-text">Notes: {payment.notes}</div>}
      </div>
    </div>
  );

  return isModal ? (
    <Modal widthClasses="max-w-md" onClose={onClose}>
      {content}
    </Modal>
  ) : (
    <div className="bg-white rounded-md shadow">{content}</div>
  );
};

export default PaymentDetail;
