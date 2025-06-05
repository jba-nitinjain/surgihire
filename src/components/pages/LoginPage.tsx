import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import OutlinedTextField from '../ui/OutlinedTextField';
import { requestOtp, validateOtp } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setMessage('Please enter a valid 10 digit mobile number.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await requestOtp(mobile);
      setMessage(res.message);
      if (res.status_code === 200) {
        setOtpRequested(true);
      }
    } catch (err) {
      setMessage('Failed to request OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setMessage('Enter the 6 digit OTP.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await validateOtp(mobile, otp);
      setMessage(res.message);
      if (res.status_code === 200 && res.user?.apikey) {
        login(mobile, res.user.apikey);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setMessage('Failed to validate OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-light-gray-50 p-4">
      <Box className="w-full max-w-md bg-white rounded shadow-md p-6 space-y-4">
        <img src={logo} alt="SurgiHire logo" className="h-12 mx-auto" />
        <Typography variant="h5" align="center">
          Login
        </Typography>
        <OutlinedTextField
          label="Mobile Number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          inputProps={{ maxLength: 10 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRequestOtp}
          className="mt-2"
          disabled={loading}
        >
          Request OTP
        </Button>
        {otpRequested && (
          <>
            <OutlinedTextField
              label="OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              inputProps={{ maxLength: 6 }}
              className="mt-4"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleValidateOtp}
              className="mt-2"
              disabled={loading}
            >
              Login
            </Button>
          </>
        )}
        {message && <Alert severity="info">{message}</Alert>}
      </Box>
    </Box>
  );
};

export default LoginPage;
