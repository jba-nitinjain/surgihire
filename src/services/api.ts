import { ApiResponse, PaginationParams } from '../types';

const API_URL = 'https://surgihire.kodequick.com/api/v1.php';
const API_KEY = '00c02a59-ba44-45ec-ac07-1593d4ffaeb8';

const baseHeaders = {
  'X-Auth-Token': API_KEY,
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchFromApi = async (
  method: 'GET' | 'POST',
  params: Record<string, any> = {},
  bodyData?: FormData,
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
      method: method,
      headers: { ...baseHeaders },
    };

    if (method === 'POST' && bodyData) {
      fetchOptions.body = bodyData;
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
      } catch (e) { /* Ignore */ }
      const detail = errorData?.message || response.statusText;
      throw new Error(`Server error: ${response.status} - ${detail}. Please try again later or contact support.`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching data');
  }
};

export const createRecord = async (table: string, data: Record<string, any>): Promise<ApiResponse> => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, String(data[key]));
    }
  }
  return fetchFromApi('POST', { table, action: 'insert' }, formData);
};

export const updateRecord = async (table: string, id: string | number, data: Record<string, any>): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('editid1', String(id));
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, String(data[key]));
    }
  }
  return fetchFromApi('POST', { table, action: 'update' }, formData);
};

export const deleteRecord = async (table: string, id: string | number): Promise<ApiResponse> => {
  return fetchFromApi('POST', { table, action: 'delete', editid1: String(id) });
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

  if (paginationParams.filters) {
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

export const searchRecords = async (table: string, queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => {
    const params: Record<string, any> = {
        action: 'list',
        table,
        qs: queryValue,
    };
    if (paginationParams) {
        params.records = String(paginationParams.records);
        params.skip = String(paginationParams.skip);
    }
    return fetchFromApi('GET', params);
};


// Customers
export const fetchCustomers = async (params: PaginationParams): Promise<ApiResponse> => listRecords('customers', params);
export const createCustomer = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('customers', data); // Assuming customer_id is handled by backend or not sent
export const updateCustomer = async (id: string, data: Record<string, any>): Promise<ApiResponse> => updateRecord('customers', id, data);
export const deleteCustomer = async (id: string): Promise<ApiResponse> => deleteRecord('customers', id);
export const getCustomer = async (id: string): Promise<ApiResponse> => getRecord('customers', id);
export const searchCustomers = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('customers', queryValue, paginationParams);


// Equipment
export const fetchEquipment = async (params: PaginationParams): Promise<ApiResponse> => listRecords('equipment', params);
export const createEquipment = async (data: Record<string, any>): Promise<ApiResponse> => createRecord('equipment', data); // Assuming equipment_id is handled by backend
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

// --- New Maintenance Record API Functions ---
const MAINTENANCE_TABLE = 'maintenance_records';

export const fetchMaintenanceRecords = async (params: PaginationParams): Promise<ApiResponse> => {
  // If you want to fetch all records without equipment_id filter, use listRecords directly
  // If you always filter by equipment_id, ensure it's in params.filters
  return listRecords(MAINTENANCE_TABLE, params);
};

export const createMaintenanceRecord = async (data: Record<string, any>): Promise<ApiResponse> => {
  // maintenance_id is auto-increment
  return createRecord(MAINTENANCE_TABLE, data);
};

export const updateMaintenanceRecord = async (id: number, data: Record<string, any>): Promise<ApiResponse> => {
  return updateRecord(MAINTENANCE_TABLE, id, data);
};

export const deleteMaintenanceRecord = async (id: number): Promise<ApiResponse> => {
  return deleteRecord(MAINTENANCE_TABLE, id);
};

export const getMaintenanceRecord = async (id: number): Promise<ApiResponse> => {
  return getRecord(MAINTENANCE_TABLE, id);
};

// Search for maintenance records might be by notes, technician, etc.
// Or if you want to search within a specific equipment's records, you'd combine 'qs' with a filter.
export const searchMaintenanceRecords = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => {
  // If searching globally:
  return searchRecords(MAINTENANCE_TABLE, queryValue, paginationParams);
  // If searching within an equipment_id (example, not fully implemented in context yet):
  // const paramsWithFilter = {
  //   ...paginationParams,
  //   filters: { ...paginationParams?.filters, equipment_id: yourEquipmentIdFilter }
  // };
  // return searchRecords(MAINTENANCE_TABLE, queryValue, paramsWithFilter);
};
// --- End New Maintenance Record API Functions ---


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
