import React from 'react';
import { Unstable_NumberInput as BaseNumberInput } from '@mui/base/Unstable_NumberInput';

interface NumberFieldProps {
  name: string;
  id?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

const NumberField: React.FC<NumberFieldProps> = ({
  name,
  id = name,
  value,
  onChange,
  startAdornment,
  endAdornment,
  min,
  max,
  step,
  required = false,
  readOnly = false,
  className,
}) => {
  const handleChange = (_event: any, val: number | undefined) => {
    const syntheticEvent = {
      target: { name, value: val === undefined ? '' : String(val) },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <BaseNumberInput
      id={id}
      value={value === '' ? undefined : Number(value)}
      onChange={handleChange}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      min={min}
      max={max}
      step={step}
      required={required}
      readOnly={readOnly}
      slotProps={{
        root: { className: `flex items-center border rounded-md px-3 py-2 w-full ${className || ''}` },
        input: { className: 'flex-1 outline-none', name },
        incrementButton: { className: 'px-1 text-sm' },
        decrementButton: { className: 'px-1 text-sm' },
      }}
    />
  );
};

export default NumberField;
