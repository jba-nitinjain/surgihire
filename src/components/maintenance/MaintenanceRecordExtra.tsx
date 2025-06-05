import React from 'react';
import { MaintenanceRecordFormData } from '../../types';
import { User, IndianRupee, Info } from 'lucide-react';
import OutlinedTextField from '../ui/OutlinedTextField';
import InputAdornment from '@mui/material/InputAdornment';

interface Props {
  formData: MaintenanceRecordFormData;
  formErrors: Partial<Record<keyof MaintenanceRecordFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  inputClass: string;
  labelClass: string;
}

const MaintenanceRecordExtra: React.FC<Props> = ({
  formData,
  formErrors,
  handleChange,
  inputClass,
  labelClass,
}) => {
  const iconClass = 'h-5 w-5 text-gray-400';
  return (
    <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
      <div>
        <label htmlFor="technician" className={labelClass}>Technician</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className={iconClass} />
          </div>
          <OutlinedTextField
            type="text"
            id="technician"
            name="technician"
            value={formData.technician || ''}
            onChange={handleChange}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="cost" className={labelClass}>Cost (₹)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IndianRupee className={iconClass} />
          </div>
          <OutlinedTextField
            type="number"
            id="cost"
            name="cost"
            value={formData.cost || ''}
            onChange={handleChange}
            className={`${inputClass} pl-10`}
            inputProps={{ step: '0.01', min: '0' }}
            placeholder="0.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IndianRupee className={iconClass} />
                </InputAdornment>
              ),
            }}
          />
        </div>
        {formErrors.cost && <p className="text-xs text-red-500 mt-1">{formErrors.cost}</p>}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="notes" className={labelClass}>Notes</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 top-2 pl-3 flex items-start pointer-events-none">
            <Info className={iconClass} />
          </div>
          <OutlinedTextField
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            multiline
            rows={3}
            className={`${inputClass} pl-10`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Info className={iconClass} />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    </fieldset>
  );
};

export default MaintenanceRecordExtra;
