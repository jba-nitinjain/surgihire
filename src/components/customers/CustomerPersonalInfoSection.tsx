import React from 'react';
import { CustomerFormData } from '../../types';
import OutlinedTextField from '../ui/OutlinedTextField';

interface Props {
  formData: CustomerFormData;
  formErrors: Partial<Record<keyof CustomerFormData, string>>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  inputClass: string;
  labelClass: string;
}

const CustomerPersonalInfoSection: React.FC<Props> = ({ formData, formErrors, handleChange, inputClass, labelClass }) => (
  <fieldset className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <legend className="text-lg font-medium text-dark-text col-span-full">Personal Information</legend>
    <div>
      <OutlinedTextField
        label="Full Name"
        name="full_name"
        id="full_name"
        value={formData.full_name}
        onChange={handleChange}
        required
        error={!!formErrors.full_name}
        helperText={formErrors.full_name}
      />
    </div>
    <div>
      <label htmlFor="email" className={labelClass}>Email</label>
      <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className={inputClass} />
      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
    </div>
    <div>
      <label htmlFor="mobile_number_1" className={labelClass}>Mobile Number 1</label>
      <input type="tel" name="mobile_number_1" id="mobile_number_1" value={formData.mobile_number_1 || ''} onChange={handleChange} className={inputClass} />
      {formErrors.mobile_number_1 && <p className="text-xs text-red-500 mt-1">{formErrors.mobile_number_1}</p>}
    </div>
    <div>
      <label htmlFor="mobile_number_2" className={labelClass}>Mobile Number 2</label>
      <input type="tel" name="mobile_number_2" id="mobile_number_2" value={formData.mobile_number_2 || ''} onChange={handleChange} className={inputClass} />
    </div>
    <div>
      <label htmlFor="mobile_number_3" className={labelClass}>Mobile Number 3</label>
      <input type="tel" name="mobile_number_3" id="mobile_number_3" value={formData.mobile_number_3 || ''} onChange={handleChange} className={inputClass} />
    </div>
  </fieldset>
);

export default CustomerPersonalInfoSection;
