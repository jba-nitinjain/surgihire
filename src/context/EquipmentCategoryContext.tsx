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
  recordsPerPage = 10,
}) => {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

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
      if (categories.length === 0) {
        setCategories([]);
        setTotalCategories(0);
      }
    }
  };

  const fetchCategoriesPage = useCallback(async (page: number, query: string = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;
      const paginationParams: PaginationParams = { records: recordsPerPage, skip };

      if (query.trim()) {
        response = await searchEquipmentCategories(query, paginationParams);
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
    }
  }, [recordsPerPage, searchQuery, categories.length]);

  useEffect(() => {
    if (!searchQuery) {
      fetchCategoriesPage(1, '');
    }
  }, [fetchCategoriesPage]); // searchQuery removed to let debounce handle it

   useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchCategoriesPage(1, searchQuery);
      } else if (!searchQuery.trim() && categories.length === 0 && !loading) { 
        fetchCategoriesPage(1, '');
      }
    }, 500); 

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchCategoriesPage, categories.length, loading]);


  const refreshCategories = () => {
    fetchCategoriesPage(currentPage, searchQuery);
  };

  const value = {
    categories,
    loading,
    error,
    totalCategories,
    currentPage,
    searchQuery,
    setSearchQuery,
    fetchCategoriesPage: (page: number) => fetchCategoriesPage(page, searchQuery),
    refreshCategories,
  };

  return (
    <EquipmentCategoryContext.Provider value={value}>
      {children}
    </EquipmentCategoryContext.Provider>
  );
};
