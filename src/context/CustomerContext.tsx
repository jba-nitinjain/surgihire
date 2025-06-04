import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Customer, PaginationParams, ApiResponse } from '../types';
import { fetchCustomers, searchCustomers } from '../services/api/customers';

const CONTEXT_NAME = "CustomerContext"; // For logging

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  totalCustomers: number;
  currentPage: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchPage: (page: number) => void; // Renamed for clarity from original, assuming it fetches a specific page
  refreshData: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ 
  children, 
  recordsPerPage = 10 
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false); // Default to false
  const [error, setError] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false); // Flag for initial load

  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setCustomers(response.data as Customer[]);
      const apiTotalRecords = response.totalRecords;
      if (typeof apiTotalRecords === 'number') {
        setTotalCustomers(apiTotalRecords);
      } else {
        // Estimate total: if response.data.length < recordsPerPage, it's likely the last page
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalCustomers(prevTotal => Math.max(prevTotal, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Received unexpected data format for customers list.');
      setCustomers([]);
      setTotalCustomers(0);
    } else {
      setError(response.message || 'Unable to fetch customers. Please try again later.');
      if (customers.length === 0) { // Only clear if no data was previously loaded
        setCustomers([]);
        setTotalCustomers(0);
      }
    }
  };
  
  // Renamed from fetchPage in original to avoid confusion with the exported fetchPage
  const fetchCustomerData = useCallback(async (page: number, query: string) => {
    // console.log(`${CONTEXT_NAME}: Fetching page ${page}, query "${query}", initialLoadDone: ${initialLoadDone}, loading: ${loading}`);
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      const params: PaginationParams = { records: recordsPerPage, skip };
      let response: ApiResponse;
      
      if (query.trim()) {
        response = await searchCustomers(query.trim(), params);
      } else {
        response = await fetchCustomers(params);
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (customers.length === 0) {
        setCustomers([]);
        setTotalCustomers(0);
      }
    } finally {
      setLoading(false);
      if (page === 1 && !query.trim()) {
        // console.log(`${CONTEXT_NAME}: Setting initialLoadDone to true after fetching page 1 with no query.`);
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, customers.length]); // customers.length dependency for error handling logic

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1); // Reset page when search query changes
    setInitialLoadDone(false); // New search or clearing search means the "initial state" for that view needs re-evaluation
  };

  // Effect for initial load OR when search query is cleared to a "default" state
  useEffect(() => {
    if (!searchQuery.trim() && !initialLoadDone && !loading) {
    //   console.log(`${CONTEXT_NAME}: Initial/Default load triggered. initialLoadDone: ${initialLoadDone}, loading: ${loading}`);
      fetchCustomerData(1, '');
    }
  }, [searchQuery, initialLoadDone, loading, fetchCustomerData]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        // console.log(`${CONTEXT_NAME}: Debounced search for: "${searchQuery.trim()}"`);
        // initialLoadDone is already false due to setSearchQuery, so fetch will run via the above useEffect or directly
        fetchCustomerData(1, searchQuery.trim());
      }
      // If searchQuery is cleared, the useEffect for initial/default load handles it.
    }, 700); // Debounce time

    return () => clearTimeout(handler);
  }, [searchQuery, fetchCustomerData]);


  const refreshData = () => {
    // console.log(`${CONTEXT_NAME}: Refreshing. Current page: ${currentPage}, Query: "${searchQuery}"`);
    // If refreshing the very first view (page 1, no query), reset initialLoadDone
    if (currentPage === 1 && !searchQuery.trim()) {
        setInitialLoadDone(false);
    }
    fetchCustomerData(currentPage, searchQuery);
  };

  const value = {
    customers,
    loading,
    error,
    totalCustomers,
    currentPage,
    searchQuery,
    setSearchQuery,
    fetchPage: (page: number) => fetchCustomerData(page, searchQuery), // Exported fetchPage calls with current search query
    refreshData
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
