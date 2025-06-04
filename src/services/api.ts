import { ApiResponse, PaginationParams } from '../types';

// Use environment variables for API URL and Key
const API_URL = import.meta.env.VITE_API_URL || 'https://surgihire.kodequick.com/api/v1.php';
const API_KEY = import.meta.env.VITE_API_KEY || ''; // Fallback, but should be set in .env

if (!API_KEY) {
  console.warn("API_KEY is not set in environment variables. Please create a .env file with VITE_API_KEY.");
}


const baseHeaders = {
  'X-Auth-Token': API_KEY,
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic function to make API calls.
 * @param method - HTTP method ('GET' or 'POST').
 * @param params - URL query parameters.
 * @param bodyData - FormData for POST requests.
 * @param retryCount - Current retry attempt.
 * @returns Promise<ApiResponse>
 */
const fetchFromApi = async (
  method: 'GET' | 'POST',
  params: Record<string, any> = {},
  bodyData?: FormData,
  retryCount = 0
): Promise<ApiResponse> => {
  try {
    const cleanedParams: Record<string, string> = {};
    // Ensure all param values are strings and not null/undefined before creating URLSearchParams
    for (const key in params) {
      if (params[key] !== null && params[key] !== undefined) {
        cleanedParams[key] = String(params[key]);
      }
    }
    const queryParams = new URLSearchParams(cleanedParams).toString();
    const url = `${API_URL}?${queryParams}`;

    const fetchOptions: RequestInit = {
      method: method,
      headers: { ...baseHeaders },
    };

    if (method === 'POST' && bodyData) {
      fetchOptions.body = bodyData;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      // Retry on 500 server errors
      if (response.status === 500 && retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * (retryCount + 1));
        return fetchFromApi(method, params, bodyData, retryCount + 1);
      }
      // Try to parse error message from response body
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use status text
      }
      const detail = errorData?.message || response.statusText || `HTTP error ${response.status}`;
      throw new Error(`Server error: ${response.status} - ${detail}. Please try again later or contact support.`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof Error) {
      // Re-throw the error to be caught by the calling function
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    // For unexpected errors that are not instances of Error
    throw new Error('An unexpected error occurred while fetching data');
  }
};

/**
 * Creates a new record.
 * @param table - The table name.
 * @param data - The data for the new record.
 * @returns Promise<ApiResponse>
 */
export const createRecord = async (table: string, data: Record<string, any>): Promise<ApiResponse> => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) { // Ensure nulls/undefined are not appended or handle as needed
      formData.append(key, String(data[key]));
    }
  }
  return fetchFromApi('POST', { table, action: 'insert' }, formData);
};

/**
 * Updates an existing record.
 * @param table - The table name.
 * @param id - The ID of the record to update.
 * @param data - The new data for the record.
 * @returns Promise<ApiResponse>
 */
export const updateRecord = async (table: string, id: string | number, data: Record<string, any>): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('editid1', String(id)); // API expects 'editid1' for the ID
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, String(data[key]));
    }
  }
  return fetchFromApi('POST', { table, action: 'update' }, formData);
};

/**
 * Deletes a record.
 * @param table - The table name.
 * @param id - The ID of the record to delete.
 * @returns Promise<ApiResponse>
 */
export const deleteRecord = async (table: string, id: string | number): Promise<ApiResponse> => {
  // For delete, typically parameters are sent in URL or as FormData for POST
  // Assuming API uses POST for delete with parameters in FormData or URL
  const params = { table, action: 'delete', editid1: String(id) };
  return fetchFromApi('POST', params); // Changed to POST as per typical RESTful delete with params
};

/**
 * Retrieves a single record by ID.
 * @param table - The table name.
 * @param id - The ID of the record.
 * @returns Promise<ApiResponse>
 */
export const getRecord = async (table: string, id: string | number): Promise<ApiResponse> => {
  return fetchFromApi('GET', { table, action: 'view', id: String(id) });
};

/**
 * Lists records with pagination and filtering.
 * @param table - The table name.
 * @param paginationParams - Parameters for pagination and filtering.
 * @returns Promise<ApiResponse>
 */
export const listRecords = async (table: string, paginationParams: PaginationParams): Promise<ApiResponse> => {
  const apiParams: Record<string, any> = {
    action: 'list',
    table,
    records: String(paginationParams.records),
    skip: String(paginationParams.skip),
  };

  // Construct the 'q' parameter for filters
  if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0) {
    let qString = '';
    for (const key in paginationParams.filters) {
      const filterValue = paginationParams.filters[key];
      // Ensure filterValue is not null, undefined, or an empty string before adding to query
      if (filterValue !== null && filterValue !== undefined && String(filterValue).trim() !== '') {
        // Append multiple filters correctly, assuming API handles multiple `(field~operator~value)`
        // The API documentation implies a single string for `q`, so concatenate them.
        // Example: (status~equals~Available)(category_id~equals~1)
        qString += `(${key}~equals~${String(filterValue)})`;
      }
    }
    if (qString) {
      apiParams.q = qString;
    }
  }
  return fetchFromApi('GET', apiParams);
};

/**
 * Searches records with a query string, pagination, and optional filters.
 * @param table - The table name.
 * @param queryValue - The search term.
 * @param paginationParams - Parameters for pagination and filtering.
 * @returns Promise<ApiResponse>
 */
