import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CustomerDetail from '../CustomerDetail';
import { Customer } from '../../types';
import { getCustomer } from '../../services/api/customers';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { customer?: Customer } };
  const [customer, setCustomer] = useState<Customer | null>(location.state?.customer || null);
  const [loading, setLoading] = useState<boolean>(!!id && !customer);

  useEffect(() => {
    if (id && !customer) {
      getCustomer(id).then(res => {
        if (res.success && res.data) {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          setCustomer(data as Customer);
        }
      }).finally(() => setLoading(false));
    }
  }, [id, customer]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!customer) {
    return <div className="p-4">Customer not found.</div>;
  }

  return (
    <div className="p-4">
      <CustomerDetail
        customer={customer}
        isModal={false}
        onClose={() => navigate(-1)}
        onEdit={() => navigate(`/customers/${customer.customer_id}/edit`, { state: { customer } })}
      />
    </div>
  );
};

export default CustomerDetailPage;
