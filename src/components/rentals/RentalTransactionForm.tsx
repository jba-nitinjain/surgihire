import React, { useEffect } from 'react'; // Added useEffect
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { useCustomers } from '../../context/CustomerContext';
import { usePaymentPlans } from '../../context/PaymentPlanContext'; // Import PaymentPlans context
import RentalTransactionCard from './RentalTransactionCard';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { RentalTransaction } from '../../types';
import { CalendarCheck2 } from 'lucide-react';

interface RentalTransactionListProps {
  onEditRental: (rental: RentalTransaction) => void;
  // onViewRentalDetail: (rental: RentalTransaction) => void;
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

  const { customers: allCustomers, loading: customersLoading, refreshData: refreshCustomerList } = useCustomers();
  const { paymentPlans, loading: paymentPlansLoading, refreshPaymentPlans } = usePaymentPlans(); // Get payment plans

  useEffect(() => {
    // Fetch customers if not already loaded
    if (allCustomers.length === 0 && !customersLoading) {
        refreshCustomerList();
    }
    // Fetch payment plans if not already loaded
    if (paymentPlans.length === 0 && !paymentPlansLoading) {
        refreshPaymentPlans();
    }
  }, [allCustomers.length, customersLoading, refreshCustomerList, paymentPlans.length, paymentPlansLoading, refreshPaymentPlans]);


  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const getCustomerName = (customerId: string): string | undefined => {
    const customer = allCustomers.find(c => c.customer_id === customerId);
    return customer?.full_name;
  };

  const getPaymentPlanName = (paymentTermId: number | null): string | undefined => {
    if (paymentTermId === null) return undefined;
    const plan = paymentPlans.find(p => p.plan_id === paymentTermId);
    return plan?.plan_name;
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
      {(customersLoading || paymentPlansLoading) && rentalTransactions.length > 0 && (
        <div className="my-2 flex justify-center items-center text-sm text-gray-500">
          <Spinner size="sm" /> <span className="ml-2">Loading additional details...</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {rentalTransactions.map(rental => (
          <RentalTransactionCard
            key={rental.rental_id}
            rental={{
              ...rental,
              customer_name: getCustomerName(rental.customer_id) || `ID: ${rental.customer_id}`,
              payment_term_name: getPaymentPlanName(rental.payment_term_id) || (rental.payment_term_id ? `Plan ID: ${rental.payment_term_id}` : undefined),
            }}
            onEdit={onEditRental}
            // onClick={onViewRentalDetail}
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
