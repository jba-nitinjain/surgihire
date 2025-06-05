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
  const url = new URL(
    'https://surgihire.kodequick.com/custom/login_request.php'
  );
  url.searchParams.set('mobile', mobile);
  const response = await fetch(url.toString(), { method: 'POST' });
  return response.json();
};

export const validateOtp = async (
  mobile: string,
  otp: string
): Promise<LoginResponse> => {
  const url = new URL(
    'https://surgihire.kodequick.com/custom/login_validation.php'
  );
  url.searchParams.set('mobile', mobile);
  url.searchParams.set('otp', otp);
  const response = await fetch(url.toString(), { method: 'POST' });
  return response.json();
};
