import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, listRecords, searchRecords } from './core';

const TABLE = 'maintenance_records';

export const fetchMaintenanceRecords = (params: PaginationParams): Promise<ApiResponse> => listRecords(TABLE, params);
export const createMaintenanceRecord = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updateMaintenanceRecord = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deleteMaintenanceRecord = (id: number): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getMaintenanceRecord = (id: number): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchMaintenanceRecords = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(TABLE, queryValue, paginationParams);
