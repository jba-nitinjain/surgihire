import React from 'react';
import { usePayments } from '../../context/PaymentContext';
import PaymentList from '../payments/PaymentList';
import PaymentFilterBar from './PaymentFilterBar';
import { Payment } from '../../types';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatting';

const PaymentsTab: React.FC = () => {
  const { filters, setFilters, depositTotal, rentalTotal } = usePayments();
  const navigate = useNavigate();


  const handleOpenPaymentFormForEdit = (item: Payment) => {
    navigate(`/payments/${item.payment_id}/edit`, { state: { payment: item } });
  };

  const handleViewPayment = (item: Payment) => {
    navigate(`/payments/${item.payment_id}`, { state: { payment: item } });
  };

  return (
    <>
      <PaymentFilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-dark-text">Deposits This Month</div>
          <div className="text-lg font-semibold">{formatCurrency(depositTotal)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-dark-text">Rentals This Month</div>
          <div className="text-lg font-semibold">{formatCurrency(rentalTotal)}</div>
        </div>
      </div>
      <PaymentList onEditPayment={handleOpenPaymentFormForEdit} onViewPayment={handleViewPayment} />
    </>
  );
};

export default PaymentsTab;
