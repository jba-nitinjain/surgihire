import React from 'react';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { useCustomers } from '../../context/CustomerContext'; // To get customer names
import RentalTransactionCard from '../../components/rentals/RentalTransactionCard';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { RentalTransaction } from '../../types';
import { CalendarCheck2 } from 'lucide-react';

interface RentalTransactionListProps {
  onEditRental: (rental: RentalTransaction) => void;
  // onViewRentalDetail: (rental: RentalTransaction) => void; // If detail view is implemented
}

const RentalTransactionList: React.FC<RentalTransactionListProps> = ({
  onEditRental,
  // onViewRentalDetail,
}) => {
  const {
    rentalTransactions,
    loading,
    error,
    totalRecords,
    currentPage,
    fetchRentalTransactionsPage,
    refreshRentalTransactions,
    searchQuery,
    filters,
  } = useRentalTransactions();

  // Fetch all customers to map customer_id to customer_name
  // This is a simplified approach. For many customers, a more optimized lookup or backend join is better.
  const { customers: allCustomers, loading: customersLoading } = useCustomers();

  const recordsPerPage = 10; // Should match context
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const getCustomerName = (customerId: string): string | undefined => {
    const customer = allCustomers.find(c => c.customer_id === customerId);
    return customer?.full_name;
  };

  if (loading && rentalTransactions.length === 0 && !searchQuery) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshRentalTransactions} />;
  }

  if (rentalTransactions.length === 0) {
    const isFiltered = filters.status || filters.customer_id || searchQuery.trim() !== '';
    return (
      <EmptyState
        title={isFiltered ? "No rentals match your search/filters" : "No Rental Transactions Found"}
        message={isFiltered ? "Try adjusting your search or filters." : "Get started by creating a new rental transaction."}
        icon={<CalendarCheck2 className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {customersLoading && rentalTransactions.length > 0 && (
        <div className="my-2 flex justify-center items-center text-sm text-gray-500">
          <Spinner size="sm" /> <span className="ml-2">Loading customer details...</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> {/* Adjusted grid for potentially more info */}
        {rentalTransactions.map(rental => (
          <RentalTransactionCard
            key={rental.rental_id}
            rental={{
              ...rental,
              customer_name: getCustomerName(rental.customer_id) || `ID: ${rental.customer_id}`, // Add customer name
            }}
            onEdit={onEditRental}
            // onClick={onViewRentalDetail} // If detail view is implemented
          />
        ))}
      </div>

      {loading && rentalTransactions.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchRentalTransactionsPage}
          />
        </div>
      )}
    </div>
  );
};

export default RentalTransactionList;
