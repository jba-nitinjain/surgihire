import { ApiResponse, PaginationParams, RentalItem } from '../types'; // Added RentalItem

// Use environment variables for API URL and Key
const API_URL = import.meta.env.VITE_API_URL || 'https://surgihire.kodequick.com/api/v1.php';
const API_KEY = import.meta.env.VITE_API_KEY || '';

if (!API_KEY) {
  console.warn("API_KEY is not set in environment variables. Please create a .env file with VITE_API_KEY.");
}

const baseHeaders = {
  'X-Auth-Token': API_KEY,
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchFromApi = async (
  method: 'GET' | 'POST',
  params: Record<string, any> = {},
  bodyData?: FormData | string, // Allow string for JSON body
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

    if (method === 'POST') {
      if (bodyData instanceof FormData) {
        // FormData is handled by fetch directly, no need to set Content-Type manually
        fetchOptions.body = bodyData;
      } else if (typeof bodyData === 'string') {
        // For JSON body
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
      } catch (e) { /* Ignore */ }
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

// Generic CRUD (modified createRecord and updateRecord to potentially handle JSON)
const createRecordGeneric = async (table: string, data: Record<string, any>, useJson: boolean = false): Promise<ApiResponse> => {
  if (useJson) {
    // Send as JSON. API must be configured to handle this.
    // The 'table' and 'action' params might need to be part of the URL or JSON body itself,
    // depending on how the PHP backend is structured.
    // This is a simplified example assuming the PHP script routes based on URL params.
    return fetchFromApi('POST', { table, action: 'insert' }, JSON.stringify(data));
  } else {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        // For arrays (like rental_items), FormData might need special handling
        // e.g., item[0][equipment_id], item[0][quantity] or stringifying the array
        if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key])); // Common way to send arrays
        } else {
            formData.append(key, String(data[key]));
        }
      }
    }
    return fetchFromApi('POST', { table, action: 'insert' }, formData);
  }
};

