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
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, name, value, onChange, required }) => {
  const handleChange = (date: Dayjs | null) => {
    const syntheticEvent = {
      target: { name, value: date ? date.format('YYYY-MM-DD') : '' }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <DatePicker
      label={label}
      value={value ? dayjs(value) : null}
      onChange={handleChange}
      slotProps={{ textField: { fullWidth: true, name, id: name, required } }}
    />
  );
};

export default DatePickerField;
