import React, { useState } from 'react';
import { RentalTransaction } from '../../types';
import { CalendarCheck2, User, Edit3, Trash2, Loader2, FileText, IndianRupee, Tag, CalendarClock, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { formatDate, formatCurrency } from '../../utils/formatting';

interface RentalTransactionCardProps {
  rental: RentalTransaction; // This will now include customer_name and payment_term_name
  onEdit: (rental: RentalTransaction) => void;
  // onClick?: (rental: RentalTransaction) => void; // For detail view
}

const RentalTransactionCard: React.FC<RentalTransactionCardProps> = ({ rental, onEdit /*, onClick*/ }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshRentalTransactions } = useRentalTransactions();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(rental);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem('rental_transactions', rental.rental_id);
      refreshRentalTransactions();
    } catch (error) {
      console.error("Failed to delete rental transaction:", error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.rental-card-menu-button')) {
      return;
    }
    // if (onClick) onClick(rental); // For detail view
    console.log("Rental card clicked:", rental.rental_id);
  };

  const getStatusChip = (status: string | null) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-700';
    let IconComponent = Clock;

    switch (status?.toLowerCase()) {
      case 'pending confirmation':
      case 'draft':
        bgColor = 'bg-yellow-100'; textColor = 'text-yellow-700'; IconComponent = Clock; break;
      case 'confirmed/booked':
        bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; IconComponent = CalendarCheck2; break;
      case 'active/rented out':
        bgColor = 'bg-green-100'; textColor = 'text-green-700'; IconComponent = CheckCircle; break;
      case 'returned/completed':
        bgColor = 'bg-teal-100'; textColor = 'text-teal-700'; IconComponent = CheckCircle; break;
      case 'overdue':
        bgColor = 'bg-orange-100'; textColor = 'text-orange-700'; IconComponent = AlertTriangle; break;
      case 'cancelled':
        bgColor = 'bg-red-100'; textColor = 'text-red-700'; IconComponent = XCircle; break;
      default:
        IconComponent = FileText;
    }
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor} inline-flex items-center`}>
        <IconComponent size={14} className="mr-1.5" />
        {status || 'Unknown'}
      </span>
    );
  };


  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-light-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer relative flex flex-col justify-between h-full"
        onClick={handleCardClick}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center min-w-0">
              <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-full mr-3 flex-shrink-0">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-md font-semibold text-dark-text truncate" title={`Rental ID: ${rental.rental_id}`}>
                Rental ID: {rental.rental_id}
              </h3>
            </div>
            <div className="flex space-x-2 rental-card-menu-button">
              <button
                onClick={handleEdit}
                disabled={crudLoading}
                className="p-1 text-dark-text/60 hover:text-brand-blue rounded-full hover:bg-light-gray-100 disabled:opacity-50"
                aria-label="Edit Rental"
              >
                <Edit3 size={20} />
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={crudLoading}
                className="p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-light-gray-100 disabled:opacity-50"
                aria-label="Delete Rental"
              >
                {crudLoading && isConfirmModalOpen ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-dark-text/90">
            {rental.customer_name && (
              <div className="flex items-center" title={`Customer: ${rental.customer_name}`}>
                <User size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                <span className="truncate font-medium">{rental.customer_name}</span>
              </div>
            )}
            <div className="flex items-center" title={`Rental Date: ${formatDate(rental.rental_date)}`}>
              <CalendarClock size={14} className="mr-2 text-gray-500 flex-shrink-0" />
              <span>Rented: {formatDate(rental.rental_date)}</span>
            </div>
            {rental.expected_return_date && (
              <div className="flex items-center" title={`Expected Return: ${formatDate(rental.expected_return_date)}`}>
                <CalendarClock size={14} className="mr-2 text-orange-500 flex-shrink-0" />
                <span>Return By: {formatDate(rental.expected_return_date)}</span>
              </div>
            )}
             {rental.actual_return_date && (
              <div className="flex items-center" title={`Actual Return: ${formatDate(rental.actual_return_date)}`}>
                <CalendarCheck2 size={14} className="mr-2 text-green-500 flex-shrink-0" />
                <span>Returned: {formatDate(rental.actual_return_date)}</span>
              </div>
            )}
            {(rental.total_amount !== null && rental.total_amount !== undefined) && (
              <div className="flex items-center" title={`Total Amount: ${formatCurrency(rental.total_amount)}`}>
                <IndianRupee size={14} className="mr-2 text-green-600 flex-shrink-0" />
                <span className="font-medium text-green-700">{formatCurrency(rental.total_amount)}</span>
              </div>
            )}
            {/* Corrected to use rental.payment_term_name */}
            {rental.payment_term_name && (
                 <div className="flex items-center" title={`Payment Term: ${rental.payment_term_name}`}>
                    <Tag size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">Term: {rental.payment_term_name}</span>
                </div>
            )}
             {rental.notes && (
                 <div className="flex items-start" title={`Notes: ${rental.notes}`}>
                    <FileText size={14} className="mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-dark-text/80 line-clamp-2">{rental.notes}</p>
                </div>
            )}
          </div>
        </div>
        <div className="p-4 mt-auto border-t border-light-gray-100">
          {getStatusChip(rental.status)}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Rental Transaction"
        message={`Are you sure you want to delete rental transaction ID ${rental.rental_id}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default RentalTransactionCard;
