import React from 'react';
import { Customer as CustomerType } from '../../types';
import { Loader2, User } from 'lucide-react';
import AutocompleteField from '../ui/AutocompleteField';

interface Props {
  customerId: string;
  customers: CustomerType[];
  loadingCustomers: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  inputClass: string;
  labelClass: string;
  iconClass: string;
}

const RentalCustomerSection: React.FC<Props> = ({
  customerId,
  customers,
  loadingCustomers,
  handleChange,
  error,
  inputClass,
  labelClass,
  iconClass,
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">
      Customer
    </legend>
    <div>
      <label htmlFor="customer_id" className={labelClass}>
        Customer <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loadingCustomers ? (
            <Loader2 className={`${iconClass} animate-spin`} />
          ) : (
            <User className={iconClass} />
          )}
        </div>
        <div className="pl-10">
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
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  </fieldset>
);

export default RentalCustomerSection;
