import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PaymentDetail from '../payments/PaymentDetail';
import { Payment } from '../../types';
import { getPayment } from '../../services/api/payments';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { payment?: Payment } };
  const [payment, setPayment] = useState<Payment | null>(location.state?.payment || null);
  const [loading, setLoading] = useState<boolean>(!!id && !payment);

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

  if (!payment) {
    return <div className="p-4">Payment not found.</div>;
  }

  return (
    <div className="p-4">
      <PaymentDetail payment={payment} onClose={() => navigate(-1)} isModal={false} />
    </div>
  );
};

export default PaymentDetailPage;
