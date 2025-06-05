import React from 'react';
import { RentalTransactionFormData } from '../../types';
import { Loader2 } from 'lucide-react';
import Button from '@mui/material/Button';
import OutlinedTextField from '../ui/OutlinedTextField';
import AutocompleteField from '../ui/AutocompleteField';
import InputAdornment from '@mui/material/InputAdornment';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
  <fieldset className="space-y-6">
    <legend className="text-lg font-medium text-dark-text mb-2">Shipping &amp; Billing</legend>
    <div className="flex gap-4 text-xs">
      <Button variant="outlined" size="small" onClick={copyShippingToBilling}
        >Copy Shipping to Billing</Button>
      <Button variant="outlined" size="small" onClick={copyBillingToShipping}
        >Copy Billing to Shipping</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="shipping_address" className={labelClass}>Shipping Address</label>
          <OutlinedTextField
            id="shipping_address"
            name="shipping_address"
            value={data.shipping_address || ''}
            onChange={handleChange}
            multiline
            rows={2}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="shipping_pincode" className={labelClass}>Shipping Pincode</label>
            <OutlinedTextField
              type="text"
              id="shipping_pincode"
              name="shipping_pincode"
              value={data.shipping_pincode || ''}
              onChange={handleChange}
              className={inputClass}
              inputProps={{ maxLength: 6 }}
              InputProps={{
                endAdornment: shippingPincodeDetailsLoading ? (
                  <InputAdornment position="end">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            {errors.shipping_pincode && (
              <p className="text-xs text-red-500 mt-1">{errors.shipping_pincode}</p>
            )}
            {shippingPincodeError && (
              <p className="text-xs text-red-500 mt-1">{shippingPincodeError}</p>
            )}
          </div>
          <div>
            <label htmlFor="shipping_area" className={labelClass}>Shipping Area</label>
            <AutocompleteField
              id="shipping_area"
              name="shipping_area"
              value={data.shipping_area || ''}
              onChange={handleChange}
              options={shippingAreaOptions}
              placeholder="Select Area"
              freeSolo
            />
            {errors.shipping_area && (
              <p className="text-xs text-red-500 mt-1">{errors.shipping_area}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="shipping_city" className={labelClass}>Shipping City</label>
            <OutlinedTextField
              type="text"
              id="shipping_city"
              name="shipping_city"
              value={data.shipping_city || ''}
              onChange={handleChange}
              className={inputClass}
              InputProps={{ readOnly: true }}
            />
          </div>
          <div>
            <label htmlFor="shipping_state" className={labelClass}>Shipping State</label>
            <OutlinedTextField
              type="text"
              id="shipping_state"
              name="shipping_state"
              value={data.shipping_state || ''}
              onChange={handleChange}
              className={inputClass}
              InputProps={{ readOnly: true }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="billing_address" className={labelClass}>Billing Address</label>
          <OutlinedTextField
            id="billing_address"
            name="billing_address"
            value={data.billing_address || ''}
            onChange={handleChange}
            multiline
            rows={2}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="billing_pincode" className={labelClass}>Billing Pincode</label>
            <OutlinedTextField
              type="text"
              id="billing_pincode"
              name="billing_pincode"
              value={data.billing_pincode || ''}
              onChange={handleChange}
              className={inputClass}
              inputProps={{ maxLength: 6 }}
              InputProps={{
                endAdornment: billingPincodeDetailsLoading ? (
                  <InputAdornment position="end">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            {errors.billing_pincode && (
              <p className="text-xs text-red-500 mt-1">{errors.billing_pincode}</p>
            )}
            {billingPincodeError && (
              <p className="text-xs text-red-500 mt-1">{billingPincodeError}</p>
            )}
          </div>
          <div>
            <label htmlFor="billing_area" className={labelClass}>Billing Area</label>
            <AutocompleteField
              id="billing_area"
              name="billing_area"
              value={data.billing_area || ''}
              onChange={handleChange}
              options={billingAreaOptions}
              placeholder="Select Area"
              freeSolo
            />
            {errors.billing_area && (
              <p className="text-xs text-red-500 mt-1">{errors.billing_area}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="billing_city" className={labelClass}>Billing City</label>
            <OutlinedTextField
              type="text"
              id="billing_city"
              name="billing_city"
              value={data.billing_city || ''}
              onChange={handleChange}
              className={inputClass}
              InputProps={{ readOnly: true }}
            />
          </div>
          <div>
            <label htmlFor="billing_state" className={labelClass}>Billing State</label>
            <OutlinedTextField
              type="text"
              id="billing_state"
              name="billing_state"
              value={data.billing_state || ''}
              onChange={handleChange}
              className={inputClass}
              InputProps={{ readOnly: true }}
            />
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="mobile_number" className={labelClass}>
          Mobile Number
        </label>
        <OutlinedTextField
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
        <OutlinedTextField
          type="email"
          id="email"
          name="email"
          value={data.email || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>
    </div>
  </fieldset>
);

export default RentalShippingBilling;
