import React from 'react';
import { EquipmentFormData } from '../../types';
import { IndianRupee, Tag } from 'lucide-react';
import OutlinedTextField from '../ui/OutlinedTextField';
import AutocompleteField, { AutocompleteOption } from '../ui/AutocompleteField';
import InputAdornment from '@mui/material/InputAdornment';

interface Props {
  formData: EquipmentFormData;
  formErrors: Partial<Record<keyof EquipmentFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  isEditing: boolean;
  equipmentStatuses: string[];
  inputClass: string;
  labelClass: string;
  iconClass: string;
}

const EquipmentFinancial: React.FC<Props> = ({
  formData,
  formErrors,
  handleChange,
  isEditing,
  equipmentStatuses,
  inputClass,
  labelClass,
  iconClass,
}) => {
  const statusOptions: AutocompleteOption[] = equipmentStatuses.map((s) => ({
    label: s,
    value: s,
  }));

  return (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Financials & Status</legend>
    <div className={isEditing ? 'md:col-span-2' : ''}>
      <OutlinedTextField
        label="Rental Rate (₹ per unit/day)"
        type="number"
        name="rental_rate"
        id="rental_rate"
        value={formData.rental_rate || ''}
        onChange={handleChange}
        error={!!formErrors.rental_rate}
        helperText={formErrors.rental_rate}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IndianRupee className={iconClass} />
            </InputAdornment>
          ),
          inputProps: { step: 0.01, min: 0 },
        }}
      />
    </div>
    <div>
      <label htmlFor="status" className={labelClass}>Status</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className={iconClass} /></div>
        <div className="pl-10">
          <AutocompleteField
            name="status"
            value={formData.status || ''}
            onChange={handleChange}
            options={statusOptions}
            placeholder="Select Status"
          />
        </div>
      </div>
    </div>
  </fieldset>
  );
};

export default EquipmentFinancial;
