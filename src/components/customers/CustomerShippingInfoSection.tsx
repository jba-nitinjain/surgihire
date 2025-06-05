import React from 'react';
import { CustomerFormData } from '../../types';
import { Loader2 } from 'lucide-react';
import AutocompleteField, { AutocompleteOption } from '../ui/AutocompleteField';
import OutlinedTextField from '../ui/OutlinedTextField';
import InputAdornment from '@mui/material/InputAdornment';

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
  inputClass: string;
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
  inputClass,
  labelClass,
}) => {
  const areaSelectOptions: AutocompleteOption[] = areaOptions.map(opt => ({
    label: opt.label,
    value: opt.value,
  }));

  return (
  <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full">Shipping Information</legend>
    <div className="md:col-span-2">
      <OutlinedTextField
        label="Address Line"
        name="shipping_address"
        id="shipping_address"
        value={formData.shipping_address || ''}
        onChange={handleChange}
        multiline
        rows={2}
      />
    </div>

    <div>
      <OutlinedTextField
        label="Pincode"
        name="shipping_pincode"
        id="shipping_pincode"
        value={formData.shipping_pincode || ''}
        onChange={handleChange}
        inputProps={{ maxLength: 6 }}
        error={!!formErrors.shipping_pincode || !!pincodeError}
        helperText={formErrors.shipping_pincode || pincodeError}
        InputProps={{
          endAdornment: pincodeDetailsLoading ? (
            <InputAdornment position="end">
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            </InputAdornment>
          ) : undefined,
        }}
      />
    </div>

    <div>
      {isAreaSelect ? (
        <AutocompleteField
          name="shipping_area"
          value={formData.shipping_area || ''}
          onChange={handleChange}
          options={areaSelectOptions}
          placeholder="Select Area"
        />
      ) : (
        <OutlinedTextField
          label="Area"
          name="shipping_area"
          id="shipping_area"
          value={formData.shipping_area || ''}
          onChange={handleChange}
          InputProps={{ readOnly: areaOptions.length > 0 && !isAreaSelect }}
        />
      )}
      {formErrors.shipping_area && <p className="text-xs text-red-500 mt-1">{formErrors.shipping_area}</p>}
    </div>

    <div>
      <OutlinedTextField
        label="City"
        name="shipping_city"
        id="shipping_city"
        value={formData.shipping_city || ''}
        onChange={handleChange}
        InputProps={{ readOnly: true }}
      />
    </div>
    <div>
      <OutlinedTextField
        label="State"
        name="shipping_state"
        id="shipping_state"
        value={formData.shipping_state || ''}
        onChange={handleChange}
        InputProps={{ readOnly: true }}
      />
    </div>
  </fieldset>
  );
};

export default CustomerShippingInfoSection;
