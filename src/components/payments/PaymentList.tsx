import React from 'react';
import { usePayments } from '../../context/PaymentContext';
import PaymentListItem from './PaymentListItem';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { Payment } from '../../types';
import { IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatting';

interface PaymentListProps {
  onEditPayment: (payment: Payment) => void;
  onViewPayment: (payment: Payment) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ onEditPayment, onViewPayment }) => {
  const { 
    payments,
    loading,
    error,
    totalPayments,
    currentPage,
    fetchPaymentsPage,
    refreshPayments,
    searchQuery,
    totalAmount,
  } = usePayments();

  const recordsPerPage = 10; // Should match context
  const totalPages = Math.ceil(totalPayments / recordsPerPage);

  if (loading && payments.length === 0 && !searchQuery) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshPayments} />;
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? 'No payments match your search' : 'No Payments Found'}
        message={searchQuery ? 'Try a different search term.' : 'No payments available.'}
        icon={<IndianRupee className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-gray-200">
          <thead className="bg-light-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Nature</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Mode</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-light-gray-200">
            {payments.map(payment => (
              <PaymentListItem
                key={payment.payment_id}
                payment={payment}
                onEdit={onEditPayment}
                onView={onViewPayment}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-light-gray-50 font-medium">
              <td colSpan={4} className="px-6 py-3 text-right">Total</td>
              <td className="px-6 py-3">{formatCurrency(totalAmount)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      {loading && payments.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchPaymentsPage} />
        </div>
      )}
    </div>
  );
};

export default PaymentList;
