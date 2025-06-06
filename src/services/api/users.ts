import { ApiResponse, PaginationParams } from '../../types';
import { fetchFromApi } from './core';

const TABLE = 'users1';

export const fetchUsers = (params: PaginationParams): Promise<ApiResponse> => {
  const apiParams: Record<string, any> = {
    action: 'list',
    table: TABLE,
    records: params.records,
    skip: params.skip,
    include_meta: 1,
  };
  if (params.q) apiParams.q = params.q;
  return fetchFromApi('GET', apiParams);
};

export const searchUsers = (
  queryValue: string,
  paginationParams?: PaginationParams
): Promise<ApiResponse> => {
  const params: Record<string, any> = {
    action: 'list',
    table: TABLE,
    qs: queryValue,
    include_meta: 1,
  };
  if (paginationParams) {
    params.records = paginationParams.records;
    params.skip = paginationParams.skip;
    if (paginationParams.q) params.q = paginationParams.q;
  }
  return fetchFromApi('GET', params);
};
