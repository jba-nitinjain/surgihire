import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

export interface AutocompleteOption {
  label: string;
  value: string | number;
}

interface AutocompleteFieldProps {
  name: string;
  id?: string;
  value: string | number | undefined;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  options: AutocompleteOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  name,
  id = name,
  value,
  onChange,
  options,
  loading = false,
  disabled = false,
  placeholder,
}) => {
  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) || null;

  const handleChange = (_: any, newValue: AutocompleteOption | null) => {
    const syntheticEvent = {
      target: {
        name,
        value: newValue ? newValue.value : '',
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={selectedOption}
      onChange={handleChange}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          id={id}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AutocompleteField;
