import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFound: React.FC = () => (
  <Box p={8} textAlign="center">
    <Typography variant="h4" gutterBottom>
      Page Not Found
    </Typography>
    <Typography variant="body1" gutterBottom>
      The page you are looking for does not exist.
    </Typography>
    <Button variant="contained" color="primary" component={RouterLink} to="/">
      Go to Dashboard
    </Button>
  </Box>
);

export default NotFound;

