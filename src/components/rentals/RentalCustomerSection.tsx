import React from 'react';
import { Customer as CustomerType } from '../../types';
import { Loader2, User, PlusCircle, ChevronDown } from 'lucide-react';
import AutocompleteField from '../ui/AutocompleteField';
import Button from '@mui/material/Button';

interface Props {
  customerId: string;
  customers: CustomerType[];
  loadingCustomers: boolean;
  status: string;
  statusOptions: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  statusError?: string;
  inputClass: string;
  labelClass: string;
  iconClass: string;
  onAddCustomer: () => void;
}

const RentalCustomerSection: React.FC<Props> = ({
  customerId,
  customers,
  loadingCustomers,
  status,
  statusOptions,
  handleChange,
  error,
  statusError,
  inputClass,
  labelClass,
  iconClass,
  onAddCustomer,
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">
      Customer
    </legend>
    <div>
      <label htmlFor="customer_id" className={labelClass}>
        Customer <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 relative rounded-md shadow-sm flex space-x-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loadingCustomers ? (
            <Loader2 className={`${iconClass} animate-spin`} />
          ) : (
            <User className={iconClass} />
          )}
        </div>
        <div className="flex-1 pl-10">
          <AutocompleteField
            name="customer_id"
            id="customer_id"
            value={customerId}
            onChange={handleChange}
            options={customers.map((c) => ({ label: c.full_name, value: String(c.customer_id) }))}
            loading={loadingCustomers}
            disabled={loadingCustomers}
            placeholder={loadingCustomers ? 'Loading...' : 'Select Customer'}
          />
        </div>
        <Button variant="outlined" size="small" onClick={onAddCustomer} startIcon={<PlusCircle className="h-4 w-4" />} sx={{ minWidth: 'fit-content', textTransform: 'none' }}>
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
    <div>
      <label htmlFor="status" className={labelClass}>
        Status <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ChevronDown className={iconClass} />
        </div>
        <div className="pl-10">
          <AutocompleteField
            name="status"
            id="status"
            value={status}
            onChange={handleChange}
            options={statusOptions.map((s) => ({ label: s, value: s }))}
            placeholder="Select status"
          />
        </div>
      </div>
      {statusError && <p className="text-xs text-red-500 mt-1">{statusError}</p>}
    </div>
  </fieldset>
);

export default RentalCustomerSection;
