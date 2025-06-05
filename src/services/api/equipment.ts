import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, getRecord, fetchFromApi } from './core';

const TABLE = 'equipment';

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

export const fetchEquipment = (params: PaginationParams): Promise<ApiResponse> => {
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
export const createEquipment = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(TABLE, data);
export const updateEquipment = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(TABLE, id, data);
export const deleteEquipment = (id: number): Promise<ApiResponse> => deleteRecord(TABLE, id);
export const getEquipmentItem = (id: number): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchEquipment = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => {
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

export const fetchEquipmentByIds = (ids: number[]): Promise<ApiResponse> => {
  if (ids.length === 0) {
    return Promise.resolve({ success: true, data: [] } as ApiResponse);
  }
  const qString = ids.map(id => `(equipment_id~equals~${id})`).join('');
  const params: Record<string, any> = {
    action: 'list',
    table: TABLE,
    q: qString,
    records: ids.length,
    skip: 0,
  };
  return fetchFromApi('GET', params);
};
