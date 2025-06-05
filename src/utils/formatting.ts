/**
 * Formats a date string into a more readable format.
 * @param dateString The date string to format.
 * @param options Intl.DateTimeFormatOptions to customize the output.
 * @returns The formatted date string or 'N/A' if the date is invalid.
 */
export const formatDate = (
    dateString: string | null | undefined,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString.includes('/') ? dateString.split('/').reverse().join('-') : dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options,
      };
      return new Intl.DateTimeFormat('en-GB', defaultOptions).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };
  
  /**
   * Formats a numerical value into a currency string (INR by default).
   * @param value The number or string to format.
   * @param currency The currency code (e.g., 'INR', 'USD').
   * @param locale The locale for formatting (e.g., 'en-IN', 'en-US').
   * @returns The formatted currency string or 'N/A'.
   */
  export const formatCurrency = (
    value: number | string | null | undefined,
    currency: string = 'INR',
    locale: string = 'en-IN'
  ): string => {
    let numericValue: number | null = null;
  
    if (typeof value === 'number') {
      numericValue = value;
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]+/g,"")); // Clean string before parsing
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }
  
    if (numericValue !== null) {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          // minimumFractionDigits: 2, // Optional: ensure two decimal places
          // maximumFractionDigits: 2, // Optional: ensure two decimal places
        }).format(numericValue);
      } catch (e) {
        console.error("Error formatting currency:", e);
        return String(numericValue); // Fallback to string representation of number
      }
    }
    return 'N/A';
  };
  