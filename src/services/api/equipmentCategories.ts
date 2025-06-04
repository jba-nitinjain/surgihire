import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, listRecords, searchRecords } from './core';

const TABLE = 'equipment_categories';

export const fetchEquipmentCategories = (params: PaginationParams): Promise<ApiResponse> => listRecords(TABLE, params);
export const createEquipmentCategory = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updateEquipmentCategory = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deleteEquipmentCategory = (id: number): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getEquipmentCategory = (id: number): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchEquipmentCategories = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(TABLE, queryValue, paginationParams);
