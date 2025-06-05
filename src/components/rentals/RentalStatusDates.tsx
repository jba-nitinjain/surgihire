import React from 'react';
import { CalendarDays } from 'lucide-react';
import { RentalTransactionFormData } from '../../types';

import DatePickerField from "../ui/DatePickerField";
interface Props {
  data: Pick<RentalTransactionFormData, 'rental_date' | 'expected_return_date'>;
  numberOfDays: number;
  errors: Partial<Record<'rental_date' | 'expected_return_date', string>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputClass: string;
  labelClass: string;
  iconClass: string;
}

const RentalStatusDates: React.FC<Props> = ({
  data,
  numberOfDays,
  errors,
  handleChange,
  inputClass,
  labelClass,
  iconClass,
}) => (
  <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-3">
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">
      Rental Details
    </legend>
    <div>
      <label htmlFor="rental_date" className={labelClass}>
        Rental Date <span className="text-red-500">*</span>
      </label>
      <DatePickerField
        name="rental_date"
        value={data.rental_date}
        onChange={handleChange}
        required
      />
      {errors.rental_date && (
        <p className="text-xs text-red-500 mt-1">{errors.rental_date}</p>
      )}
    </div>

    <div>
      <label htmlFor="expected_return_date" className={labelClass}>
        Expected Return Date <span className="text-red-500">*</span>
      </label>
      <DatePickerField
        name="expected_return_date"
        value={data.expected_return_date || ''}
        onChange={handleChange}
        required
      />
      {errors.expected_return_date && (
        <p className="text-xs text-red-500 mt-1">{errors.expected_return_date}</p>
      )}
    </div>

    <div>
      <label className={labelClass}>Number of Days</label>
      <p className="mt-1 px-3 py-2 bg-light-gray-100 border border-light-gray-300 rounded-md text-dark-text/80 sm:text-sm flex items-center">
        <CalendarDays size={16} className="mr-2 text-brand-blue" />{' '}
        {numberOfDays > 0 ? numberOfDays : 'N/A'}
      </p>
    </div>

  </fieldset>
);

export default RentalStatusDates;
