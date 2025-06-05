import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { Payment, PaginationParams, ApiResponse } from '../types';
import { fetchPayments, searchPayments } from '../services/api/payments';

export interface PaymentFilters {
  rental_id: string | null;
  payment_mode: string | null;
  nature: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface PaymentContextType {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  totalPayments: number;
  currentPage: number;
  searchQuery: string;
  filters: PaymentFilters;
  depositTotal: number;
  rentalTotal: number;
  totalAmount: number;
  setSearchQuery: (query: string) => void;
  setFilters: (update: Partial<PaymentFilters>) => void;
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
  const [filters, setFiltersState] = useState<PaymentFilters>({
    rental_id: null,
    payment_mode: null,
    nature: null,
    start_date: null,
    end_date: null,
  });

  const processApiResponse = useCallback(
    (response: ApiResponse, page: number, currentSkip: number) => {
      if (response.success && Array.isArray(response.data)) {
        setPayments(response.data as Payment[]);
        const apiTotal = response.totalRecords;
        if (typeof apiTotal === 'number') {
          setTotalPayments(apiTotal);
        } else {
          const newTotal =
            currentSkip + response.data.length +
            (response.data.length < recordsPerPage ? 0 : recordsPerPage);
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
    },
    [payments.length, recordsPerPage]
  );

  const fetchPaymentsData = useCallback(
    async (page: number, query: string, currentFilters: PaymentFilters) => {
      setLoading(true);
      setError(null);
      try {
        const skip = (page - 1) * recordsPerPage;
        let response: ApiResponse;
        const activeFilters: Record<string, string | number> = {};
        if (currentFilters.rental_id) activeFilters.rental_id = currentFilters.rental_id;
        if (currentFilters.payment_mode) activeFilters.payment_mode = currentFilters.payment_mode;
        if (currentFilters.nature) activeFilters.nature = currentFilters.nature;
        if (currentFilters.start_date) activeFilters.start_date = currentFilters.start_date;
        if (currentFilters.end_date) activeFilters.end_date = currentFilters.end_date;

        const paginationParams: PaginationParams = {
          records: recordsPerPage,
          skip,
          filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
        };

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
        const noFilters =
          !currentFilters.rental_id &&
          !currentFilters.payment_mode &&
          !currentFilters.nature &&
          !currentFilters.start_date &&
          !currentFilters.end_date;
        if (page === 1 && !query.trim() && noFilters) {
          setInitialLoadDone(true);
        }
      }
    },
    [recordsPerPage, processApiResponse, payments.length]
  );

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  const setFilters = useCallback((update: Partial<PaymentFilters>) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, ...update };
      if (
        newFilters.rental_id !== prev.rental_id ||
        newFilters.payment_mode !== prev.payment_mode ||
        newFilters.nature !== prev.nature ||
        newFilters.start_date !== prev.start_date ||
        newFilters.end_date !== prev.end_date
      ) {
        setCurrentPage(1);
        setInitialLoadDone(false);
        return newFilters;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const noFilters =
      !filters.rental_id &&
      !filters.payment_mode &&
      !filters.nature &&
      !filters.start_date &&
      !filters.end_date;
    if (!searchQuery.trim() && noFilters && !initialLoadDone && !loading) {
      fetchPaymentsData(1, '', filters);
    }
  }, [searchQuery, filters, initialLoadDone, loading, fetchPaymentsData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const shouldFetch =
        searchQuery.trim() ||
        filters.rental_id ||
        filters.payment_mode ||
        filters.nature ||
        filters.start_date ||
        filters.end_date;
      if (shouldFetch) {
        fetchPaymentsData(1, searchQuery.trim(), filters);
      }
    }, 700);
    return () => clearTimeout(handler);
  }, [searchQuery, filters, fetchPaymentsData]);

  const refreshPayments = () => {
    const noFilters =
      !filters.rental_id &&
      !filters.payment_mode &&
      !filters.nature &&
      !filters.start_date &&
      !filters.end_date;
    if (currentPage === 1 && !searchQuery.trim() && noFilters) {
      setInitialLoadDone(false);
    }
    fetchPaymentsData(currentPage, searchQuery, filters);
  };

  const depositTotal = useMemo(() => {
    const now = dayjs();
    return payments
      .filter(
        p =>
          dayjs(p.payment_date).isSame(now, 'month') &&
          p.nature &&
          p.nature.toLowerCase().includes('deposit')
      )
      .reduce((sum, p) => sum + Number(p.payment_amount || 0), 0);
  }, [payments]);

  const rentalTotal = useMemo(() => {
    const now = dayjs();
    return payments
      .filter(
        p =>
          dayjs(p.payment_date).isSame(now, 'month') &&
          (!p.nature || !p.nature.toLowerCase().includes('deposit'))
      )
      .reduce((sum, p) => sum + Number(p.payment_amount || 0), 0);
  }, [payments]);

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.payment_amount || 0), 0);
  }, [payments]);

  const value = {
    payments,
    loading,
    error,
    totalPayments,
    currentPage,
    searchQuery,
    filters,
    depositTotal,
    rentalTotal,
    totalAmount,
    setSearchQuery,
    setFilters,
    fetchPaymentsPage: (page: number) => fetchPaymentsData(page, searchQuery, filters),
    refreshPayments,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

