import React from 'react';
import { useCustomers } from '../context/CustomerContext';
import CustomerListItem from './CustomerListItem';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Spinner from './ui/Spinner';
import Pagination from './ui/Pagination';
import EmptyState from './ui/EmptyState';
import ErrorDisplay from './ui/ErrorDisplay';
import { Customer } from '../types';

interface CustomerListProps {
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void; // Add this prop
  onViewRentals: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  onSelectCustomer,
  onEditCustomer,
  onViewRentals
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
    <Paper elevation={2} sx={{ overflow: 'hidden', p: 2 }}>
      <Grid container spacing={2}>
        {customers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={customer.customer_id}>
            <CustomerListItem
              customer={customer}
              onSelect={onSelectCustomer}
              onEdit={onEditCustomer}
              onViewRentals={onViewRentals}
            />
          </Grid>
        ))}
      </Grid>
      {loading && customers.length > 0 && (
        <div className="my-4 flex justify-center">
          <Spinner size="md" />
        </div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchPage} />
        </div>
      )}
    </Paper>
  );
};

export default CustomerList;
