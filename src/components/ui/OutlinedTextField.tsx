import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

/**
 * A wrapper around MUI's TextField that applies the outlined variant
 * and keeps the label positioned in the top left.
 */
const OutlinedTextField: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      {...props}
      variant="outlined"
      fullWidth
      InputLabelProps={{ shrink: true, ...(props.InputLabelProps || {}) }}
    />
  );
};

export default OutlinedTextField;
