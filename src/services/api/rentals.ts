import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, listRecords, getRecord, fetchFromApi } from './core';
import { fetchEquipmentByIds } from './equipment';

const RENTAL_TRANSACTIONS_TABLE = 'rental_transactions';
const RENTAL_DETAILS_TABLE = 'rental_details';

export const fetchRentals = (params: PaginationParams): Promise<ApiResponse> => listRecords(RENTAL_TRANSACTIONS_TABLE, params);
export const createRental = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(RENTAL_TRANSACTIONS_TABLE, data, false);
export const updateRental = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(RENTAL_TRANSACTIONS_TABLE, id, data, false);
export const deleteRental = (id: number): Promise<ApiResponse> => deleteRecord(RENTAL_TRANSACTIONS_TABLE, id);
export const getRental = (id: number): Promise<ApiResponse> => {
  return listRecords(RENTAL_TRANSACTIONS_TABLE, {
    records: 1,
    skip: 0,
    filters: { rental_id: id },
  });
};

export const fetchRentalDetailsByRentalId = async (
  rentalId: number,
  paginationParams?: PaginationParams
): Promise<ApiResponse> => {
  const apiParams: Record<string, any> = {
    action: 'list',
    table: RENTAL_DETAILS_TABLE,
    records: String(paginationParams?.records ?? 20),
    skip: String(paginationParams?.skip ?? 0),
    include_meta: 1,
  };

  if (paginationParams?.filters || rentalId) {
    const filters = { ...(paginationParams?.filters || {}), rental_id: rentalId };
    let qString = '';
    for (const key in filters) {
      const value = filters[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        qString += `(${key}~equals~${String(value)})`;
      }
    }
    if (qString) apiParams.q = qString;
  }

  const res = await fetchFromApi('GET', apiParams);

  if (res.success && Array.isArray(res.data)) {
    const missingIds = res.data
      .filter((rd: any) => !rd.equipment_name)
      .map((rd: any) => rd.equipment_id);
    if (missingIds.length > 0) {
      const eqRes = await fetchEquipmentByIds(missingIds);
      if (eqRes.success && Array.isArray(eqRes.data)) {
        const idMap: Record<number, string> = {};
        (eqRes.data as any[]).forEach(eq => {
          if (eq && eq.equipment_id !== undefined) {
            idMap[Number(eq.equipment_id)] = eq.equipment_name;
          }
        });
        res.data = res.data.map((rd: any) => ({
          ...rd,
          equipment_name: rd.equipment_name || idMap[rd.equipment_id],
        }));
      }
    }
  }

  return res;
};
export const createRentalDetail = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric(RENTAL_DETAILS_TABLE, data);
export const updateRentalDetail = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric(RENTAL_DETAILS_TABLE, id, data);
export const deleteRentalDetail = (id: number): Promise<ApiResponse> => deleteRecord(RENTAL_DETAILS_TABLE, id);

export const fetchPaymentSchedules = (rentalId: number, paginationParams: PaginationParams): Promise<ApiResponse> => {
  const paramsWithFilter = {
    ...paginationParams,
    filters: { ...(paginationParams.filters || {}), rental_id: rentalId },
  };
  return listRecords('payment_schedules', paramsWithFilter);
};
export const createPaymentSchedule = (data: Record<string, any>): Promise<ApiResponse> => createRecordGeneric('payment_schedules', data);
export const updatePaymentSchedule = (id: number, data: Record<string, any>): Promise<ApiResponse> => updateRecordGeneric('payment_schedules', id, data);
export const deletePaymentSchedule = (id: number): Promise<ApiResponse> => deleteRecord('payment_schedules', id);
export const getPaymentSchedule = (id: number): Promise<ApiResponse> => getRecord('payment_schedules', id);
