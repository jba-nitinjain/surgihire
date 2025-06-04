import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MaintenanceRecord, PaginationParams, ApiResponse, Equipment } from '../types';
import { fetchMaintenanceRecords, searchMaintenanceRecords, fetchEquipment } from '../services/api'; // Assuming fetchEquipment might be needed to get names

const CONTEXT_NAME = "MaintenanceRecordContext";

// Define specific filters for maintenance records
interface MaintenanceRecordFilters {
  equipment_id: number | string | null; // Can be number or string if 'all' is an option
  maintenance_type: string | null;
  // Add other filters like date ranges if needed
}

interface MaintenanceRecordContextType {
  maintenanceRecords: MaintenanceRecord[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  currentPage: number;
  searchQuery: string;
  filters: MaintenanceRecordFilters;
  equipmentListForFilter: Equipment[]; // To populate equipment dropdown
  loadingEquipmentList: boolean;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<MaintenanceRecordFilters>) => void;
  fetchMaintenanceRecordsPage: (page: number) => void;
  refreshMaintenanceRecords: () => void;
  fetchEquipmentListForFilter: () => void; // To explicitly fetch equipment
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

  // For populating equipment filter dropdown
  const [equipmentListForFilter, setEquipmentListForFilter] = useState<Equipment[]>([]);
  const [loadingEquipmentList, setLoadingEquipmentList] = useState(false);

  const fetchEquipmentListForFilter = useCallback(async () => {
    // console.log(`${CONTEXT_NAME}: Fetching equipment list for filter dropdown.`);
    setLoadingEquipmentList(true);
    try {
      // Fetch all equipment - adjust if pagination is needed for a very long list
      const response = await fetchEquipment({ records: 500, skip: 0 }); // Fetch a large number, or implement scrolling dropdown
      if (response.success && Array.isArray(response.data)) {
        setEquipmentListForFilter(response.data as Equipment[]);
      } else {
        console.error(`${CONTEXT_NAME}: Failed to fetch equipment list for filters.`, response.message);
        setEquipmentListForFilter([]); // Set to empty on error
      }
    } catch (err) {
      console.error(`${CONTEXT_NAME}: Error fetching equipment list for filters.`, err);
      setEquipmentListForFilter([]);
    } finally {
      setLoadingEquipmentList(false);
    }
  }, []);


  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      // Potentially map equipment_id to equipment_name here if API doesn't provide it
      // For now, assuming MaintenanceRecord might have equipment_name from a JOIN or it's handled in UI
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
      setMaintenanceRecords([]);
      setTotalRecords(0);
    } else {
      setError(response.message || 'Unable to fetch maintenance records.');
      if (maintenanceRecords.length === 0) {
        setMaintenanceRecords([]);
        setTotalRecords(0);
      }
    }
  };

  const fetchMaintenanceRecordsPage = useCallback(async (page: number, query: string, currentFilters: MaintenanceRecordFilters) => {
    // console.log(`${CONTEXT_NAME}: Fetching page ${page}, query "${query}", filters:`, currentFilters, `loading: ${loading}`);
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;

      const activeFiltersForApi: Record<string, string | number | null> = {};
      if (currentFilters.equipment_id && currentFilters.equipment_id !== 'all' && String(currentFilters.equipment_id).trim() !== '') {
        activeFiltersForApi.equipment_id = Number(currentFilters.equipment_id);
      }
      if (currentFilters.maintenance_type && currentFilters.maintenance_type !== 'all') {
        activeFiltersForApi.maintenance_type = currentFilters.maintenance_type;
      }

      const paginationParams: PaginationParams = {
        records: recordsPerPage,
        skip,
        filters: Object.keys(activeFiltersForApi).length > 0 ? activeFiltersForApi : undefined,
      };

      if (query.trim()) {
        // If API supports passing filters along with 'qs' for searchRecords:
        // const searchPaginationParams = { ...paginationParams, filters: paginationParams.filters };
        // response = await searchMaintenanceRecords(query.trim(), searchPaginationParams);
        // If searchRecords doesn't take filters, and 'qs' is a global search:
        response = await searchMaintenanceRecords(query.trim(), {records: recordsPerPage, skip});
        // If search should also respect filters, your API's searchRecords or listRecords with 'qs' needs to handle 'q' and 'qs'
      } else {
        response = await fetchMaintenanceRecords(paginationParams);
      }
      processApiResponse(response, page, skip);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (maintenanceRecords.length === 0) {
        setMaintenanceRecords([]);
        setTotalRecords(0);
      }
    } finally {
      setLoading(false);
      const noActiveFilters = (!currentFilters.equipment_id || currentFilters.equipment_id === 'all' || String(currentFilters.equipment_id).trim() === '') &&
                              (!currentFilters.maintenance_type || currentFilters.maintenance_type === 'all');
      if (page === 1 && !query.trim() && noActiveFilters) {
        // console.log(`${CONTEXT_NAME}: Setting initialLoadDone to true.`);
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, maintenanceRecords.length]);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  const setFilters = useCallback((newFilters: Partial<MaintenanceRecordFilters>) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ equipment_id: null, maintenance_type: null });
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const noActiveFilters = (!filters.equipment_id || filters.equipment_id === 'all' || String(filters.equipment_id).trim() === '') &&
                            (!filters.maintenance_type || filters.maintenance_type === 'all');
    if (!searchQuery.trim() && noActiveFilters && !initialLoadDone && !loading) {
    //   console.log(`${CONTEXT_NAME}: Initial/Default load triggered.`);
      fetchMaintenanceRecordsPage(1, '', filters);
    }
  }, [searchQuery, filters, initialLoadDone, loading, fetchMaintenanceRecordsPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() || filters.equipment_id || filters.maintenance_type) { // Fetch if search or any filter is active
        // console.log(`${CONTEXT_NAME}: Debounced search/filter fetch.`);
        fetchMaintenanceRecordsPage(1, searchQuery.trim(), filters);
      }
    }, 700);

    return () => clearTimeout(handler);
  }, [searchQuery, filters, fetchMaintenanceRecordsPage]);


  const refreshMaintenanceRecords = () => {
    // console.log(`${CONTEXT_NAME}: Refreshing. Current page: ${currentPage}, Query: "${searchQuery}", Filters:`, filters);
    const noActiveFilters = (!filters.equipment_id || filters.equipment_id === 'all' || String(filters.equipment_id).trim() === '') &&
                            (!filters.maintenance_type || filters.maintenance_type === 'all');
    if (currentPage === 1 && !searchQuery.trim() && noActiveFilters) {
        setInitialLoadDone(false);
    }
    fetchMaintenanceRecordsPage(currentPage, searchQuery, filters);
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
    clearFilters,
    fetchMaintenanceRecordsPage: (page: number) => fetchMaintenanceRecordsPage(page, searchQuery, filters),
    refreshMaintenanceRecords,
    fetchEquipmentListForFilter,
  };

  return (
    <MaintenanceRecordContext.Provider value={value}>
      {children}
    </MaintenanceRecordContext.Provider>
  );
};
