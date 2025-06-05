import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CustomerForm from '../CustomerForm';
import { Customer } from '../../types';
import { getCustomer } from '../../services/api/customers';
import { useCustomers } from '../../context/CustomerContext';

const CustomerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { customer?: Customer; returnToRental?: boolean } };
  const [customer, setCustomer] = useState<Customer | null>(location.state?.customer || null);
  const [loading, setLoading] = useState<boolean>(!!id && !customer);
  const { refreshData: refreshCustomerData } = useCustomers();

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

  return (
    <div className="p-4">
      <CustomerForm
        customer={customer}
        onSave={(newId) => {
          refreshCustomerData();
          if (location.state?.returnToRental && newId) {
            navigate('/rentals/new', { state: { selectedCustomerId: String(newId) } });
          } else {
            navigate('/customers');
          }
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default CustomerFormPage;
