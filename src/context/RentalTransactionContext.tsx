import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RentalTransaction, PaginationParams, ApiResponse, Customer } from '../types';
import { fetchRentals, searchRecords, fetchCustomers } from '../services/api'; // Assuming searchRecords can be used for rentals

const CONTEXT_NAME = "RentalTransactionContext";

// Define specific filters for rental transactions if needed
export interface RentalTransactionFilters {
  status: string | null;
  customer_id: string | null; // Customer ID for filtering by customer
  // Add other filters like date ranges if needed
}

interface RentalTransactionContextType {
  rentalTransactions: RentalTransaction[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  currentPage: number;
  searchQuery: string;
  filters: RentalTransactionFilters;
  customersForFilter: Customer[]; // To populate customer dropdown for filtering/forms
  loadingCustomers: boolean;
  setSearchQuery: (query: string) => void;
  setFilters: (filtersUpdate: Partial<RentalTransactionFilters>) => void;
  fetchRentalTransactionsPage: (page: number) => void;
  refreshRentalTransactions: () => void;
  fetchCustomersForSelection: () => void; // To explicitly fetch customers
}

const RentalTransactionContext = createContext<RentalTransactionContextType | undefined>(undefined);

export const useRentalTransactions = () => {
  const context = useContext(RentalTransactionContext);
  if (!context) {
    throw new Error('useRentalTransactions must be used within a RentalTransactionProvider');
  }
  return context;
};

interface RentalTransactionProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const RentalTransactionProvider: React.FC<RentalTransactionProviderProps> = ({
  children,
  recordsPerPage = 10,
}) => {
  const [rentalTransactions, setRentalTransactions] = useState<RentalTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFiltersState] = useState<RentalTransactionFilters>({ status: null, customer_id: null });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [customersForFilter, setCustomersForFilter] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch customers for dropdowns (e.g., in forms or filter UI)
  const fetchCustomersForSelection = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      // Fetch a reasonable number of customers for selection, or implement pagination/search for the select itself
      const response = await fetchCustomers({ records: 200, skip: 0 });
      if (response.success && Array.isArray(response.data)) {
        setCustomersForFilter(response.data as Customer[]);
      } else {
        console.error(`${CONTEXT_NAME}: Failed to fetch customers for selection.`, response.message);
        setCustomersForFilter([]);
      }
    } catch (err) {
      console.error(`${CONTEXT_NAME}: Error fetching customers for selection.`, err);
      setCustomersForFilter([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  const processApiResponse = useCallback((response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      // TODO: Potentially enrich rental transactions with customer_name here if API doesn't provide it
      // This would require having the customer list available or making additional calls.
      // For now, assuming customer_name might be added by the backend or handled in UI component.
      setRentalTransactions(response.data as RentalTransaction[]);
      const apiTotalRecords = response.totalRecords;
      if (typeof apiTotalRecords === 'number') {
        setTotalRecords(apiTotalRecords);
      } else {
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalRecords(prevTotal => Math.max(prevTotal, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Received unexpected data format for rental transactions.');
      setRentalTransactions([]);
      setTotalRecords(0);
    } else {
      setError(response.message || 'Unable to fetch rental transactions.');
    }
  }, [recordsPerPage]);

  const fetchRentalTransactionsData = useCallback(async (page: number, query: string, currentFilters: RentalTransactionFilters) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      const activeFiltersForApi: Record<string, string | number | null> = {};
      if (currentFilters.status && String(currentFilters.status).trim() !== '') {
        activeFiltersForApi.status = currentFilters.status;
      }
      if (currentFilters.customer_id && String(currentFilters.customer_id).trim() !== '') {
        activeFiltersForApi.customer_id = currentFilters.customer_id;
      }

      const paginationParams: PaginationParams = {
        records: recordsPerPage,
        skip,
        filters: Object.keys(activeFiltersForApi).length > 0 ? activeFiltersForApi : undefined,
      };

      let response: ApiResponse;
      if (query.trim()) {
        // Use generic searchRecords, assuming 'rental_transactions' table and 'qs' for search term
        response = await searchRecords('rental_transactions', query.trim(), paginationParams);
      } else {
        response = await fetchRentals(paginationParams);
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      const noActiveFilters = !currentFilters.status && !currentFilters.customer_id;
      if (page === 1 && !query.trim() && noActiveFilters) {
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, processApiResponse]);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  const setFilters = useCallback((filtersUpdate: Partial<RentalTransactionFilters>) => {
    setFiltersState(prevFilters => {
      const newCombinedFilters = { ...prevFilters, ...filtersUpdate };
      if (
        newCombinedFilters.status !== prevFilters.status ||
        newCombinedFilters.customer_id !== prevFilters.customer_id
      ) {
        setCurrentPage(1);
        setInitialLoadDone(false);
        return newCombinedFilters;
      }
      return prevFilters;
    });
  }, []);

  useEffect(() => {
    const noActiveFilters = !filters.status && !filters.customer_id;
    if (!searchQuery.trim() && noActiveFilters && !initialLoadDone && !loading) {
      fetchRentalTransactionsData(1, '', filters);
    }
  }, [searchQuery, filters, initialLoadDone, loading, fetchRentalTransactionsData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const shouldFetch = searchQuery.trim() || filters.status || filters.customer_id;
      if (shouldFetch) {
        fetchRentalTransactionsData(1, searchQuery.trim(), filters);
      }
    }, 700);
    return () => clearTimeout(handler);
  }, [searchQuery, filters, fetchRentalTransactionsData]);

  const refreshRentalTransactions = () => {
    const noActiveFilters = !filters.status && !filters.customer_id;
    if (currentPage === 1 && !searchQuery.trim() && noActiveFilters) {
      setInitialLoadDone(false);
    }
    fetchRentalTransactionsData(currentPage, searchQuery, filters);
  };

  const value = {
    rentalTransactions,
    loading,
    error,
    totalRecords,
    currentPage,
    searchQuery,
    filters,
    customersForFilter,
    loadingCustomers,
    setSearchQuery,
    setFilters,
    fetchRentalTransactionsPage: (page: number) => fetchRentalTransactionsData(page, searchQuery, filters),
    refreshRentalTransactions,
    fetchCustomersForSelection,
  };

  return (
    <RentalTransactionContext.Provider value={value}>
      {children}
    </RentalTransactionContext.Provider>
  );
};
