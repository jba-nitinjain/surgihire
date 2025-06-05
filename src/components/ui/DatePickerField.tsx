import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface DatePickerFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  disabled?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, name, value, onChange, required, disabled = false }) => {
  const handleChange = (date: Dayjs | null) => {
    const syntheticEvent = {
      target: { name, value: date ? date.format('DD/MM/YYYY') : '' }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <DatePicker
      label={label}
      format="DD/MM/YYYY"
      value={value ? dayjs(value, 'DD/MM/YYYY') : null}
      onChange={handleChange}
      slotProps={{ textField: { fullWidth: true, name, id: name, required, disabled } }}
    />
  );
};

export default DatePickerField;
