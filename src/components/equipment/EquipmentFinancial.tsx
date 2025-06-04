import React from 'react';
import { EquipmentFormData } from '../../types';
import { IndianRupee, Tag } from 'lucide-react';

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
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Financials & Status</legend>
    <div className={isEditing ? 'md:col-span-2' : ''}>
      <label htmlFor="rental_rate" className={labelClass}>Rental Rate (₹ per unit/day)</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee className={iconClass} /></div>
        <input type="number" name="rental_rate" id="rental_rate" value={formData.rental_rate || ''} onChange={handleChange} className={`${inputClass} pl-10`} step="0.01" min="0" />
      </div>
      {formErrors.rental_rate && <p className="text-xs text-red-500 mt-1">{formErrors.rental_rate}</p>}
    </div>
    <div>
      <label htmlFor="status" className={labelClass}>Status</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className={iconClass} /></div>
        <select name="status" id="status" value={formData.status || ''} onChange={handleChange} className={`${inputClass} pl-10`}>
          {equipmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </fieldset>
);

export default EquipmentFinancial;
