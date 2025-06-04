import React from 'react';
import { Customer as CustomerType } from '../../types';
import { Loader2, User } from 'lucide-react';

interface Props {
  customerId: string;
  customers: CustomerType[];
  loadingCustomers: boolean;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
        <select
          name="customer_id"
          id="customer_id"
          value={customerId}
          onChange={handleChange}
          className={`${inputClass} pl-10`}
          required
          disabled={loadingCustomers}
        >
          <option value="">
            {loadingCustomers ? 'Loading...' : 'Select Customer'}
          </option>
          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  </fieldset>
);

export default RentalCustomerSection;
