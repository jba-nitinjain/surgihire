import React, { useState, useEffect } from 'react';
import { RentalTransaction } from '../../types';
import { CalendarCheck2, User, Edit3, Trash2, Loader2, FileText, IndianRupee, Tag, CalendarClock, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { formatDate, formatCurrency } from '../../utils/formatting';
import { fetchRentalDetailsByRentalId } from '../../services/api/rentals';
import { useNavigate, useLocation } from 'react-router-dom';

interface RentalTransactionCardProps {
  rental: RentalTransaction; // This will now include customer_name and payment_term_name
  onEdit: (rental: RentalTransaction) => void;
  // onClick?: (rental: RentalTransaction) => void; // For detail view
}

const RentalTransactionCard: React.FC<RentalTransactionCardProps> = ({ rental, onEdit /*, onClick*/ }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshRentalTransactions } = useRentalTransactions();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [items, setItems] = useState(rental.rental_items || []);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!rental.rental_items || rental.rental_items.some(it => !('equipment_name' in it))) {
      fetchRentalDetailsByRentalId(rental.rental_id, { records: 20, skip: 0 }).then(res => {
        if (res.success && Array.isArray(res.data)) {
          setItems(res.data as any);
        }
      });
    } else {
      setItems(rental.rental_items);
    }
  }, [rental]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(rental);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmModalOpen(true);
  };

  const handleRecordPayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/payments/new', {
      state: { payment: { rental_id: rental.rental_id }, from: location.pathname },
    });
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
            <div className="flex space-x-1 rental-card-menu-button">
              <IconButton onClick={handleEdit} disabled={crudLoading} size="small" color="primary">
                <Edit3 size={20} />
              </IconButton>
              <IconButton onClick={handleDeleteClick} disabled={crudLoading} size="small" color="error">
                {crudLoading && isConfirmModalOpen ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              </IconButton>
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
            {items.length > 0 && (
                <div>
                  <div className="font-semibold text-xs mt-2">Items:</div>
                  <ul className="list-disc ml-5 space-y-1">
                    {items.map(it => (
                      <li key={it.rental_detail_id} className="text-xs">
                        {it.equipment_name || `ID: ${it.equipment_id}`}
                        {it.rental_rate !== undefined && it.rental_rate !== null && (
                          <> - {formatCurrency(it.rental_rate)}/day</>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              {rental.total_amount !== null && (
                <div>Total Due: {formatCurrency(rental.total_amount)}</div>
              )}
              {rental.total_receipt !== null && (
                <div>Received: {formatCurrency(rental.total_receipt)}</div>
              )}
              {rental.deposit !== null && (
                <div>Deposit: {formatCurrency(rental.deposit)}</div>
              )}
              {rental.balance !== null && (
                <div>Balance: {formatCurrency(rental.balance)}</div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 mt-auto border-t border-light-gray-100 flex justify-between items-center">
          {getStatusChip(rental.status)}
          <Button onClick={handleRecordPayment} size="small" color="primary" className="rental-card-menu-button" sx={{ textTransform: 'none' }}>
            Record Payment
          </Button>
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
