import React from 'react';
import SearchBox from '../ui/SearchBox';
import OutlinedTextField from '../ui/OutlinedTextField';
import { PaymentFilters } from '../../context/PaymentContext';

interface PaymentFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: PaymentFilters;
  onFiltersChange: (update: Partial<PaymentFilters>) => void;
}

const PAYMENT_MODES = ['Cash', 'NEFT/RTGS', 'IMPS', 'Credit Card', 'Debit Card', 'Others'];

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
        <select
          id="paymentModeFilter"
          name="payment_mode"
          value={filters.payment_mode || 'all'}
          onChange={(e) => onFiltersChange({ payment_mode: e.target.value === 'all' ? null : e.target.value })}
          className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
        >
          <option value="all">All Modes</option>
          {PAYMENT_MODES.map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="paymentNatureFilter" className="block text-sm font-medium text-dark-text mb-1">
          Nature
        </label>
        <select
          id="paymentNatureFilter"
          name="nature"
          value={filters.nature || 'all'}
          onChange={(e) => onFiltersChange({ nature: e.target.value === 'all' ? null : e.target.value })}
          className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
        >
          <option value="all">All</option>
          <option value="rental">Rental</option>
          <option value="deposit">Deposit</option>
        </select>
      </div>
    </div>
  </div>
);

export default PaymentFilterBar;
