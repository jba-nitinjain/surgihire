import React from 'react';
import { EquipmentFormData } from '../../types';
import { Hash, Layers } from 'lucide-react';

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
      <label htmlFor="make" className={labelClass}>Make/Brand</label>
      <input type="text" name="make" id="make" value={formData.make || ''} onChange={handleChange} className={inputClass} />
    </div>
    <div>
      <label htmlFor="model" className={labelClass}>Model</label>
      <input type="text" name="model" id="model" value={formData.model || ''} onChange={handleChange} className={inputClass} />
    </div>
    <div>
      <label htmlFor="serial_number" className={labelClass}>Serial Number {isEditing ? '(Editing specific item)' : '(Base for quantity)'}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash className={iconClass} /></div>
        <input type="text" name="serial_number" id="serial_number" value={formData.serial_number || ''} onChange={handleChange} className={`${inputClass} pl-10`} />
      </div>
      {formErrors.serial_number && <p className="text-xs text-red-500 mt-1">{formErrors.serial_number}</p>}
    </div>
    {!isEditing && (
      <div>
        <label htmlFor="quantity" className={labelClass}>Quantity</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Layers className={iconClass} /></div>
          <input type="number" name="quantity" id="quantity" value={formData.quantity || '1'} onChange={handleChange} className={`${inputClass} pl-10`} min="1" />
        </div>
        {formErrors.quantity && <p className="text-xs text-red-500 mt-1">{formErrors.quantity}</p>}
      </div>
    )}
  </fieldset>
);

export default EquipmentIdentification;
