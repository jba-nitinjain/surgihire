import React from 'react';
import { Box, Typography } from '@mui/material';
import { APP_VERSION } from '../version';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <Box component="footer" textAlign="center" mt={4}>
      <Typography variant="caption" color="text.secondary">
        &copy; {year} SurgiHire – Version {APP_VERSION}
      </Typography>
    </Box>
  );
};

export default Footer;
