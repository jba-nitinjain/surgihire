import React from 'react';
import { usePayments } from '../../context/PaymentContext';
import PaymentList from '../payments/PaymentList';
import SearchBox from '../ui/SearchBox';
import { Payment } from '../../types';
import { useNavigate } from 'react-router-dom';

const PaymentsTab: React.FC = () => {
  const { searchQuery, setSearchQuery } = usePayments();
  const navigate = useNavigate();


  const handleOpenPaymentFormForEdit = (item: Payment) => {
    navigate(`/payments/${item.payment_id}/edit`, { state: { payment: item } });
  };

  const handleViewPayment = (item: Payment) => {
    navigate(`/payments/${item.payment_id}`, { state: { payment: item } });
  };

  return (
    <>
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="w-full md:max-w-xs mb-4 md:mb-0">
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search payments..." />
        </div>
        {/* Record Payment button removed as payments are created from rental page */}
      </div>
      <PaymentList onEditPayment={handleOpenPaymentFormForEdit} onViewPayment={handleViewPayment} />
    </>
  );
};

export default PaymentsTab;
