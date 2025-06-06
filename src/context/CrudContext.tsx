import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/api/customers';
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../services/api/equipment';
import {
  createEquipmentCategory,
  updateEquipmentCategory,
  deleteEquipmentCategory,
} from '../services/api/equipmentCategories';
import {
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
} from '../services/api/paymentPlans';
import {
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../services/api/maintenance';
import {
  createPayment,
  updatePayment,
  deletePayment,
} from '../services/api/payments';
import {
  createRental,
  updateRental,
  deleteRental,
  createPaymentSchedule,
  updatePaymentSchedule,
  deletePaymentSchedule,
} from '../services/api/rentals';
import {
  createUser,
  updateUser,
  deleteUser,
} from '../services/api/users';

interface CrudContextType {
  createItem: (table: string, data: Record<string, any>) => Promise<any>;
  updateItem: (table: string, id: string | number, data: Record<string, any>) => Promise<any>;
  deleteItem: (table: string, id: string | number) => Promise<any>;
  loading: boolean;
  error: string | null;
}

const CrudContext = createContext<CrudContextType | undefined>(undefined);

export const useCrud = () => {
  const context = useContext(CrudContext);
  if (!context) {
    throw new Error('useCrud must be used within a CrudProvider');
  }
  return context;
};

interface CrudProviderProps {
  children: ReactNode;
}

export const CrudProvider: React.FC<CrudProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (table: string, data: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (table) {
        case 'customers':
          response = await createCustomer(data);
          break;
        case 'equipment':
          response = await createEquipment(data);
          break;
        case 'rental_transactions':
          response = await createRental(data);
          break;
        case 'payment_schedules':
          response = await createPaymentSchedule(data);
          break;
        case 'payments':
          response = await createPayment(data);
          break;
        case 'equipment_categories':
          response = await createEquipmentCategory(data);
          break;
        case 'payment_plans':
          response = await createPaymentPlan(data);
          break;
        case 'users1':
          response = await createUser(data);
          break;
        // --- ADDED CASE FOR MAINTENANCE RECORDS ---
        case 'maintenance_records':
          response = await createMaintenanceRecord(data);
          break;
        // --- END ADDED CASE ---
        default:
          console.error(`Unsupported table for create: ${table}`);
          throw new Error(`Unsupported table for create: ${table}`);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create record';
      setError(errorMessage);
      console.error(`CrudContext: Failed to create record in ${table}`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (table: string, id: string | number, data: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (table) {
        case 'customers':
          response = await updateCustomer(String(id), data);
          break;
        case 'equipment':
          response = await updateEquipment(Number(id), data);
          break;
        case 'rental_transactions':
          response = await updateRental(Number(id), data);
          break;
        case 'payment_schedules':
          response = await updatePaymentSchedule(Number(id), data);
          break;
        case 'payments':
          response = await updatePayment(Number(id), data);
          break;
        case 'equipment_categories':
          response = await updateEquipmentCategory(Number(id), data);
          break;
        case 'payment_plans':
          response = await updatePaymentPlan(Number(id), data);
          break;
        case 'users1':
          response = await updateUser(Number(id), data);
          break;
        // --- ADDED CASE FOR MAINTENANCE RECORDS ---
        case 'maintenance_records':
          response = await updateMaintenanceRecord(Number(id), data);
          break;
        // --- END ADDED CASE ---
        default:
          console.error(`Unsupported table for update: ${table}`);
          throw new Error(`Unsupported table for update: ${table}`);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      console.error(`CrudContext: Failed to update record in ${table} with id ${id}`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (table: string, id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (table) {
        case 'customers':
          response = await deleteCustomer(String(id));
          break;
        case 'equipment':
          response = await deleteEquipment(Number(id));
          break;
        case 'rental_transactions':
          response = await deleteRental(Number(id));
          break;
        case 'payment_schedules':
          response = await deletePaymentSchedule(Number(id));
          break;
        case 'payments':
          response = await deletePayment(Number(id));
          break;
        case 'equipment_categories':
          response = await deleteEquipmentCategory(Number(id));
          break;
        case 'payment_plans':
          response = await deletePaymentPlan(Number(id));
          break;
        case 'users1':
          response = await deleteUser(Number(id));
          break;
        // --- ADDED CASE FOR MAINTENANCE RECORDS ---
        case 'maintenance_records':
          response = await deleteMaintenanceRecord(Number(id));
          break;
        // --- END ADDED CASE ---
        default:
          console.error(`Unsupported table for delete: ${table}`);
          throw new Error(`Unsupported table for delete: ${table}`);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
      setError(errorMessage);
      console.error(`CrudContext: Failed to delete record in ${table} with id ${id}`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    createItem,
    updateItem,
    deleteItem,
    loading,
    error
  };

  return (
    <CrudContext.Provider value={value}>
      {children}
    </CrudContext.Provider>
  );
};
