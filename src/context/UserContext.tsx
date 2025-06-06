import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, PaginationParams, ApiResponse } from '../types';
import { fetchUsers, searchUsers } from '../services/api/users';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchUsersPage: (page: number) => void;
  refreshUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
  recordsPerPage?: number;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, recordsPerPage = 10 }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const processApiResponse = (response: ApiResponse, page: number, currentSkip: number) => {
    if (response.success && Array.isArray(response.data)) {
      setUsers(response.data as User[]);
      const apiTotal = response.totalRecords;
      if (typeof apiTotal === 'number') {
        setTotalUsers(apiTotal);
      } else {
        const newTotal = currentSkip + response.data.length + (response.data.length < recordsPerPage ? 0 : recordsPerPage);
        setTotalUsers(prev => Math.max(prev, newTotal, response.data.length));
      }
      setCurrentPage(page);
    } else if (response.success && !Array.isArray(response.data)) {
      setError('Unexpected data format for users list.');
      setUsers([]);
      setTotalUsers(0);
    } else {
      setError(response.message || 'Unable to fetch users.');
      if (users.length === 0) {
        setUsers([]);
        setTotalUsers(0);
      }
    }
  };

  const fetchUsersData = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * recordsPerPage;
      let response: ApiResponse;
      const params: PaginationParams = { records: recordsPerPage, skip };
      if (query.trim()) {
        response = await searchUsers(query.trim(), params);
      } else {
        response = await fetchUsers(params);
      }
      processApiResponse(response, page, skip);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      if (users.length === 0) {
        setUsers([]);
        setTotalUsers(0);
      }
    } finally {
      setLoading(false);
      if (page === 1 && !query.trim()) {
        setInitialLoadDone(true);
      }
    }
  }, [recordsPerPage, users.length]);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
    setInitialLoadDone(false);
  };

  useEffect(() => {
    if (!searchQuery.trim() && !initialLoadDone && !loading) {
      fetchUsersData(1, '');
    }
  }, [searchQuery, initialLoadDone, loading, fetchUsersData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchUsersData(1, searchQuery.trim());
      }
    }, 700);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchUsersData]);

  const refreshUsers = () => {
    if (currentPage === 1 && !searchQuery.trim()) {
      setInitialLoadDone(false);
    }
    fetchUsersData(currentPage, searchQuery);
  };

  const value = {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    searchQuery,
    setSearchQuery,
    fetchUsersPage: (page: number) => fetchUsersData(page, searchQuery),
    refreshUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
