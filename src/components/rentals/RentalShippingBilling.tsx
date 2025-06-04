import React from 'react';
import { RentalTransactionFormData } from '../../types';
import { Loader2 } from 'lucide-react';

interface Props {
  data: Pick<
    RentalTransactionFormData,
    | 'shipping_address'
    | 'shipping_area'
    | 'shipping_city'
    | 'shipping_state'
    | 'shipping_pincode'
    | 'billing_address'
    | 'billing_area'
    | 'billing_city'
    | 'billing_state'
    | 'billing_pincode'
    | 'mobile_number'
    | 'email'
  >;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  shippingPincodeDetailsLoading: boolean;
  shippingPincodeError: string | null;
  shippingAreaOptions: { value: string; label: string }[];
  shippingIsAreaSelect: boolean;
  billingPincodeDetailsLoading: boolean;
  billingPincodeError: string | null;
  billingAreaOptions: { value: string; label: string }[];
  billingIsAreaSelect: boolean;
  copyShippingToBilling: () => void;
  copyBillingToShipping: () => void;
  inputClass: string;
  labelClass: string;
}

const RentalShippingBilling: React.FC<Props> = ({
  data,
  errors,
  handleChange,
  shippingPincodeDetailsLoading,
  shippingPincodeError,
  shippingAreaOptions,
  shippingIsAreaSelect,
  billingPincodeDetailsLoading,
  billingPincodeError,
  billingAreaOptions,
  billingIsAreaSelect,
  copyShippingToBilling,
  copyBillingToShipping,
  inputClass,
  labelClass,
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">
      Shipping &amp; Billing
    </legend>
    <div className="col-span-full flex gap-4 text-xs">
      <button
        type="button"
        onClick={copyShippingToBilling}
        className="text-brand-blue underline"
      >
        Copy Shipping to Billing
      </button>
      <button
        type="button"
        onClick={copyBillingToShipping}
        className="text-brand-blue underline"
      >
        Copy Billing to Shipping
      </button>
    </div>
    <div className="md:col-span-2">
      <label htmlFor="shipping_address" className={labelClass}>
        Shipping Address
      </label>
      <textarea
        id="shipping_address"
        name="shipping_address"
        value={data.shipping_address || ''}
        onChange={handleChange}
        rows={2}
        className={inputClass}
      />
    </div>
    <div>
      <label htmlFor="shipping_area" className={labelClass}>
        Shipping Area
      </label>
      {shippingIsAreaSelect ? (
        <select
          id="shipping_area"
          name="shipping_area"
          value={data.shipping_area || ''}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select Area</option>
          {shippingAreaOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          id="shipping_area"
          name="shipping_area"
          value={data.shipping_area || ''}
          onChange={handleChange}
          className={inputClass}
          readOnly={shippingAreaOptions.length > 0 && !shippingIsAreaSelect}
        />
      )}
      {errors.shipping_area && (
        <p className="text-xs text-red-500 mt-1">{errors.shipping_area}</p>
      )}
    </div>
    <div>
      <label htmlFor="shipping_city" className={labelClass}>
        Shipping City
      </label>
      <input
        type="text"
        id="shipping_city"
        name="shipping_city"
        value={data.shipping_city || ''}
        onChange={handleChange}
        className={inputClass}
        readOnly
      />
    </div>
    <div>
      <label htmlFor="shipping_state" className={labelClass}>
        Shipping State
      </label>
      <input
        type="text"
        id="shipping_state"
        name="shipping_state"
        value={data.shipping_state || ''}
        onChange={handleChange}
        className={inputClass}
        readOnly
      />
    </div>
    <div>
      <label htmlFor="shipping_pincode" className={labelClass}>
        Shipping Pincode
      </label>
      <div className="relative">
        <input
          type="text"
          id="shipping_pincode"
          name="shipping_pincode"
          value={data.shipping_pincode || ''}
          onChange={handleChange}
          className={inputClass}
          maxLength={6}
        />
        {shippingPincodeDetailsLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      {errors.shipping_pincode && (
        <p className="text-xs text-red-500 mt-1">{errors.shipping_pincode}</p>
      )}
      {shippingPincodeError && (
        <p className="text-xs text-red-500 mt-1">{shippingPincodeError}</p>
      )}
    </div>
    <div className="md:col-span-2">
      <label htmlFor="billing_address" className={labelClass}>
        Billing Address
      </label>
      <textarea
        id="billing_address"
        name="billing_address"
        value={data.billing_address || ''}
        onChange={handleChange}
        rows={2}
        className={inputClass}
      />
    </div>
    <div>
      <label htmlFor="billing_area" className={labelClass}>
        Billing Area
      </label>
      {billingIsAreaSelect ? (
        <select
          id="billing_area"
          name="billing_area"
          value={data.billing_area || ''}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select Area</option>
          {billingAreaOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          id="billing_area"
          name="billing_area"
          value={data.billing_area || ''}
          onChange={handleChange}
          className={inputClass}
          readOnly={billingAreaOptions.length > 0 && !billingIsAreaSelect}
        />
      )}
      {errors.billing_area && (
        <p className="text-xs text-red-500 mt-1">{errors.billing_area}</p>
      )}
    </div>
    <div>
      <label htmlFor="billing_city" className={labelClass}>
        Billing City
      </label>
      <input
        type="text"
        id="billing_city"
        name="billing_city"
        value={data.billing_city || ''}
        onChange={handleChange}
        className={inputClass}
        readOnly
      />
    </div>
    <div>
      <label htmlFor="billing_state" className={labelClass}>
        Billing State
      </label>
      <input
        type="text"
        id="billing_state"
        name="billing_state"
        value={data.billing_state || ''}
        onChange={handleChange}
        className={inputClass}
        readOnly
      />
    </div>
    <div>
      <label htmlFor="billing_pincode" className={labelClass}>
        Billing Pincode
      </label>
      <div className="relative">
        <input
          type="text"
          id="billing_pincode"
          name="billing_pincode"
          value={data.billing_pincode || ''}
          onChange={handleChange}
          className={inputClass}
          maxLength={6}
        />
        {billingPincodeDetailsLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      {errors.billing_pincode && (
        <p className="text-xs text-red-500 mt-1">{errors.billing_pincode}</p>
      )}
      {billingPincodeError && (
        <p className="text-xs text-red-500 mt-1">{billingPincodeError}</p>
      )}
    </div>
    <div>
      <label htmlFor="mobile_number" className={labelClass}>
        Mobile Number
      </label>
      <input
        type="text"
        id="mobile_number"
        name="mobile_number"
        value={data.mobile_number || ''}
        onChange={handleChange}
        className={inputClass}
      />
    </div>
    <div>
      <label htmlFor="email" className={labelClass}>
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={data.email || ''}
        onChange={handleChange}
        className={inputClass}
      />
    </div>
  </fieldset>
);

export default RentalShippingBilling;
