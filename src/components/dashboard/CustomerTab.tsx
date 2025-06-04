import React, { useState } from 'react';
import { useCustomers } from '../../context/CustomerContext';
import CustomerList from '../CustomerList';
import CustomerDetail from '../CustomerDetail';
import CustomerForm from '../CustomerForm';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import { Customer } from '../../types';

// No props needed from Dashboard for its internal UI state management
const CustomerTab: React.FC = () => {
  const { searchQuery, setSearchQuery, refreshData } = useCustomers();

  // State managed within CustomerTab
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleSelectCustomerForDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerFormOpen(false); // Close form if open
    setEditingCustomer(null);
  };

  const handleCloseCustomerDetail = () => {
    setSelectedCustomer(null);
  };

  const handleOpenCustomerFormForCreate = () => {
    setEditingCustomer(null);
    setSelectedCustomer(null); // Close detail if open
    setIsCustomerFormOpen(true);
  };

  const handleOpenCustomerFormForEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setSelectedCustomer(null); // Close detail view
    setIsCustomerFormOpen(true);
  };

  const handleCloseCustomerForm = () => {
    setIsCustomerFormOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomerForm = () => {
    handleCloseCustomerForm();
    refreshData(); // Refresh customer list from context
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

      {selectedCustomer && !isCustomerFormOpen && ( // Show detail only if form is not open
        <CustomerDetail
          customer={selectedCustomer}
          onClose={handleCloseCustomerDetail}
          onEdit={() => handleOpenCustomerFormForEdit(selectedCustomer)}
        />
      )}
      {isCustomerFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomerForm}
          onCancel={handleCloseCustomerForm}
        />
      )}
    </>
  );
};

export default CustomerTab;
