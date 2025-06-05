import React from 'react';
import { usePayments } from '../../context/PaymentContext';
import PaymentList from '../payments/PaymentList';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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
        <div className="flex flex-col items-start md:items-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenPaymentFormForCreate}
            startIcon={<PlusCircle className="h-5 w-5" />}
          >
            Record Payment
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Log a payment for a rental
          </Typography>
        </div>
      </div>
      <PaymentList onEditPayment={handleOpenPaymentFormForEdit} onViewPayment={handleViewPayment} />
    </>
  );
};

export default PaymentsTab;
