import React, { useState } from 'react';
import { Customer } from '../types';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { useCrud } from '../context/CrudContext';
import ConfirmationModal from './ui/ConfirmationModal'; // Import ConfirmationModal
import { useCustomers } from '../context/CustomerContext';


interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
  onEdit: (customer: Customer) => void; // Callback for edit
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick, onEdit }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshData } = useCustomers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }).format(date);
    } catch (e) { return dateString; }
  };

  const hasShippingInfo = customer.shipping_address || customer.shipping_city || customer.shipping_state;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent card click if menu button or its children are clicked
    if ((e.target as HTMLElement).closest('.customer-card-menu-button')) {
      return;
    }
    if (onClick) onClick(customer);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onEdit(customer);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsConfirmModalOpen(true);
    setIsMenuOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem('customers', customer.customer_id);
      refreshData(); // Refresh list after deletion
    } catch (error) {
      console.error("Failed to delete customer:", error);
      // Error handling can be enhanced, e.g., show a notification
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
            <div className="flex items-center min-w-0"> {/* Added min-w-0 for better truncation */}
              <div className="bg-brand-blue/10 text-brand-blue p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-dark-text truncate">
                {customer.full_name || 'Unnamed Customer'}
              </h3>
            </div>
            
            {/* Actions Menu */}
            <div className="relative customer-card-menu-button">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 text-dark-text/60 hover:text-dark-text rounded-full hover:bg-light-gray-100"
                aria-label="Actions"
              >
                <MoreVertical size={20} />
              </button>
              {isMenuOpen && (
                <div 
                    className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-light-gray-200"
                    onClick={(e) => e.stopPropagation()} // Prevent menu close on item click if not desired
                >
                  <button
                    onClick={handleEdit}
                    disabled={crudLoading}
                    className="w-full text-left px-4 py-2 text-sm text-dark-text hover:bg-light-gray-50 flex items-center disabled:opacity-50"
                  >
                    <Edit3 size={16} className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={crudLoading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                  >
                    {crudLoading && isConfirmModalOpen ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
                     Delete
                  </button>
                </div>
              )}
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
