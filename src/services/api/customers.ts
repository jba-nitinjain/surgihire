import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, listRecords, searchRecords } from './core';

const TABLE = 'customers';

export const fetchCustomers = (params: PaginationParams): Promise<ApiResponse> => listRecords(TABLE, params);
export const createCustomer = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updateCustomer = (id: string, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deleteCustomer = (id: string): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getCustomer = (id: string): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchCustomers = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(TABLE, queryValue, paginationParams);
