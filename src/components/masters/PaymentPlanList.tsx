import React from 'react';
import { usePaymentPlans } from '../../context/PaymentPlanContext';
import PaymentPlanListItem from './PaymentPlanListItem';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { PaymentPlan } from '../../types';
import { ListChecks } from 'lucide-react';

interface PaymentPlanListProps {
  onEditPlan: (plan: PaymentPlan) => void;
}

const PaymentPlanList: React.FC<PaymentPlanListProps> = ({ onEditPlan }) => {
  const {
    paymentPlans,
    loading,
    error,
    totalPaymentPlans,
    currentPage,
    fetchPaymentPlansPage,
    refreshPaymentPlans,
    searchQuery,
  } = usePaymentPlans();

  const recordsPerPage = 10; // Should match context
  const totalPages = Math.ceil(totalPaymentPlans / recordsPerPage);

  if (loading && paymentPlans.length === 0 && !searchQuery) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshPaymentPlans} />;
  }

  if (paymentPlans.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? "No payment plans match your search" : "No Payment Plans Found"}
        message={searchQuery ? "Try a different search term." : "Get started by adding a new payment plan."}
        icon={<ListChecks className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-gray-200">
          <thead className="bg-light-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Plan Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Frequency (Days)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Description</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-light-gray-200">
            {paymentPlans.map(plan => (
              <PaymentPlanListItem
                key={plan.plan_id}
                plan={plan}
                onEdit={onEditPlan}
              />
            ))}
          </tbody>
        </table>
      </div>
      {loading && paymentPlans.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchPaymentPlansPage}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentPlanList;
