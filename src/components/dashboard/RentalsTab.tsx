import React, { useState, useEffect } from 'react';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import RentalTransactionList from '../rentals/RentalTransactionList';
// import RentalTransactionDetail from '../rentals/RentalTransactionDetail'; // Keep commented if not yet implemented
import { PlusCircle, ArrowLeft } from 'lucide-react'; // Unused icons like Filter, CalendarIcon removed
import Button from '@mui/material/Button';
import AutocompleteField from '../ui/AutocompleteField';
import DatePickerField from '../ui/DatePickerField';
import { RentalTransaction } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';

// Define rental statuses for filter dropdown
const RENTAL_STATUSES = ["Draft", "Pending Confirmation", "Confirmed/Booked", "Active/Rented Out", "Returned/Completed", "Overdue", "Cancelled"];


const RentalsTab: React.FC = () => {
  const {
    setSearchQuery,
    refreshRentalTransactions,
    filters,
    setFilters,
    customersForFilter,
    loadingCustomers,
    fetchCustomersForSelection,
  } = useRentalTransactions();

  const navigate = useNavigate();
  const [fromPath, setFromPath] = useState<string | null>(null);
  // const [selectedRental, setSelectedRental] = useState<RentalTransaction | null>(null); // For detail view

  useEffect(() => {
    if (customersForFilter.length === 0 && !loadingCustomers) {
      fetchCustomersForSelection();
    }
  }, [customersForFilter.length, loadingCustomers, fetchCustomersForSelection]);

  const location = useLocation() as { state?: { customerId?: string; from?: string } };

  useEffect(() => {
    if (location.state?.customerId) {
      setFilters({ customer_id: location.state.customerId, status: null });
      setSearchQuery('');
      setFromPath(location.state.from || null);
      navigate('/rentals', { replace: true });
    }
  }, [location.state, setFilters, setSearchQuery, navigate]);


  const handleOpenRentalFormForCreate = () => {
    navigate('/rentals/new');
  };

  const handleOpenRentalFormForEdit = (rental: RentalTransaction) => {
    navigate(`/rentals/${rental.rental_id}/edit`, { state: { rental } });
  };

  // const handleSelectRentalForDetail = (rental: RentalTransaction) => {
  //   setSelectedRental(rental);
  //   setIsRentalFormOpen(false);
  //   setEditingRental(null);
  // };

  // const handleCloseRentalDetail = () => {
  //   setSelectedRental(null);
  // };

  return (
    <>
      {fromPath && (
        <button
          onClick={() => navigate(fromPath)}
          className="mb-4 flex items-center text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
      )}
      {/* Filter UI */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="rentalStatusFilter" className="block text-sm font-medium text-dark-text mb-1">
              Status
            </label>
            <AutocompleteField
              id="rentalStatusFilter"
              name="status"
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? null : e.target.value })}
              options={[{ label: 'All Statuses', value: 'all' }, ...RENTAL_STATUSES.map(s => ({ label: s, value: s }))]}
            />
          </div>
          <div>
            <label htmlFor="rentalCustomerFilter" className="block text-sm font-medium text-dark-text mb-1">
              Customer
            </label>
            <AutocompleteField
              id="rentalCustomerFilter"
              name="customer_id"
              value={filters.customer_id || 'all'}
              onChange={(e) => setFilters({ ...filters, customer_id: e.target.value === 'all' ? null : e.target.value })}
              disabled={loadingCustomers}
              options={[
                { label: loadingCustomers ? 'Loading Customers...' : 'All Customers', value: 'all' },
                ...(!loadingCustomers ? customersForFilter.map(c => ({ label: `${c.full_name} (ID: ${c.customer_id})`, value: c.customer_id })) : [])
              ]}
            />
          </div>
          <div>
            <label htmlFor="rentalDateFilter" className="block text-sm font-medium text-dark-text mb-1">
              Rented Date
            </label>
            <DatePickerField
              name="rental_date"
              value={filters.rental_date || ''}
              onChange={(e) => setFilters({ ...filters, rental_date: e.target.value || null })}
            />
          </div>
          <div>
            <label htmlFor="returnDateFilter" className="block text-sm font-medium text-dark-text mb-1">
              Return Date
            </label>
            <DatePickerField
              name="return_date"
              value={filters.return_date || ''}
              onChange={(e) => setFilters({ ...filters, return_date: e.target.value || null })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          variant="outlined"
          onClick={() =>
            setFilters({ status: null, customer_id: null, rental_date: null, return_date: null })
          }
          sx={{ textTransform: 'none' }}
        >
          Reset Filters
        </Button>
      </div>

      <div className="mb-6 flex justify-end">
        <Button variant="contained" color="primary" onClick={handleOpenRentalFormForCreate} startIcon={<PlusCircle className="h-5 w-5" />} sx={{ textTransform: 'none' }}>
          New Rental Transaction
        </Button>
      </div>

      {/* This is the crucial part: RentalTransactionList should only receive props it expects. */}
      {/* The error message indicates line 142, which is likely where this component is invoked if the file is longer. */}
      {/* Assuming this is the only invocation of RentalTransactionList in this file. */}
      <RentalTransactionList
        onEditRental={handleOpenRentalFormForEdit}
        // onViewRentalDetail={handleSelectRentalForDetail} // If you implement a detail view
      />

      {/* Detail view component can be added here if needed */}
    </>
  );
};

export default RentalsTab;
