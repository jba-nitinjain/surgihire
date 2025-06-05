import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { usePayments } from '../../context/PaymentContext';
import PaymentListItem from './PaymentListItem';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { Payment } from '../../types';
import { IndianRupee } from 'lucide-react';

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
        message={searchQuery ? 'Try a different search term.' : 'Get started by recording a payment.'}
        icon={<IndianRupee className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f9fafb' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Rental ID</TableCell>
              <TableCell>Nature</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <PaymentListItem
                key={payment.payment_id}
                payment={payment}
                onEdit={onEditPayment}
                onView={onViewPayment}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {loading && payments.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchPaymentsPage} />
        </div>
      )}
    </Paper>
  );
};

export default PaymentList;
