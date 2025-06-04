import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as api from '../services/api'; // Imports all exports from api.ts

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
          response = await api.createCustomer(data);
          break;
        case 'equipment':
          response = await api.createEquipment(data);
          break;
        case 'rental_transactions': // Assuming you might add this later
          response = await api.createRental(data);
          break;
        case 'payment_schedules': // Assuming you might add this later
          response = await api.createPaymentSchedule(data);
          break;
        case 'equipment_categories': // Added case for equipment_categories
          response = await api.createEquipmentCategory(data);
          break;
        case 'payment_plans': // Added case for payment_plans
          response = await api.createPaymentPlan(data);
          break;
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
          response = await api.updateCustomer(String(id), data); 
          break;
        case 'equipment':
          response = await api.updateEquipment(Number(id), data);
          break;
        case 'rental_transactions':
          response = await api.updateRental(Number(id), data);
          break;
        case 'payment_schedules':
          response = await api.updatePaymentSchedule(Number(id), data);
          break;
        case 'equipment_categories': // Added case for equipment_categories
          response = await api.updateEquipmentCategory(Number(id), data);
          break;
        case 'payment_plans': // Added case for payment_plans
          response = await api.updatePaymentPlan(Number(id), data);
          break;
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
          response = await api.deleteCustomer(String(id));
          break;
        case 'equipment':
          response = await api.deleteEquipment(Number(id));
          break;
        case 'rental_transactions':
          response = await api.deleteRental(Number(id));
          break;
        case 'payment_schedules':
          response = await api.deletePaymentSchedule(Number(id));
          break;
        case 'equipment_categories': // Added case for equipment_categories
          response = await api.deleteEquipmentCategory(Number(id));
          break;
        case 'payment_plans': // Added case for payment_plans
          response = await api.deletePaymentPlan(Number(id));
          break;
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