export const searchRecords = async (
  table: string,
  queryValue: string,
  paginationParams?: PaginationParams
): Promise<ApiResponse> => {
  const params: Record<string, any> = {
    action: 'list', // Assuming search uses the 'list' action with 'qs'
    table,
    qs: queryValue, // Search query string
  };

  if (paginationParams) {
    params.records = String(paginationParams.records);
    params.skip = String(paginationParams.skip);

    // Add filters to the search query if the API supports it
    if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0) {
      let qString = '';
      for (const key in paginationParams.filters) {
        const filterValue = paginationParams.filters[key];
        if (filterValue !== null && filterValue !== undefined && String(filterValue).trim() !== '') {
          qString += `(${key}~equals~${String(filterValue)})`;
        }
      }
      if (qString) {
        // If API supports both 'q' and 'qs', send 'q'.
        // If 'qs' is meant to be a global search and 'q' for specific field filters,
        // this combination needs to be supported by the backend.
        // For now, let's assume 'q' can be combined or the backend handles it.
        // If the backend expects 'qs' to include filter syntax, this needs adjustment.
        params.q = qString;
      }
    }
  }
  return fetchFromApi('GET', params);
};


// --- Entity Specific Functions ---

// Customers
export const fetchCustomers = async (params: PaginationParams): Promise<ApiResponse> => listRecords('customers', params);
export const createCustomer = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('customers', data);
export const updateCustomer = async (id: string, data: Record<string, any>): Promise<ApiResponse> => updateRecord('customers', id, data);
export const deleteCustomer = async (id: string): Promise<ApiResponse> => deleteRecord('customers', id);
export const getCustomer = async (id: string): Promise<ApiResponse> => getRecord('customers', id);
export const searchCustomers = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('customers', queryValue, paginationParams);

// Equipment
export const fetchEquipment = async (params: PaginationParams): Promise<ApiResponse> => listRecords('equipment', params);
export const createEquipment = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('equipment', data);
export const updateEquipment = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecord('equipment', id, data);
export const deleteEquipment = async (id: number): Promise<ApiResponse> => deleteRecord('equipment', id);
export const getEquipmentItem = async (id: number): Promise<ApiResponse> => getRecord('equipment', id);
export const searchEquipment = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('equipment', queryValue, paginationParams);

// Equipment Categories
export const fetchEquipmentCategories = async (params: PaginationParams): Promise<ApiResponse> => listRecords('equipment_categories', params);
export const createEquipmentCategory = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('equipment_categories', data);
export const updateEquipmentCategory = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecord('equipment_categories', id, data);
export const deleteEquipmentCategory = async (id: number): Promise<ApiResponse> => deleteRecord('equipment_categories', id);
export const getEquipmentCategory = async (id: number): Promise<ApiResponse> => getRecord('equipment_categories', id);
export const searchEquipmentCategories = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('equipment_categories', queryValue, paginationParams);

// Payment Plans
export const fetchPaymentPlans = async (params: PaginationParams): Promise<ApiResponse> => listRecords('payment_plans', params);
export const createPaymentPlan = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('payment_plans', data);
export const updatePaymentPlan = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecord('payment_plans', id, data);
export const deletePaymentPlan = async (id: number): Promise<ApiResponse> => deleteRecord('payment_plans', id);
export const getPaymentPlan = async (id: number): Promise<ApiResponse> => getRecord('payment_plans', id);
export const searchPaymentPlans = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('payment_plans', queryValue, paginationParams);

// Maintenance Records
const MAINTENANCE_TABLE = 'maintenance_records';
export const fetchMaintenanceRecords = async (params: PaginationParams): Promise<ApiResponse> => listRecords(MAINTENANCE_TABLE, params);
export const createMaintenanceRecord = async (data: Record<string, any>): Promise<ApiResponse> => createRecord(MAINTENANCE_TABLE, data);
export const updateMaintenanceRecord = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecord(MAINTENANCE_TABLE, id, data);
export const deleteMaintenanceRecord = async (id: number): Promise<ApiResponse> => deleteRecord(MAINTENANCE_TABLE, id);
export const getMaintenanceRecord = async (id: number): Promise<ApiResponse> => getRecord(MAINTENANCE_TABLE, id);
export const searchMaintenanceRecords = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(MAINTENANCE_TABLE, queryValue, paginationParams);

// Rental Transactions
export const fetchRentals = async (params: PaginationParams): Promise<ApiResponse> => listRecords('rental_transactions', params);
export const createRental = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('rental_transactions', data);
export const updateRental = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecord('rental_transactions', id, data);
export const deleteRental = async (id: number): Promise<ApiResponse> => deleteRecord('rental_transactions', id);
export const getRental = async (id: number): Promise<ApiResponse> => getRecord('rental_transactions', id);

// Payment Schedules
export const fetchPaymentSchedules = async (rentalId: number, paginationParams: PaginationParams): Promise<ApiResponse> => {
  const paramsWithFilter = {
    ...paginationParams,
    filters: { ...(paginationParams.filters || {}), rental_id: rentalId }
  };
  return listRecords('payment_schedules', paramsWithFilter);
};
export const createPaymentSchedule = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('payment_schedules', data);
export const updatePaymentSchedule = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecord('payment_schedules', id, data);
export const deletePaymentSchedule = async (id: number): Promise<ApiResponse> => deleteRecord('payment_schedules', id);
export const getPaymentSchedule = async (id: number): Promise<ApiResponse> => getRecord('payment_schedules', id);
