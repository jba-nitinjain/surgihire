import React from 'react';
import { Customer } from '../types';
import {
  User, Mail, Phone, MapPin, Calendar, X,
  ArrowLeft, Edit3
} from 'lucide-react';
import { formatDate } from '../utils/formatting'; // Import formatDate utility

interface CustomerDetailProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose, onEdit }) => {
  if (!customer) {
    return null;
  }

  // formatDate is now imported, with options for more detailed time
  const formatDateWithTime = (dateString: string) => {
    return formatDate(dateString, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };


  const handleEditClick = () => {
    onEdit(customer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-lg bg-light-gray-50 h-full overflow-y-auto animate-slide-in-right shadow-2xl">
        <div className="sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-light-gray-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-dark-text" />
            </button>
            <h2 className="text-xl font-semibold text-brand-blue">Customer Details</h2>
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleEditClick}
                    className="p-2 rounded-full hover:bg-light-gray-100 text-brand-blue"
                    aria-label="Edit Customer"
                >
                    <Edit3 className="h-5 w-5" />
                </button>
                 <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-light-gray-100"
                    aria-label="Close"
                >
                    <X className="h-5 w-5 text-dark-text" />
                </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue/90 rounded-lg p-6 text-white mb-6 shadow">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <User className="h-8 w-8 text-brand-blue" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{customer.full_name || 'Unnamed Customer'}</h3>
                <p className="text-white/80">ID: {customer.customer_id}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
                Contact Information
              </h4>
              <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-light-gray-200">
                  {customer.email && (
                    <div className="flex p-4 items-start">
                      <Mail className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Email</p>
                        <p className="text-sm text-dark-text break-all">{customer.email}</p>
                      </div>
                    </div>
                  )}

                  {customer.mobile_number_1 && (
                    <div className="flex p-4 items-start">
                      <Phone className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Primary Phone</p>
                        <p className="text-sm text-dark-text">{customer.mobile_number_1}</p>
                      </div>
                    </div>
                  )}

                  {customer.mobile_number_2 && (
                    <div className="flex p-4 items-start">
                      <Phone className="h-5 w-5 text-dark-text/70 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Secondary Phone</p>
                        <p className="text-sm text-dark-text">{customer.mobile_number_2}</p>
                      </div>
                    </div>
                  )}

                  {customer.mobile_number_3 && (
                    <div className="flex p-4 items-start">
                      <Phone className="h-5 w-5 text-dark-text/70 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-dark-text/60 mb-0.5">Additional Phone</p>
                        <p className="text-sm text-dark-text">{customer.mobile_number_3}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
                Shipping Information
              </h4>
              <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
                 {customer.shipping_address || customer.shipping_area || customer.shipping_city || customer.shipping_state || customer.shipping_pincode ? (
                    <div className="divide-y divide-light-gray-200">
                        {customer.shipping_address && (
                            <div className="flex p-4 items-start">
                            <MapPin className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-dark-text/60 mb-0.5">Address</p>
                                <p className="text-sm text-dark-text">{customer.shipping_address}</p>
                            </div>
                            </div>
                        )}

                        {(customer.shipping_area || customer.shipping_city || customer.shipping_state || customer.shipping_pincode) && (
                            <div className="flex p-4 items-start">
                                <MapPin className="h-5 w-5 text-dark-text/70 mr-3 mt-1 flex-shrink-0 invisible md:visible" /> {/* Placeholder for alignment */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 w-full">
                                {customer.shipping_area && (
                                    <div>
                                    <p className="text-xs text-dark-text/60 mb-0.5">Area</p>
                                    <p className="text-sm text-dark-text">{customer.shipping_area}</p>
                                    </div>
                                )}
                                {customer.shipping_city && (
                                    <div>
                                    <p className="text-xs text-dark-text/60 mb-0.5">City</p>
                                    <p className="text-sm text-dark-text">{customer.shipping_city}</p>
                                    </div>
                                )}
                                {customer.shipping_state && (
                                    <div>
                                    <p className="text-xs text-dark-text/60 mb-0.5">State</p>
                                    <p className="text-sm text-dark-text">{customer.shipping_state}</p>
                                    </div>
                                )}
                                {customer.shipping_pincode && (
                                    <div>
                                    <p className="text-xs text-dark-text/60 mb-0.5">Pincode</p>
                                    <p className="text-sm text-dark-text">{customer.shipping_pincode}</p>
                                    </div>
                                )}
                                </div>
                            </div>
                        )}
                    </div>
                 ) : (
                    <p className="p-4 text-sm text-dark-text/70">No shipping information provided.</p>
                 )}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
                Account Information
              </h4>
              <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 flex items-start">
                  <Calendar className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-dark-text/60 mb-0.5">Registration Date</p>
                    <p className="text-sm text-dark-text">
                      {formatDateWithTime(customer.registration_date)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
