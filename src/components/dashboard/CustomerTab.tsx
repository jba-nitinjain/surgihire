import React from 'react';
import { useCustomers } from '../../context/CustomerContext';
import CustomerList from '../CustomerList';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import { Customer } from '../../types';

// No props needed from Dashboard for its internal UI state management
const CustomerTab: React.FC = () => {
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
        <button
          onClick={handleOpenCustomerFormForCreate}
          className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />Add New Customer
        </button>
      </div>
      <CustomerList
        onSelectCustomer={handleSelectCustomerForDetail}
        onEditCustomer={handleOpenCustomerFormForEdit}
      />
    </>
  );
};

export default CustomerTab;
