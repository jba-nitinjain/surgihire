export interface LoginResponse {
  status_code: number;
  status: string;
  message: string;
  user?: {
    apikey: string;
    [key: string]: any;
  };
}

export const requestOtp = async (mobile: string): Promise<LoginResponse> => {
  const response = await fetch(
    'https://surgihire.kodequick.com/custom/login_request.php',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile }),
    }
  );
  return response.json();
};

export const validateOtp = async (
  mobile: string,
  otp: string
): Promise<LoginResponse> => {
  const response = await fetch(
    'https://surgihire.kodequick.com/custom/login_validation.php',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, otp }),
    }
  );
  return response.json();
};
