import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Payment, PaginationParams, ApiResponse } from '../types';
import { fetchPayments, searchPayments } from '../services/api/payments';

interface PaymentContextType {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  totalPayments: number;
  currentPage: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchPaymentsPage: (page: number) => void;
  refreshPayments: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({
  children,
  recordsPerPage = 10,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPayments, setTotalPayments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setPayments(response.data as Payment[]);
      const apiTotal = response.totalRecords;
      if (typeof apiTotal === 'number') {
        setTotalPayments(apiTotal);
      } else {
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalPayments(prev => Math.max(prev, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Unexpected data format for payments list.');
      setPayments([]);
      setTotalPayments(0);
    } else {
      setError(response.message || 'Unable to fetch payments.');
      if (payments.length === 0) {
        setPayments([]);
        setTotalPayments(0);
      }
    }
  };

  const fetchPaymentsPage = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;
      const paginationParams: PaginationParams = { records: recordsPerPage, skip };
      if (query.trim()) {
        response = await searchPayments(query.trim(), paginationParams);
      } else {
        response = await fetchPayments(paginationParams);
      }
      processApiResponse(response, page, skip);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      if (payments.length === 0) {
        setPayments([]);
        setTotalPayments(0);
      }
    } finally {
      setLoading(false);
      if (page === 1 && !query.trim()) {
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, payments.length]);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  useEffect(() => {
    if (!searchQuery.trim() && !initialLoadDone && !loading) {
      fetchPaymentsPage(1, '');
    }
  }, [searchQuery, initialLoadDone, loading, fetchPaymentsPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchPaymentsPage(1, searchQuery.trim());
      }
    }, 700);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchPaymentsPage]);

  const refreshPayments = () => {
    if (currentPage === 1 && !searchQuery.trim()) {
      setInitialLoadDone(false);
    }
    fetchPaymentsPage(currentPage, searchQuery);
  };

  const value = {
    payments,
    loading,
    error,
    totalPayments,
    currentPage,
    searchQuery,
    setSearchQuery,
    fetchPaymentsPage: (page: number) => fetchPaymentsPage(page, searchQuery),
    refreshPayments,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

