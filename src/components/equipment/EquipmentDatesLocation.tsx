import React from 'react';
import { EquipmentFormData } from '../../types';
import { CalendarDays, MapPin, Wrench } from 'lucide-react';

import DatePickerField from "../ui/DatePickerField";
interface Props {
  formData: EquipmentFormData;
  formErrors: Partial<Record<keyof EquipmentFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  inputClass: string;
  labelClass: string;
  iconClass: string;
}

const EquipmentDatesLocation: React.FC<Props> = ({
  formData,
  formErrors,
  handleChange,
  inputClass,
  labelClass,
  iconClass,
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Dates & Location</legend>
    <div>
      <label htmlFor="purchase_date" className={labelClass}>Purchase Date</label>
      <DatePickerField
        name="purchase_date"
        value={formData.purchase_date || ''}
        onChange={handleChange}
      />
      {formErrors.purchase_date && <p className="text-xs text-red-500 mt-1">{formErrors.purchase_date}</p>}
    </div>
    <div>
      <label htmlFor="location" className={labelClass}>Current Location</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className={iconClass} /></div>
        <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} className={`${inputClass} pl-10`} />
      </div>
    </div>
    <div>
      <label htmlFor="last_maintenance_date" className={labelClass}>Last Maintenance Date</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wrench className={iconClass} /></div>
        <DatePickerField
          name="last_maintenance_date"
          value={formData.last_maintenance_date || ''}
          onChange={handleChange}
        />
      </div>
    </div>
    <div>
      <label htmlFor="next_calibration_date" className={labelClass}>Next Calibration Date</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDays className={iconClass} /></div>
        <DatePickerField
          name="next_calibration_date"
          value={formData.next_calibration_date || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  </fieldset>
);

export default EquipmentDatesLocation;
