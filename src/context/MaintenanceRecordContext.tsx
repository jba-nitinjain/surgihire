import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MaintenanceRecord, PaginationParams, ApiResponse, Equipment } from '../types';
import { fetchMaintenanceRecords, searchMaintenanceRecords, fetchEquipment } from '../services/api';

const CONTEXT_NAME = "MaintenanceRecordContext";

export interface MaintenanceRecordFilters { // Exporting for use in MaintenanceTab if needed for Partial type
  equipment_id: number | string | null;
  maintenance_type: string | null;
}

interface MaintenanceRecordContextType {
  maintenanceRecords: MaintenanceRecord[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  currentPage: number;
  searchQuery: string;
  filters: MaintenanceRecordFilters;
  equipmentListForFilter: Equipment[];
  loadingEquipmentList: boolean;
  setSearchQuery: (query: string) => void;
  setFilters: (filtersUpdate: Partial<MaintenanceRecordFilters>) => void; // Changed argument name for clarity
  fetchMaintenanceRecordsPage: (page: number) => void; // To be called by pagination
  refreshMaintenanceRecords: () => void;
  fetchEquipmentListForFilter: () => void;
}

const MaintenanceRecordContext = createContext<MaintenanceRecordContextType | undefined>(undefined);

export const useMaintenanceRecords = () => {
  const context = useContext(MaintenanceRecordContext);
  if (!context) {
    throw new Error('useMaintenanceRecords must be used within a MaintenanceRecordProvider');
  }
  return context;
};

interface MaintenanceRecordProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const MaintenanceRecordProvider: React.FC<MaintenanceRecordProviderProps> = ({
  children,
  recordsPerPage = 10,
}) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFiltersState] = useState<MaintenanceRecordFilters>({ equipment_id: null, maintenance_type: null });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [equipmentListForFilter, setEquipmentListForFilter] = useState<Equipment[]>([]);
  const [loadingEquipmentList, setLoadingEquipmentList] = useState(false);

  const fetchEquipmentListForFilter = useCallback(async () => {
    setLoadingEquipmentList(true);
    try {
      const response = await fetchEquipment({ records: 500, skip: 0 });
      if (response.success && Array.isArray(response.data)) {
        setEquipmentListForFilter(response.data as Equipment[]);
      } else {
        console.error(`${CONTEXT_NAME}: Failed to fetch equipment list for filters.`, response.message);
        setEquipmentListForFilter([]);
      }
    } catch (err) {
      console.error(`${CONTEXT_NAME}: Error fetching equipment list for filters.`, err);
      setEquipmentListForFilter([]);
    } finally {
      setLoadingEquipmentList(false);
    }
  }, []); // Empty dependency array, stable function

  const processApiResponse = useCallback((response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setMaintenanceRecords(response.data as MaintenanceRecord[]);
      const apiTotalRecords = response.totalRecords;
      if (typeof apiTotalRecords === 'number') {
        setTotalRecords(apiTotalRecords);
      } else {
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalRecords(prevTotal => Math.max(prevTotal, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Received unexpected data format for maintenance records.');
      setMaintenanceRecords([]); // Clear on bad format
      setTotalRecords(0);
    } else {
      setError(response.message || 'Unable to fetch maintenance records.');
      // Only clear if no data was previously loaded and error occurs
      // This check was problematic if maintenanceRecords was in deps of fetch function
      // setMaintenanceRecords(prev => prev.length === 0 ? [] : prev);
      // setTotalRecords(prev => prev === 0 ? 0 : prev);
    }
  }, [recordsPerPage]); // Depends only on recordsPerPage

  const fetchMaintenanceRecordsData = useCallback(async (page: number, query: string, currentFilters: MaintenanceRecordFilters) => {
    // console.log(`${CONTEXT_NAME}: Fetching page ${page}, query "${query}", filters:`, currentFilters);
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      const activeFiltersForApi: Record<string, string | number | null> = {};
      if (currentFilters.equipment_id && currentFilters.equipment_id !== 'all' && String(currentFilters.equipment_id).trim() !== '') {
        activeFiltersForApi.equipment_id = Number(currentFilters.equipment_id);
      }
      if (currentFilters.maintenance_type && currentFilters.maintenance_type !== 'all' && String(currentFilters.maintenance_type).trim() !== '') {
        activeFiltersForApi.maintenance_type = currentFilters.maintenance_type;
      }

      const paginationParams: PaginationParams = {
        records: recordsPerPage,
        skip,
        filters: Object.keys(activeFiltersForApi).length > 0 ? activeFiltersForApi : undefined,
      };

      let response: ApiResponse;
      if (query.trim()) {
        // Assuming searchRecords can also take paginationParams that might include filters
        // If not, and search should ignore dropdown filters, then paginationParams.filters should be omitted here.
        response = await searchMaintenanceRecords(query.trim(), paginationParams);
      } else {
        response = await fetchMaintenanceRecords(paginationParams);
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      const noActiveFilters = (!currentFilters.equipment_id || currentFilters.equipment_id === 'all' || String(currentFilters.equipment_id).trim() === '') &&
                              (!currentFilters.maintenance_type || currentFilters.maintenance_type === 'all' || String(currentFilters.maintenance_type).trim() === '');
      if (page === 1 && !query.trim() && noActiveFilters) {
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, processApiResponse]); // processApiResponse is memoized

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  // **CRITICAL FIX HERE**
  // Ensure setFilters only creates a new object reference if filter values actually change.
  const setFilters = useCallback((filtersUpdate: Partial<MaintenanceRecordFilters>) => {
    setFiltersState(prevFilters => {
      const newCombinedFilters = { ...prevFilters, ...filtersUpdate };
      // Check if any relevant filter value has actually changed
      if (
        newCombinedFilters.equipment_id !== prevFilters.equipment_id ||
        newCombinedFilters.maintenance_type !== prevFilters.maintenance_type
      ) {
        setCurrentPage(1); // Reset page only if filters truly changed
        setInitialLoadDone(false); // Trigger fetch if filters change
        return newCombinedFilters; // Return new object
      }
      return prevFilters; // Return previous object if no change, preventing loop
    });
  }, []); // Empty dependency array makes setFilters stable

  // Effect for initial load OR when search query/filters are cleared to a "default" state
  useEffect(() => {
    const noActiveFilters = (!filters.equipment_id || filters.equipment_id === 'all' || String(filters.equipment_id).trim() === '') &&
                            (!filters.maintenance_type || filters.maintenance_type === 'all' || String(filters.maintenance_type).trim() === '');

    if (!searchQuery.trim() && noActiveFilters && !initialLoadDone && !loading) {
      fetchMaintenanceRecordsData(1, '', filters);
    }
  }, [searchQuery, filters, initialLoadDone, loading, fetchMaintenanceRecordsData]); // filters is okay here due to the refined setFilters


  // Debounced search/filter effect (This is line 169 or around it)
  useEffect(() => {
    const currentEqId = filters.equipment_id;
    const currentMaintType = filters.maintenance_type;

    const handler = setTimeout(() => {
      // Fetch if search query is present OR if any filter is actively set (not null/empty/'all')
      const shouldFetch =
        searchQuery.trim() ||
        (currentEqId && currentEqId !== 'all' && String(currentEqId).trim() !== '') ||
        (currentMaintType && currentMaintType !== 'all' && String(currentMaintType).trim() !== '');

      if (shouldFetch) {
        // console.log(`${CONTEXT_NAME}: Debounced search/filter fetch. Query: "${searchQuery.trim()}", Filters:`, filters);
        fetchMaintenanceRecordsData(1, searchQuery.trim(), filters); // Pass the current filters object
      } else if (!searchQuery.trim() && !initialLoadDone) {
        // This condition handles clearing search/filters back to an initial state if not already loaded
        // fetchMaintenanceRecordsData(1, '', filters);
      }
    }, 700);

    return () => clearTimeout(handler);
  // Depend on the primitive values that define the search/filter criteria
  // and the stable fetch function.
  // `filters` object is included because fetchMaintenanceRecordsData needs it.
  // The refined `setFilters` is key to preventing this from looping if filter values don't change.
  }, [searchQuery, filters, fetchMaintenanceRecordsData, initialLoadDone]);


  const refreshMaintenanceRecords = () => {
    const noActiveFilters = (!filters.equipment_id || filters.equipment_id === 'all' || String(filters.equipment_id).trim() === '') &&
                            (!filters.maintenance_type || filters.maintenance_type === 'all' || String(filters.maintenance_type).trim() === '');
    if (currentPage === 1 && !searchQuery.trim() && noActiveFilters) {
        setInitialLoadDone(false); // Re-trigger initial load if on page 1 with no search/filters
    }
    fetchMaintenanceRecordsData(currentPage, searchQuery, filters);
  };

  const value = {
    maintenanceRecords,
    loading,
    error,
    totalRecords,
    currentPage,
    searchQuery,
    filters,
    equipmentListForFilter,
    loadingEquipmentList,
    setSearchQuery,
    setFilters,
    fetchMaintenanceRecordsPage: (page: number) => fetchMaintenanceRecordsData(page, searchQuery, filters),
    refreshMaintenanceRecords,
    fetchEquipmentListForFilter,
  };

  return (
    <MaintenanceRecordContext.Provider value={value}>
      {children}
    </MaintenanceRecordContext.Provider>
  );
};
