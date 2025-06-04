import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, listRecords, searchRecords } from './core';

const TABLE = 'equipment';

export const fetchEquipment = (params: PaginationParams): Promise<ApiResponse> => listRecords(TABLE, params);
export const createEquipment = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updateEquipment = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deleteEquipment = (id: number): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getEquipmentItem = (id: number): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchEquipment = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(TABLE, queryValue, paginationParams);
