import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PaymentForm from '../payments/PaymentForm';
import { Payment } from '../../types';
import { getPayment } from '../../services/api/payments';
import { usePayments } from '../../context/PaymentContext';

const PaymentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { payment?: Partial<Payment> } };
  const [payment, setPayment] = useState<Partial<Payment> | null>(location.state?.payment || null);
  const [loading, setLoading] = useState<boolean>(!!id && !payment);
  const { refreshPayments } = usePayments();

  useEffect(() => {
    if (id && !payment) {
      getPayment(Number(id))
        .then(res => {
          if (res.success && res.data) {
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setPayment(data as Payment);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, payment]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <PaymentForm
        payment={payment}
        onSave={() => { refreshPayments(); navigate('/payments'); }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default PaymentFormPage;
