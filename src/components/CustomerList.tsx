import React from 'react';
import { useCustomers } from '../context/CustomerContext';
import CustomerCard from './CustomerCard';
import Spinner from './ui/Spinner';
import Pagination from './ui/Pagination';
import EmptyState from './ui/EmptyState';
import ErrorDisplay from './ui/ErrorDisplay';
import { Customer } from '../types';

interface CustomerListProps {
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void; // Add this prop
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  onSelectCustomer, 
  onEditCustomer 
}) => {
  const { 
    customers, 
    loading, 
    error, 
    totalCustomers, 
    currentPage, 
    fetchPage,
    refreshData,
    searchQuery // Added to pass to EmptyState for context
  } = useCustomers();

  const recordsPerPage = 10; // This should ideally come from CustomerContext or be a shared constant
  const totalPages = Math.ceil(totalCustomers / recordsPerPage);

  if (loading && customers.length === 0 && !searchQuery) { // Show spinner only on initial load without search
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshData} />;
  }

  if (customers.length === 0) {
    return <EmptyState 
             title={searchQuery ? "No customers match your search" : "No customers found"}
             message={searchQuery ? "Try a different search term." : "Get started by adding a new customer."}
           />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {customers.map(customer => (
          <CustomerCard 
            key={customer.customer_id} 
            customer={customer} 
            onClick={onSelectCustomer}
            onEdit={onEditCustomer} // Pass down the onEditCustomer handler
          />
        ))}
      </div>
      
      {loading && customers.length > 0 && ( // Show spinner at bottom if loading more pages/search results
        <div className="my-4 flex justify-center">
          <Spinner size="md" />
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchPage}
        />
      )}
    </div>
  );
};

export default CustomerList;
