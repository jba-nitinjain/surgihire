import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, fetchFromApi } from './core';

const TABLE = 'customers';

const buildFilterQuery = (filters?: Record<string, string | number | boolean | null>): string | undefined => {
  if (!filters) return undefined;
  let qString = '';
  for (const key in filters) {
    const value = filters[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      qString += `(${key}~equals~${String(value)})`;
    }
  }
  return qString || undefined;
};

export const fetchCustomers = (params: PaginationParams): Promise<ApiResponse> => {
  const apiParams: Record<string, any> = {
    action: 'list',
    table: TABLE,
    records: params.records,
    skip: params.skip,
    include_meta: 1,
  };
  const q = buildFilterQuery(params.filters);
  if (q) apiParams.q = q;
  return fetchFromApi('GET', apiParams);
};
export const createCustomer = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updateCustomer = (id: string, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deleteCustomer = (id: string): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getCustomer = (id: string): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchCustomers = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => {
  const params: Record<string, any> = {
    action: 'list',
    table: TABLE,
    qs: queryValue,
    include_meta: 1,
  };
  if (paginationParams) {
    params.records = paginationParams.records;
    params.skip = paginationParams.skip;
    const q = buildFilterQuery(paginationParams.filters);
    if (q) params.q = q;
  }
  return fetchFromApi('GET', params);
};