const updateRecordGeneric = async (table: string, id: string | number, data: Record<string, any>, useJson: boolean = false): Promise<ApiResponse> => {
   if (useJson) {
    return fetchFromApi('POST', { table, action: 'update', editid1: String(id) }, JSON.stringify(data));
  } else {
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
  }
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

// Customers
export const fetchCustomers = async (params: PaginationParams): Promise<ApiResponse> => listRecords('customers', params);
export const createCustomer = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric('customers', data);
export const updateCustomer = async (id: string, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric('customers', id, data);
export const deleteCustomer = async (id: string): Promise<ApiResponse> => deleteRecord('customers', id);
export const getCustomer = async (id: string): Promise<ApiResponse> => getRecord('customers', id);
export const searchCustomers = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('customers', queryValue, paginationParams);

// Equipment
export const fetchEquipment = async (params: PaginationParams): Promise<ApiResponse> => listRecords('equipment', params);
export const createEquipment = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric('equipment', data);
export const updateEquipment = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric('equipment', id, data);
export const deleteEquipment = async (id: number): Promise<ApiResponse> => deleteRecord('equipment', id);
export const getEquipmentItem = async (id: number): Promise<ApiResponse> => getRecord('equipment', id);
export const searchEquipment = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('equipment', queryValue, paginationParams);

// Equipment Categories
export const fetchEquipmentCategories = async (params: PaginationParams): Promise<ApiResponse> => listRecords('equipment_categories', params);
export const createEquipmentCategory = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric('equipment_categories', data);
export const updateEquipmentCategory = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric('equipment_categories', id, data);
export const deleteEquipmentCategory = async (id: number): Promise<ApiResponse> => deleteRecord('equipment_categories', id);
export const getEquipmentCategory = async (id: number): Promise<ApiResponse> => getRecord('equipment_categories', id);
export const searchEquipmentCategories = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('equipment_categories', queryValue, paginationParams);

// Payment Plans
export const fetchPaymentPlans = async (params: PaginationParams): Promise<ApiResponse> => listRecords('payment_plans', params);
export const createPaymentPlan = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric('payment_plans', data);
export const updatePaymentPlan = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric('payment_plans', id, data);
export const deletePaymentPlan = async (id: number): Promise<ApiResponse> => deleteRecord('payment_plans', id);
export const getPaymentPlan = async (id: number): Promise<ApiResponse> => getRecord('payment_plans', id);
export const searchPaymentPlans = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords('payment_plans', queryValue, paginationParams);

// Maintenance Records
const MAINTENANCE_TABLE = 'maintenance_records';
export const fetchMaintenanceRecords = async (params: PaginationParams): Promise<ApiResponse> => listRecords(MAINTENANCE_TABLE, params);
export const createMaintenanceRecord = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(MAINTENANCE_TABLE, data);
export const updateMaintenanceRecord = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(MAINTENANCE_TABLE, id, data);
export const deleteMaintenanceRecord = async (id: number): Promise<ApiResponse> => deleteRecord(MAINTENANCE_TABLE, id);
export const getMaintenanceRecord = async (id: number): Promise<ApiResponse> => getRecord(MAINTENANCE_TABLE, id);
export const searchMaintenanceRecords = async (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(MAINTENANCE_TABLE, queryValue, paginationParams);

// --- Rental Transactions ---
const RENTAL_TRANSACTIONS_TABLE = 'rental_transactions';
const RENTAL_DETAILS_TABLE = 'rental_details'; // Assuming this is the name of your rental items table

export const fetchRentals = async (params: PaginationParams): Promise<ApiResponse> => listRecords(RENTAL_TRANSACTIONS_TABLE, params);

// Assuming backend handles creation of rental_details if `rental_items` is passed
// If your backend expects JSON for complex objects like rental_items:
export const createRental = async (data: Record<string, any>): Promise<ApiResponse> => {
    // Send as FormData so the PHP backend can parse nested rental_items JSON
    // strings correctly. The generic helper will stringify arrays for us.
    return createRecordGeneric(RENTAL_TRANSACTIONS_TABLE, data, false);
};

export const updateRental = async (id: number, data: Record<string, any>): Promise<ApiResponse> => {
    // Use FormData for updates as well so rental_details are processed properly.
    return updateRecordGeneric(RENTAL_TRANSACTIONS_TABLE, id, data, false);
};
export const deleteRental = async (id: number): Promise<ApiResponse> => deleteRecord(RENTAL_TRANSACTIONS_TABLE, id);
export const getRental = async (id: number): Promise<ApiResponse> => getRecord(RENTAL_TRANSACTIONS_TABLE, id);

// --- Rental Details (Items) ---
// Fetches all items for a specific rental transaction
export const fetchRentalDetailsByRentalId = async (rentalId: number, paginationParams?: PaginationParams): Promise<ApiResponse> => {
  const params = {
    ...paginationParams,
    filters: { ...(paginationParams?.filters || {}), rental_id: rentalId }
  };
  return listRecords(RENTAL_DETAILS_TABLE, params as PaginationParams);
};

// If you need to create/update/delete individual rental items separately:
export const createRentalDetail = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(RENTAL_DETAILS_TABLE, data);
export const updateRentalDetail = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(RENTAL_DETAILS_TABLE, id, data);
export const deleteRentalDetail = async (id: number): Promise<ApiResponse> => deleteRecord(RENTAL_DETAILS_TABLE, id);


// Payment Schedules (Existing)
// ... (keep existing payment schedule functions)
export const fetchPaymentSchedules = async (rentalId: number, paginationParams: PaginationParams): Promise<ApiResponse> => {
  const paramsWithFilter = {
    ...paginationParams,
    filters: { ...(paginationParams.filters || {}), rental_id: rentalId }
  };
  return listRecords('payment_schedules', paramsWithFilter);
};
export const createPaymentSchedule = async (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric('payment_schedules', data);
export const updatePaymentSchedule = async (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric('payment_schedules', id, data);
export const deletePaymentSchedule = async (id: number): Promise<ApiResponse> => deleteRecord('payment_schedules', id);
export const getPaymentSchedule = async (id: number): Promise<ApiResponse> => getRecord('payment_schedules', id);
