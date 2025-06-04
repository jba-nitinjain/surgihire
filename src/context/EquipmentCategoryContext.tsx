import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { EquipmentCategory, PaginationParams, ApiResponse } from '../types';
import { fetchEquipmentCategories, searchEquipmentCategories } from '../services/api';

interface EquipmentCategoryContextType {
  categories: EquipmentCategory[];
  loading: boolean;
  error: string | null;
  totalCategories: number;
  currentPage: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchCategoriesPage: (page: number) => void;
  refreshCategories: () => void;
  getCategoryNameById: (id: number | null | undefined) => string | undefined; // New function
}

const EquipmentCategoryContext = createContext<EquipmentCategoryContextType | undefined>(undefined);

export const useEquipmentCategories = () => {
  const context = useContext(EquipmentCategoryContext);
  if (!context) {
    throw new Error('useEquipmentCategories must be used within an EquipmentCategoryProvider');
  }
  return context;
};

interface EquipmentCategoryProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const EquipmentCategoryProvider: React.FC<EquipmentCategoryProviderProps> = ({
  children,
  recordsPerPage = 10, // Default, can be overridden
}) => {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(false); // Default to false, set to true during fetch
  const [error, setError] = useState<string | null>(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState(''); // Renamed to avoid conflict
  const [initialLoadDone, setInitialLoadDone] = useState(false);


  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setCategories(response.data as EquipmentCategory[]);
      const apiTotalRecords = response.totalRecords;
      if (typeof apiTotalRecords === 'number') {
        setTotalCategories(apiTotalRecords);
      } else {
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalCategories(prevTotal => Math.max(prevTotal, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Received unexpected data format for equipment categories list.');
      setCategories([]);
      setTotalCategories(0);
    } else {
      setError(response.message || 'Unable to fetch equipment categories.');
      if (categories.length === 0) { // Only clear if no data was previously loaded
        setCategories([]);
        setTotalCategories(0);
      }
    }
  };

  const fetchCategoriesData = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;
      const paginationParams: PaginationParams = { records: recordsPerPage, skip };

      if (query.trim()) {
        response = await searchEquipmentCategories(query.trim(), paginationParams);
      } else {
        response = await fetchEquipmentCategories(paginationParams);
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (categories.length === 0) {
        setCategories([]);
        setTotalCategories(0);
      }
    } finally {
      setLoading(false);
      if (page === 1 && !query.trim()) {
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, categories.length]); // categories.length for error handling logic

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  useEffect(() => {
    if (!searchQuery.trim() && !initialLoadDone && !loading) {
      fetchCategoriesData(1, '');
    }
  }, [searchQuery, initialLoadDone, loading, fetchCategoriesData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchCategoriesData(1, searchQuery.trim());
      }
    }, 700); // Debounce time

    return () => clearTimeout(handler);
  }, [searchQuery, fetchCategoriesData]);


  const refreshCategories = () => {
    if (currentPage === 1 && !searchQuery.trim()) {
        setInitialLoadDone(false);
    }
    fetchCategoriesData(currentPage, searchQuery);
  };

  const getCategoryNameById = useCallback((id: number | null | undefined): string | undefined => {
    if (id === null || id === undefined) return undefined;
    const category = categories.find(cat => cat.category_id === id);
    return category?.category_name;
  }, [categories]);


  const value = {
    categories,
    loading,
    error,
    totalCategories,
    currentPage,
    searchQuery,
    setSearchQuery,
    fetchCategoriesPage: (page: number) => fetchCategoriesData(page, searchQuery),
    refreshCategories,
    getCategoryNameById,
  };

  return (
    <EquipmentCategoryContext.Provider value={value}>
      {children}
    </EquipmentCategoryContext.Provider>
  );
};
