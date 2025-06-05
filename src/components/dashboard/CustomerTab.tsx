import React from 'react';
import { useCustomers } from '../../context/CustomerContext';
import CustomerList from '../CustomerList';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import Button from '@mui/material/Button';
import { Customer } from '../../types';

interface CustomerTabProps {
  onViewRentalsForCustomer: (customerId: string) => void;
}

// No props needed from Dashboard for its internal UI state management
const CustomerTab: React.FC<CustomerTabProps> = ({ onViewRentalsForCustomer }) => {
  const { searchQuery, setSearchQuery } = useCustomers();

  // State managed within CustomerTab
  const navigate = useNavigate();

  const handleSelectCustomerForDetail = (customer: Customer) => {
    navigate(`/customers/${customer.customer_id}`, { state: { customer } });
  };

  const handleOpenCustomerFormForCreate = () => {
    navigate('/customers/new');
  };

  const handleOpenCustomerFormForEdit = (customer: Customer) => {
    navigate(`/customers/${customer.customer_id}/edit`, { state: { customer } });
  };


  return (
    <>
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="w-full md:max-w-xs mb-4 md:mb-0">
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search customers..."/>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCustomerFormForCreate}
          startIcon={<PlusCircle className="h-5 w-5" />}
        >
          Add New Customer
        </Button>
      </div>
      <CustomerList
        onSelectCustomer={handleSelectCustomerForDetail}
        onEditCustomer={handleOpenCustomerFormForEdit}
        onViewRentals={onViewRentalsForCustomer}
      />
    </>
  );
};

export default CustomerTab;
