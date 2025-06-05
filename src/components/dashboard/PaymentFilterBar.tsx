import React from 'react';
import OutlinedTextField from '../ui/OutlinedTextField';
import AutocompleteField from '../ui/AutocompleteField';
import DatePickerField from '../ui/DatePickerField';
import NumberField from '../ui/NumberField';
import { PaymentFilters } from '../../context/PaymentContext';

interface PaymentFilterBarProps {
  filters: PaymentFilters;
  onFiltersChange: (update: Partial<PaymentFilters>) => void;
}

const PAYMENT_MODES = [
  'Cash',
  'NEFT/RTGS',
  'IMPS',
  'Credit Card',
  'Debit Card',
  'Others',
];

const AMOUNT_OPERATORS = [
  { label: 'Equals', value: 'equals' },
  { label: '>', value: 'gt' },
  { label: '>=', value: 'gte' },
  { label: '<', value: 'lt' },
  { label: '<=', value: 'lte' },
];

const PaymentFilterBar: React.FC<PaymentFilterBarProps> = ({ filters, onFiltersChange }) => (
  <div className="mb-6 p-4 bg-white rounded-lg shadow">
    {/* arrange filters in two lines on medium screens */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div>
        <label htmlFor="paymentRentalFilter" className="block text-sm font-medium text-dark-text mb-1">
          Rental ID
        </label>
        <OutlinedTextField
          id="paymentRentalFilter"
          name="rental_id"
          value={filters.rental_id || ''}
          onChange={(e) => onFiltersChange({ rental_id: e.target.value || null })}
        />
      </div>
      <div>
        <label htmlFor="paymentModeFilter" className="block text-sm font-medium text-dark-text mb-1">
          Mode
        </label>
        <AutocompleteField
          id="paymentModeFilter"
          name="payment_mode"
          value={filters.payment_mode || ''}
          onChange={(e) => onFiltersChange({ payment_mode: e.target.value || null })}
          options={[{ label: 'All Modes', value: '' }, ...PAYMENT_MODES.map(m => ({ label: m, value: m }))]}
        />
      </div>
      <div>
        <label htmlFor="paymentNatureFilter" className="block text-sm font-medium text-dark-text mb-1">
          Nature
        </label>
        <AutocompleteField
          id="paymentNatureFilter"
          name="nature"
          value={filters.nature || ''}
          onChange={(e) => onFiltersChange({ nature: e.target.value || null })}
          options={[
            { label: 'All', value: '' },
            { label: 'Rental', value: 'rental' },
            { label: 'Deposit', value: 'deposit' },
          ]}
        />
      </div>
      <div>
        <label htmlFor="paymentAmountFilter" className="block text-sm font-medium text-dark-text mb-1">
          Amount
        </label>
        <div className="flex space-x-2">
          <AutocompleteField
            id="paymentAmountOp"
            name="amount_op"
            value={filters.amount_op || ''}
            onChange={e => onFiltersChange({ amount_op: e.target.value || null })}
            options={AMOUNT_OPERATORS}
          />
          <NumberField
            id="paymentAmount"
            name="amount"
            value={filters.amount || ''}
            onChange={e => onFiltersChange({ amount: e.target.value || null })}
            className="w-28"
          />
        </div>
      </div>
      <div>
        <label htmlFor="paymentStartDate" className="block text-sm font-medium text-dark-text mb-1">
          From
        </label>
        <DatePickerField
          name="start_date"
          value={filters.start_date || ''}
          onChange={(e) => onFiltersChange({ start_date: e.target.value || null })}
        />
      </div>
      <div>
        <label htmlFor="paymentEndDate" className="block text-sm font-medium text-dark-text mb-1">
          To
        </label>
        <DatePickerField
          name="end_date"
          value={filters.end_date || ''}
          onChange={(e) => onFiltersChange({ end_date: e.target.value || null })}
        />
      </div>
    </div>
  </div>
);

export default PaymentFilterBar;
