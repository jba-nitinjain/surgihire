import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import OutlinedTextField from '../ui/OutlinedTextField';
import { requestOtp, validateOtp } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <Box p={4} maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>
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
        className="mt-4"
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
            className="mt-4"
            disabled={loading}
          >
            Login
          </Button>
        </>
      )}
      {message && (
        <Typography color="error" className="mt-2">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoginPage;
