import { ApiResponse, PaginationParams } from '../../types';
import { createRecordGeneric, updateRecordGeneric, deleteRecord, listRecords, searchRecords, getRecord } from './core';
import { getRental } from './rentals';

const TABLE = 'payments';
const RENTALS_TABLE = 'rental_transactions';

const fetchRental = (id: number) => getRental(id);
const updateRentalRecord = (id: number, data: Record<string, any>) => updateRecordGeneric(RENTALS_TABLE, id, data);

export const fetchPayments = (params: PaginationParams): Promise<ApiResponse> => listRecords(TABLE, params);

const adjustRentalTotals = async (
  rentalId: number,
  oldNature: string | null,
  oldAmount: number,
  newNature: string | null,
  newAmount: number
) => {
  try {
    const rentalRes = await fetchRental(rentalId);
    if (!rentalRes.success || !rentalRes.data) return;
    const rental = Array.isArray(rentalRes.data) ? rentalRes.data[0] : rentalRes.data;
    const updates: Record<string, any> = {};

    const normOld = oldNature ? oldNature.toLowerCase() : '';
    const normNew = newNature ? newNature.toLowerCase() : '';

    let deposit = rental.deposit ?? 0;
    let totalReceipt = rental.total_receipt ?? 0;

    if (normOld.includes('deposit')) {
      deposit -= oldAmount;
    } else if (normOld) {
      totalReceipt -= oldAmount;
    }

    if (normNew.includes('deposit')) {
      deposit += newAmount;
    } else {
      totalReceipt += newAmount;
    }

    updates.deposit = deposit;
    updates.total_receipt = totalReceipt;
    if (typeof rental.total_amount === 'number') {
      updates.balance = rental.total_amount - totalReceipt;
    }

    await updateRentalRecord(rentalId, updates);
  } catch (err) {
    console.error('Failed to adjust rental totals', err);
  }
};

export const createPayment = async (data: Record<string, any>): Promise<ApiResponse> => {
  const res = await createRecordGeneric(TABLE, data);
  if (res.success && data.rental_id) {
    await adjustRentalTotals(Number(data.rental_id), null, 0, data.nature || '', Number(data.payment_amount || 0));
  }
  return res;
};

export const updatePayment = async (id: number, data: Record<string, any>): Promise<ApiResponse> => {
  const existingRes = await getPayment(id);
  const existing = existingRes.success ? (Array.isArray(existingRes.data) ? existingRes.data[0] : existingRes.data) : null;
  const res = await updateRecordGeneric(TABLE, id, data);
  if (res.success && existing) {
    await adjustRentalTotals(
      existing.rental_id,
      existing.nature,
      Number(existing.payment_amount || 0),
      data.nature ?? existing.nature,
      data.payment_amount !== undefined ? Number(data.payment_amount) : existing.payment_amount
    );
  }
  return res;
};

export const deletePayment = async (id: number): Promise<ApiResponse> => {
  const existingRes = await getPayment(id);
  const existing = existingRes.success ? (Array.isArray(existingRes.data) ? existingRes.data[0] : existingRes.data) : null;
  const res = await deleteRecord(TABLE, id);
  if (res.success && existing) {
    await adjustRentalTotals(
      existing.rental_id,
      existing.nature,
      Number(existing.payment_amount || 0),
      null,
      0
    );
  }
  return res;
};

export const getPayment = (id: number): Promise<ApiResponse> => getRecord(TABLE, id);
export const searchPayments = (queryValue: string, paginationParams?: PaginationParams): Promise<ApiResponse> => searchRecords(TABLE, queryValue, paginationParams);
