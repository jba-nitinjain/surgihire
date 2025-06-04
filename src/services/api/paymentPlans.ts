import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, listRecords, searchRecords } from './core';

const TABLE = 'payment_plans';

export const fetchPaymentPlans = (params: PaginationParams): Promise<ApiResponse> => listRecords(TABLE, params);
export const createPaymentPlan = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updatePaymentPlan = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deletePaymentPlan = (id: number): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getPaymentPlan = (id: number): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchPaymentPlans = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(TABLE, queryValue, paginationParams);
