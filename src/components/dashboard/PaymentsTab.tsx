import React from 'react';
import { usePayments } from '../../context/PaymentContext';
import PaymentList from '../payments/PaymentList';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import { Payment } from '../../types';
import { useNavigate } from 'react-router-dom';

const PaymentsTab: React.FC = () => {
  const { searchQuery, setSearchQuery } = usePayments();
  const navigate = useNavigate();

  const handleOpenPaymentFormForCreate = () => {
    navigate('/payments/new');
  };

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
        <button
          onClick={handleOpenPaymentFormForCreate}
          className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />Record Payment
        </button>
      </div>
      <PaymentList onEditPayment={handleOpenPaymentFormForEdit} onViewPayment={handleViewPayment} />
    </>
  );
};

export default PaymentsTab;
