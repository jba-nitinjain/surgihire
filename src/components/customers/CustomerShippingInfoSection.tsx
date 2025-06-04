import React from 'react';
import { CustomerFormData } from '../../types';
import { Loader2 } from 'lucide-react';
import { TextField, TextAreaField, SelectField } from '../ui/FormField';

interface AreaOption {
  value: string;
  label: string;
}

interface Props {
  formData: CustomerFormData;
  formErrors: Partial<Record<keyof CustomerFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  pincodeDetailsLoading: boolean;
  pincodeError: string | null;
  areaOptions: AreaOption[];
  isAreaSelect: boolean;
  labelClass: string;
}

const CustomerShippingInfoSection: React.FC<Props> = ({
  formData,
  formErrors,
  handleChange,
  pincodeDetailsLoading,
  pincodeError,
  areaOptions,
  isAreaSelect,
  labelClass,
}) => (
  <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full">Shipping Information</legend>
    <div className="md:col-span-2">
      <label htmlFor="shipping_address" className={labelClass}>Address Line</label>
      <TextAreaField name="shipping_address" id="shipping_address" value={formData.shipping_address || ''} onChange={handleChange} rows={2} />
    </div>

    <div>
      <label htmlFor="shipping_pincode" className={labelClass}>Pincode</label>
      <div className="relative">
        <TextField
          type="text"
          name="shipping_pincode"
          id="shipping_pincode"
          value={formData.shipping_pincode || ''}
          onChange={handleChange}
          maxLength={6}
        />
        {pincodeDetailsLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      {formErrors.shipping_pincode && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_pincode}</p>}
      {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
    </div>

    <div>
      <label htmlFor="shipping_area" className={labelClass}>Area</label>
      {isAreaSelect ? (
        <SelectField name="shipping_area" id="shipping_area" value={formData.shipping_area || ''} onChange={handleChange}>
          <option value="">Select Area</option>
          {areaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </SelectField>
      ) : (
        <TextField type="text" name="shipping_area" id="shipping_area" value={formData.shipping_area || ''} onChange={handleChange} readOnly={areaOptions.length > 0 && !isAreaSelect} />
      )}
      {formErrors.shipping_area && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_area}</p>}
    </div>

    <div>
      <label htmlFor="shipping_city" className={labelClass}>City</label>
      <TextField type="text" name="shipping_city" id="shipping_city" value={formData.shipping_city || ''} onChange={handleChange} readOnly />
    </div>
    <div>
      <label htmlFor="shipping_state" className={labelClass}>State</label>
      <TextField type="text" name="shipping_state" id="shipping_state" value={formData.shipping_state || ''} onChange={handleChange} readOnly />
    </div>
  </fieldset>
);

export default CustomerShippingInfoSection;
