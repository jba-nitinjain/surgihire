import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Equipment, PaginationParams, ApiResponse, EquipmentCategory } from '../types'; 
import { fetchEquipment, searchEquipment } from '../services/api'; 

const CONTEXT_NAME = "EquipmentContext"; // For logging

interface EquipmentFilters {
  status: string | null;
  category_id: number | string | null; 
}

interface EquipmentContextType {
  equipmentList: Equipment[];
  loading: boolean;
  error: string | null;
  totalEquipment: number;
  currentPage: number;
  searchQuery: string;
  filters: EquipmentFilters;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  fetchEquipmentPage: (page: number) => void;
  refreshEquipmentData: () => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
};

interface EquipmentProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({ 
  children, 
  recordsPerPage = 10 
}) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFiltersState] = useState<EquipmentFilters>({ status: null, category_id: null });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setEquipmentList(response.data as Equipment[]);
      const apiTotalRecords = response.totalRecords;
      if (typeof apiTotalRecords === 'number') {
          setTotalEquipment(apiTotalRecords);
      } else {
          const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
          setTotalEquipment(prevTotal => Math.max(prevTotal, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Received unexpected data format for equipment list.');
      setEquipmentList([]);
      setTotalEquipment(0);
    } else {
      setError(response.message || 'Unable to fetch equipment. Please try again later.');
      if (equipmentList.length === 0) {
        setEquipmentList([]);
        setTotalEquipment(0);
      }
    }
  };
  
  const fetchEquipmentData = useCallback(async (page: number, query: string, currentFilters: EquipmentFilters) => {
    // console.log(`${CONTEXT_NAME}: Fetching page ${page}, query "${query}", filters:`, currentFilters, `loading: ${loading}`);
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;
      
      const activeFiltersForApi: Record<string, string | number | null> = {};
      if (currentFilters.status && currentFilters.status !== 'all') { 
        activeFiltersForApi.status = currentFilters.status;
      }
      if (currentFilters.category_id && currentFilters.category_id !== 'all' && String(currentFilters.category_id).trim() !== '') {
         activeFiltersForApi.category_id = Number(currentFilters.category_id); 
      }

      const paginationParams: PaginationParams = { 
        records: recordsPerPage, 
        skip,
        filters: Object.keys(activeFiltersForApi).length > 0 ? activeFiltersForApi : undefined,
      };

      if (query.trim()) {
        response = await searchEquipment(query.trim(), {records: recordsPerPage, skip}); // Search might ignore currentFilters depending on API
      } else {
        response = await fetchEquipment(paginationParams); 
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (equipmentList.length === 0) { 
        setEquipmentList([]);
        setTotalEquipment(0);
      }
    } finally {
      setLoading(false);
      const noActiveFilters = (!currentFilters.status || currentFilters.status === 'all') && 
                              (!currentFilters.category_id || currentFilters.category_id === 'all' || String(currentFilters.category_id).trim() === '');
      if (page === 1 && !query.trim() && noActiveFilters) {
        // console.log(`${CONTEXT_NAME}: Setting initialLoadDone to true after fetching page 1 with no query and no active filters.`);
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, equipmentList.length]); // Removed filters and searchQuery from here, they are passed as args

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false); 
  };

  const setFilters = (newFilters: Partial<EquipmentFilters>) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1); 
    setInitialLoadDone(false); 
  };

  // Effect for initial load OR when search query/filters are cleared to a "default" state
  useEffect(() => {
    const noActiveFilters = (!filters.status || filters.status === 'all') && 
                            (!filters.category_id || filters.category_id === 'all' || String(filters.category_id).trim() === '');
    if (!searchQuery.trim() && noActiveFilters && !initialLoadDone && !loading) {
    //   console.log(`${CONTEXT_NAME}: Initial/Default load triggered. initialLoadDone: ${initialLoadDone}, loading: ${loading}, filters:`, filters);
      fetchEquipmentData(1, '', filters);
    }
  }, [searchQuery, filters, initialLoadDone, loading, fetchEquipmentData]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        // console.log(`${CONTEXT_NAME}: Debounced search for: "${searchQuery.trim()}"`);
        fetchEquipmentData(1, searchQuery.trim(), filters); // Pass current filters
      }
      // If searchQuery is cleared, the useEffect for initial/default load handles it.
    }, 700);

    return () => clearTimeout(handler);
  }, [searchQuery, filters, fetchEquipmentData]);


  const refreshEquipmentData = () => {
    // console.log(`${CONTEXT_NAME}: Refreshing. Current page: ${currentPage}, Query: "${searchQuery}", Filters:`, filters);
    const noActiveFilters = (!filters.status || filters.status === 'all') && 
                            (!filters.category_id || filters.category_id === 'all' || String(filters.category_id).trim() === '');
    if (currentPage === 1 && !searchQuery.trim() && noActiveFilters) {
        setInitialLoadDone(false);
    }
    fetchEquipmentData(currentPage, searchQuery, filters);
  };

  const value = {
    equipmentList,
    loading,
    error,
    totalEquipment,
    currentPage,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    fetchEquipmentPage: (page: number) => fetchEquipmentData(page, searchQuery, filters),
    refreshEquipmentData
  };

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
};
