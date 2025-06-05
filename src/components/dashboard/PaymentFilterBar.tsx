import React from 'react';
import SearchBox from '../ui/SearchBox';
import OutlinedTextField from '../ui/OutlinedTextField';
import AutocompleteField from '../ui/AutocompleteField';
import { PaymentFilters } from '../../context/PaymentContext';

interface PaymentFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
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

const PaymentFilterBar: React.FC<PaymentFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}) => (
  <div className="mb-6 p-4 bg-white rounded-lg shadow">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="md:col-span-1">
        <label htmlFor="paymentSearch" className="block text-sm font-medium text-dark-text mb-1">
          Search Payments
        </label>
        <SearchBox value={searchQuery} onChange={onSearchChange} placeholder="Search payments..." />
      </div>
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
    </div>
  </div>
);

export default PaymentFilterBar;
