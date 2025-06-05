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
      <OutlinedTextField
        label="Email"
        type="email"
        name="email"
        id="email"
        value={formData.email || ''}
        onChange={handleChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
      />
    </div>
    <div>
      <OutlinedTextField
        label="Mobile Number 1"
        type="tel"
        name="mobile_number_1"
        id="mobile_number_1"
        value={formData.mobile_number_1 || ''}
        onChange={handleChange}
        error={!!formErrors.mobile_number_1}
        helperText={formErrors.mobile_number_1}
      />
    </div>
    <div>
      <OutlinedTextField
        label="Mobile Number 2"
        type="tel"
        name="mobile_number_2"
        id="mobile_number_2"
        value={formData.mobile_number_2 || ''}
        onChange={handleChange}
      />
    </div>
    <div>
      <OutlinedTextField
        label="Mobile Number 3"
        type="tel"
        name="mobile_number_3"
        id="mobile_number_3"
        value={formData.mobile_number_3 || ''}
        onChange={handleChange}
      />
    </div>
  </fieldset>
);

export default CustomerPersonalInfoSection;
