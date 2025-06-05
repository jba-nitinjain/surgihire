import React, { useState, useEffect } from 'react';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import RentalTransactionList from '../rentals/RentalTransactionList';
// import RentalTransactionDetail from '../rentals/RentalTransactionDetail'; // Keep commented if not yet implemented
import SearchBox from '../ui/SearchBox';
import { PlusCircle, ArrowLeft } from 'lucide-react'; // Unused icons like Filter, CalendarIcon removed
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { RentalTransaction } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';

// Define rental statuses for filter dropdown
const RENTAL_STATUSES = ["Draft", "Pending Confirmation", "Confirmed/Booked", "Active/Rented Out", "Returned/Completed", "Overdue", "Cancelled"];


const RentalsTab: React.FC = () => {
  const {
    searchQuery,
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
        <Button
          onClick={() => navigate(fromPath)}
          startIcon={<ArrowLeft className="h-4 w-4" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      )}
      {/* Filter UI */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="rentalSearch" className="block text-sm font-medium text-dark-text mb-1">
              Search Rentals
            </label>
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by notes, customer..."
            />
          </div>
          <div>
            <label htmlFor="rentalStatusFilter" className="block text-sm font-medium text-dark-text mb-1">
              Status
            </label>
            <select
              id="rentalStatusFilter"
              name="status"
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? null : e.target.value })}
              className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
            >
              <option value="all">All Statuses</option>
              {RENTAL_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rentalCustomerFilter" className="block text-sm font-medium text-dark-text mb-1">
              Customer
            </label>
            <select
              id="rentalCustomerFilter"
              name="customer_id"
              value={filters.customer_id || 'all'}
              onChange={(e) => setFilters({ ...filters, customer_id: e.target.value === 'all' ? null : e.target.value })}
              disabled={loadingCustomers}
              className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
            >
              <option value="all">{loadingCustomers ? "Loading Customers..." : "All Customers"}</option>
              {!loadingCustomers && customersForFilter.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name} (ID: {customer.customer_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="flex flex-col items-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenRentalFormForCreate}
            startIcon={<PlusCircle className="h-5 w-5" />}
          >
            New Rental Transaction
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Start a new rental
          </Typography>
        </div>
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
