import React from 'react';
import { EquipmentFormData, EquipmentCategory } from '../../types';
import { Loader2, Package, Info, Tag } from 'lucide-react';
import AutocompleteField, { AutocompleteOption } from '../ui/AutocompleteField';
import OutlinedTextField from '../ui/OutlinedTextField';
import InputAdornment from '@mui/material/InputAdornment';

interface Props {
  formData: EquipmentFormData;
  formErrors: Partial<Record<keyof EquipmentFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  equipmentCategories: EquipmentCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  inputClass: string;
  labelClass: string;
  iconClass: string;
}

const EquipmentBasicInfo: React.FC<Props> = ({
  formData,
  formErrors,
  handleChange,
  equipmentCategories,
  categoriesLoading,
  categoriesError,
  inputClass,
  labelClass,
  iconClass,
}) => {
  const categoryOptions: AutocompleteOption[] = equipmentCategories.map(cat => ({
    label: cat.category_name,
    value: String(cat.category_id),
  }));

  return (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Basic Information</legend>
    <div className="md:col-span-2">
      <OutlinedTextField
        label="Equipment Name"
        name="equipment_name"
        id="equipment_name"
        value={formData.equipment_name}
        onChange={handleChange}
        required
        error={!!formErrors.equipment_name}
        helperText={formErrors.equipment_name}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Package className={iconClass} />
            </InputAdornment>
          ),
        }}
      />
    </div>

    <div className="md:col-span-2">
      <OutlinedTextField
        label="Description"
        name="description"
        id="description"
        value={formData.description || ''}
        onChange={handleChange}
        multiline
        rows={3}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Info className={iconClass} />
            </InputAdornment>
          ),
        }}
      />
    </div>

    <div>
      <label htmlFor="category_id" className={labelClass}>Category</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {categoriesLoading ? <Loader2 className={`${iconClass} animate-spin`} /> : <Tag className={iconClass} />}
        </div>
        <div className="pl-10">
          <AutocompleteField
            name="category_id"
            value={formData.category_id === undefined ? '' : String(formData.category_id)}
            onChange={handleChange}
            options={categoryOptions}
            loading={categoriesLoading}
            disabled={categoriesLoading || !!categoriesError}
            placeholder={categoriesLoading ? 'Loading...' : 'Select Category'}
          />
        </div>
      </div>
    </div>
  </fieldset>
  );
};

export default EquipmentBasicInfo;
