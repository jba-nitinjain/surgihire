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
  const url =
    'https://surgihire.kodequick.com/custom/login_request.php';
  const body = new URLSearchParams();
  body.set('mobile', mobile);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  return response.json();
};

export const validateOtp = async (
  mobile: string,
  otp: string
): Promise<LoginResponse> => {
  const url =
    'https://surgihire.kodequick.com/custom/login_validation.php';
  const body = new URLSearchParams();
  body.set('mobile', mobile);
  body.set('otp', otp);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  return response.json();
};
