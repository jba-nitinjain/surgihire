import React, { useState } from 'react';
import { Customer } from '../types';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useCrud } from '../context/CrudContext';
import ConfirmationModal from './ui/ConfirmationModal';
import { useCustomers } from '../context/CustomerContext';
import { formatDate } from '../utils/formatting'; // Import formatDate utility

interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick, onEdit }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshData } = useCustomers();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // formatDate is now imported from utils

  const hasShippingInfo = customer.shipping_address || customer.shipping_city || customer.shipping_state;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.customer-card-menu-button')) {
      return;
    }
    if (onClick) onClick(customer);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(customer);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem('customers', customer.customer_id);
      refreshData();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };


  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-light-gray-200 overflow-hidden hover:shadow-md
                  transition-shadow duration-300 cursor-pointer relative"
        onClick={handleCardClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center min-w-0">
              <div className="bg-brand-blue/10 text-brand-blue p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-dark-text truncate">
                {customer.full_name || 'Unnamed Customer'}
              </h3>
            </div>

            <div className="flex space-x-2 customer-card-menu-button">
              <button
                onClick={handleEdit}
                disabled={crudLoading}
                className="p-1 text-dark-text/60 hover:text-brand-blue rounded-full hover:bg-light-gray-100 disabled:opacity-50"
                aria-label="Edit Customer"
              >
                <Edit3 size={20} />
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={crudLoading}
                className="p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-light-gray-100 disabled:opacity-50"
                aria-label="Delete Customer"
              >
                {crudLoading && isConfirmModalOpen ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center text-dark-text/80">
                <span className="text-xs font-medium text-brand-blue bg-light-gray-50 px-2 py-0.5 rounded-full">
                    ID: {customer.customer_id}
                </span>
            </div>

            {customer.email && (
              <div className="flex items-start">
                <Mail className="h-4 w-4 text-dark-text/70 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-dark-text break-all">{customer.email}</span>
              </div>
            )}

            {customer.mobile_number_1 && (
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-dark-text/70 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-dark-text">{customer.mobile_number_1}</span>
              </div>
            )}

            {hasShippingInfo && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-dark-text/70 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-dark-text truncate">
                  {[
                    customer.shipping_address,
                    customer.shipping_city,
                    customer.shipping_state,
                    customer.shipping_pincode
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            <div className="flex items-start">
              <Calendar className="h-4 w-4 text-dark-text/70 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-dark-text">
                Registered: {formatDate(customer.registration_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.full_name || 'this customer'}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default CustomerCard;
