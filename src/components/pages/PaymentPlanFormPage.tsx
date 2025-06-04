import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PaymentPlanForm from '../masters/PaymentPlanForm';
import { PaymentPlan } from '../../types';
import { getPaymentPlan } from '../../services/api/paymentPlans';
import { usePaymentPlans } from '../../context/PaymentPlanContext';

const PaymentPlanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { plan?: PaymentPlan } };

  const [plan, setPlan] = useState<PaymentPlan | null>(location.state?.plan || null);
  const [loading, setLoading] = useState<boolean>(!!id && !plan);
  const { refreshPaymentPlans } = usePaymentPlans();

  useEffect(() => {
    if (id && !plan) {
      getPaymentPlan(Number(id))
        .then(res => {
          if (res.success && res.data) {
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setPlan(data as PaymentPlan);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, plan]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <PaymentPlanForm
        plan={plan}
        onSave={() => { refreshPaymentPlans(); navigate('/masters/payment-plans'); }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default PaymentPlanFormPage;

