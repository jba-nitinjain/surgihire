import React from 'react';
import { EquipmentFormData } from '../../types';
import { Hash, Layers } from 'lucide-react';
import OutlinedTextField from '../ui/OutlinedTextField';
import InputAdornment from '@mui/material/InputAdornment';

interface Props {
  formData: EquipmentFormData;
  formErrors: Partial<Record<keyof EquipmentFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  isEditing: boolean;
  inputClass: string;
  labelClass: string;
  iconClass: string;
}

const EquipmentIdentification: React.FC<Props> = ({
  formData,
  formErrors,
  handleChange,
  isEditing,
  inputClass,
  labelClass,
  iconClass,
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Identification & Quantity</legend>
    <div>
      <OutlinedTextField
        label="Make/Brand"
        name="make"
        id="make"
        value={formData.make || ''}
        onChange={handleChange}
      />
    </div>
    <div>
      <OutlinedTextField
        label="Model"
        name="model"
        id="model"
        value={formData.model || ''}
        onChange={handleChange}
      />
    </div>
    <div>
      <OutlinedTextField
        label={`Serial Number ${isEditing ? '(Editing specific item)' : '(Base for quantity)'}`}
        name="serial_number"
        id="serial_number"
        value={formData.serial_number || ''}
        onChange={handleChange}
        error={!!formErrors.serial_number}
        helperText={formErrors.serial_number}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Hash className={iconClass} />
            </InputAdornment>
          ),
        }}
      />
    </div>
    {!isEditing && (
      <div>
        <OutlinedTextField
          label="Quantity"
          type="number"
          name="quantity"
          id="quantity"
          value={formData.quantity || '1'}
          onChange={handleChange}
          error={!!formErrors.quantity}
          helperText={formErrors.quantity}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Layers className={iconClass} />
              </InputAdornment>
            ),
            inputProps: { min: 1 },
          }}
        />
      </div>
    )}
  </fieldset>
);

export default EquipmentIdentification;
