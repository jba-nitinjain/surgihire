import React, { useState, useEffect } from 'react';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import RentalTransactionList from '../rentals/RentalTransactionList';
import RentalTransactionForm from '../rentals/RentalTransactionForm';
// import RentalTransactionDetail from '../rentals/RentalTransactionDetail'; // Keep commented if not yet implemented
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react'; // Unused icons like Filter, CalendarIcon removed
import { RentalTransaction } from '../../types'; // Unused Customer type import removed
import { getRental, fetchRentalDetailsByRentalId } from '../../services/api';

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

  const [isRentalFormOpen, setIsRentalFormOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalTransaction | null>(null);
  // const [selectedRental, setSelectedRental] = useState<RentalTransaction | null>(null); // For detail view

  useEffect(() => {
    if (customersForFilter.length === 0 && !loadingCustomers) {
      fetchCustomersForSelection();
    }
  }, [customersForFilter.length, loadingCustomers, fetchCustomersForSelection]);


  const handleOpenRentalFormForCreate = () => {
    setEditingRental(null);
    // setSelectedRental(null); // If using detail view
    setIsRentalFormOpen(true);
  };

  const handleOpenRentalFormForEdit = async (rental: RentalTransaction) => {
    try {
      // Fetch the full rental record including its rental_items
      const [rentalRes, detailsRes] = await Promise.all([
        getRental(rental.rental_id),
        fetchRentalDetailsByRentalId(rental.rental_id, { records: 100, skip: 0 })
      ]);

      let fullRental: RentalTransaction = rental;

      if (rentalRes.success && rentalRes.data) {
        fullRental = Array.isArray(rentalRes.data)
          ? (rentalRes.data[0] as RentalTransaction)
          : (rentalRes.data as RentalTransaction);
      }

      if (detailsRes.success && Array.isArray(detailsRes.data)) {
        fullRental = { ...fullRental, rental_items: detailsRes.data };
      }

      setEditingRental(fullRental);
    } catch (err) {
      console.error('Failed to fetch rental details', err);
      setEditingRental(rental);
    }
    // setSelectedRental(null); // If using detail view
    setIsRentalFormOpen(true);
  };

  const handleCloseRentalForm = () => {
    setIsRentalFormOpen(false);
    setEditingRental(null);
  };

  const handleSaveRentalForm = () => {
    handleCloseRentalForm();
    refreshRentalTransactions(); // Refresh the list after save
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
        <button
          onClick={handleOpenRentalFormForCreate}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />New Rental Transaction
        </button>
      </div>

      {/* This is the crucial part: RentalTransactionList should only receive props it expects. */}
      {/* The error message indicates line 142, which is likely where this component is invoked if the file is longer. */}
      {/* Assuming this is the only invocation of RentalTransactionList in this file. */}
      <RentalTransactionList
        onEditRental={handleOpenRentalFormForEdit}
        // onViewRentalDetail={handleSelectRentalForDetail} // If you implement a detail view
      />

      {/* RentalTransactionForm is rendered conditionally (e.g., as a modal) */}
      {isRentalFormOpen && (
        <RentalTransactionForm
          rental={editingRental}
          onSave={handleSaveRentalForm}
          onCancel={handleCloseRentalForm}
        />
      )}

      {/*
      // If you implement a detail view, it would be rendered conditionally here as well.
      {selectedRental && !isRentalFormOpen && (
        <RentalTransactionDetail
          rental={selectedRental}
          onClose={handleCloseRentalDetail}
          onEdit={() => handleOpenRentalFormForEdit(selectedRental)}
        />
      )}
      */}
    </>
  );
};

export default RentalsTab;
