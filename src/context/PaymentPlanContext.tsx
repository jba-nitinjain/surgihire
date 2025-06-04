import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PaymentPlan, PaginationParams, ApiResponse } from '../types';
import { fetchPaymentPlans, searchPaymentPlans } from '../services/api';

// const CONTEXT_NAME = "PaymentPlanContext"; // For logging

interface PaymentPlanContextType {
  paymentPlans: PaymentPlan[];
  loading: boolean;
  error: string | null;
  totalPaymentPlans: number;
  currentPage: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchPaymentPlansPage: (page: number) => void;
  refreshPaymentPlans: () => void;
}

const PaymentPlanContext = createContext<PaymentPlanContextType | undefined>(undefined);

export const usePaymentPlans = () => {
  const context = useContext(PaymentPlanContext);
  if (!context) {
    throw new Error('usePaymentPlans must be used within a PaymentPlanProvider');
  }
  return context;
};

interface PaymentPlanProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const PaymentPlanProvider: React.FC<PaymentPlanProviderProps> = ({
  children,
  recordsPerPage = 10,
}) => {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaymentPlans, setTotalPaymentPlans] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setPaymentPlans(response.data as PaymentPlan[]);
      const apiTotalRecords = response.totalRecords;
      if (typeof apiTotalRecords === 'number') {
        setTotalPaymentPlans(apiTotalRecords);
      } else {
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalPaymentPlans(prevTotal => Math.max(prevTotal, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Received unexpected data format for payment plans list.');
      setPaymentPlans([]);
      setTotalPaymentPlans(0);
    } else {
      setError(response.message || 'Unable to fetch payment plans.');
      if (paymentPlans.length === 0) {
        setPaymentPlans([]);
        setTotalPaymentPlans(0);
      }
    }
  };

  const fetchPaymentPlansPage = useCallback(async (page: number, query: string) => {
    // console.log(`${CONTEXT_NAME}: Fetching page ${page}, query "${query}", loading: ${loading}`);
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;
      const paginationParams: PaginationParams = { records: recordsPerPage, skip };

      if (query.trim()) {
        response = await searchPaymentPlans(query.trim(), paginationParams);
      } else {
        response = await fetchPaymentPlans(paginationParams);
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (paymentPlans.length === 0) {
        setPaymentPlans([]);
        setTotalPaymentPlans(0);
      }
    } finally {
      setLoading(false);
      if (page === 1 && !query.trim()) {
        // console.log(`${CONTEXT_NAME}: Setting initialLoadDone to true after fetching page 1 with no query.`);
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, paymentPlans.length]);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false); 
  };

  useEffect(() => {
    if (!searchQuery.trim() && !initialLoadDone && !loading) {
    //   console.log(`${CONTEXT_NAME}: Initial/Default load triggered. initialLoadDone: ${initialLoadDone}, loading: ${loading}`);
      fetchPaymentPlansPage(1, '');
    }
  }, [searchQuery, initialLoadDone, loading, fetchPaymentPlansPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        // console.log(`${CONTEXT_NAME}: Debounced search for: "${searchQuery.trim()}"`);
        fetchPaymentPlansPage(1, searchQuery.trim());
      }
    }, 700); 

    return () => clearTimeout(handler);
  }, [searchQuery, fetchPaymentPlansPage]);


  const refreshPaymentPlans = () => {
    // console.log(`${CONTEXT_NAME}: Refreshing. Current page: ${currentPage}, Query: "${searchQuery}"`);
    if (currentPage === 1 && !searchQuery.trim()) {
        setInitialLoadDone(false);
    }
    fetchPaymentPlansPage(currentPage, searchQuery);
  };

  const value = {
    paymentPlans,
    loading,
    error,
    totalPaymentPlans,
    currentPage,
    searchQuery,
    setSearchQuery,
    fetchPaymentPlansPage: (page: number) => fetchPaymentPlansPage(page, searchQuery),
    refreshPaymentPlans,
  };

  return (
    <PaymentPlanContext.Provider value={value}>
      {children}
    </PaymentPlanContext.Provider>
  );
};
