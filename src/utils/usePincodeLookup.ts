import { useEffect, useRef, useState } from 'react';
import { PincodeApiResponse, PostOffice } from '../types';

interface AreaOption {
  value: string;
  label: string;
}

interface PincodeLookupResult {
  loading: boolean;
  error: string | null;
  areaOptions: AreaOption[];
  city: string;
  state: string;
  isAreaSelect: boolean;
}

/**
 * Hook to fetch Indian pincode details with debounce.
 * @param pincode 6 digit pincode string
 */
export const usePincodeLookup = (pincode: string): PincodeLookupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isAreaSelect, setIsAreaSelect] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setError(null);
      setAreaOptions([]);
      setCity('');
      setState('');
      setIsAreaSelect(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setAreaOptions([]);
      setIsAreaSelect(false);

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data: PincodeApiResponse = await response.json();

        if (
          data &&
          data[0] &&
          data[0].Status === 'Success' &&
          data[0].PostOffice &&
          data[0].PostOffice.length > 0
        ) {
          const postOffices = data[0].PostOffice as PostOffice[];
          const firstPostOffice = postOffices[0];

          setCity(firstPostOffice.District || '');
          setState(firstPostOffice.State || '');

          if (postOffices.length > 1) {
            setAreaOptions(postOffices.map(po => ({ value: po.Name, label: po.Name })));
            setIsAreaSelect(true);
          } else {
            setAreaOptions([{ value: firstPostOffice.Name, label: firstPostOffice.Name }]);
            setIsAreaSelect(false);
          }
        } else if (
          data &&
          data[0] &&
          (data[0].Status === 'Error' ||
            data[0].Status === '404' ||
            !data[0].PostOffice ||
            data[0].PostOffice.length === 0)
        ) {
          setError(data[0].Message || 'Pincode not found or no post offices listed.');
          setCity('');
          setState('');
        } else {
          setError('Invalid response from pincode API.');
          setCity('');
          setState('');
        }
      } catch (err) {
        console.error('Pincode API error:', err);
        setError('Failed to fetch pincode details. Check network connection.');
        setCity('');
        setState('');
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pincode]);

  return { loading, error, areaOptions, city, state, isAreaSelect };
};

export default usePincodeLookup;
