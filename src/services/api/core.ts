import { ApiResponse, PaginationParams } from '../../types';

// Use environment variables for API URL and Key
const API_URL = import.meta.env.VITE_API_URL || 'https://surgihire.kodequick.com/api/v1.php';
const API_KEY = import.meta.env.VITE_API_KEY || '';

if (!API_KEY) {
  console.warn('API_KEY is not set in environment variables. Please create a .env file with VITE_API_KEY.');
}

const baseHeaders = {
  'X-Auth-Token': API_KEY,
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchFromApi = async (
  method: 'GET' | 'POST',
  params: Record<string, any> = {},
  bodyData?: FormData | string,
  retryCount = 0
): Promise<ApiResponse> => {
  try {
    const cleanedParams: Record<string, string> = {};
    for (const key in params) {
      if (params[key] !== null && params[key] !== undefined) {
        cleanedParams[key] = String(params[key]);
      }
    }
    const queryParams = new URLSearchParams(cleanedParams).toString();
    const url = `${API_URL}?${queryParams}`;

    const fetchOptions: RequestInit = {
      method,
      headers: { ...baseHeaders },
    };

    if (method === 'POST') {
      if (bodyData instanceof FormData) {
        fetchOptions.body = bodyData;
      } else if (typeof bodyData === 'string') {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Content-Type': 'application/json',
        };
        fetchOptions.body = bodyData;
      }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      if (response.status === 500 && retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * (retryCount + 1));
        return fetchFromApi(method, params, bodyData, retryCount + 1);
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // Some error responses may not contain JSON
      }
      const detail = errorData?.message || response.statusText || `HTTP error ${response.status}`;
      throw new Error(`Server error: ${response.status} - ${detail}. Please try again later or contact support.`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching data');
  }
};

export const createRecordGeneric = async (
  table: string,
  data: Record<string, any>,
  useJson: boolean = false
): Promise<ApiResponse> => {
  if (useJson) {
    return fetchFromApi('POST', { table, action: 'insert' }, JSON.stringify(data));
  }
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, String(data[key]));
      }
    }
  }
  return fetchFromApi('POST', { table, action: 'insert' }, formData);
};

export const updateRecordGeneric = async (
  table: string,
  id: string | number,
  data: Record<string, any>,
  useJson: boolean = false
): Promise<ApiResponse> => {
  if (useJson) {
    return fetchFromApi('POST', { table, action: 'update', editid1: String(id) }, JSON.stringify(data));
  }
  const formData = new FormData();
  formData.append('editid1', String(id));
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, String(data[key]));
      }
    }
  }
  return fetchFromApi('POST', { table, action: 'update' }, formData);
};

export const deleteRecord = async (table: string, id: string | number): Promise<ApiResponse> => {
  const params = { table, action: 'delete', editid1: String(id) };
  return fetchFromApi('POST', params);
};

export const getRecord = async (table: string, id: string | number): Promise<ApiResponse> => {
  return fetchFromApi('GET', { table, action: 'view', id: String(id) });
};

export const listRecords = async (table: string, paginationParams: PaginationParams): Promise<ApiResponse> => {
  const apiParams: Record<string, any> = {
    action: 'list',
    table,
    records: String(paginationParams.records),
    skip: String(paginationParams.skip),
  };

  if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0) {
    let qString = '';
    for (const key in paginationParams.filters) {
      const filterValue = paginationParams.filters[key];
      if (filterValue !== null && filterValue !== undefined && String(filterValue).trim() !== '') {
        qString += `(${key}~equals~${String(filterValue)})`;
      }
    }
    if (qString) {
      apiParams.q = qString;
    }
  }
  return fetchFromApi('GET', apiParams);
};

export const searchRecords = async (
  table: string,
  queryValue: string,
  paginationParams?: PaginationParams
): Promise<ApiResponse> => {
  const params: Record<string, any> = {
    action: 'list',
    table,
    qs: queryValue,
  };

  if (paginationParams) {
    params.records = String(paginationParams.records);
    params.skip = String(paginationParams.skip);
    if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0) {
      let qString = '';
      for (const key in paginationParams.filters) {
        const filterValue = paginationParams.filters[key];
        if (filterValue !== null && filterValue !== undefined && String(filterValue).trim() !== '') {
          qString += `(${key}~equals~${String(filterValue)})`;
        }
      }
      if (qString) {
        params.q = qString;
      }
    }
  }
  return fetchFromApi('GET', params);
};

