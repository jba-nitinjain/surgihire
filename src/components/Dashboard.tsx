import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Menu, X, Users, Package, Calendar as CalendarIcon, Settings, IndianRupee, Wrench
} from 'lucide-react'; // Renamed Calendar to CalendarIcon to avoid conflict

// Import context hooks
import { useCustomers } from '../context/CustomerContext';
import { useEquipment } from '../context/EquipmentContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext';
import { usePaymentPlans } from '../context/PaymentPlanContext';
import { useMaintenanceRecords } from '../context/MaintenanceRecordContext';
import { useRentalTransactions } from '../context/RentalTransactionContext'; // Import new context hook
import { usePayments } from '../context/PaymentContext';

// Import Tab components
import CustomerTab from './dashboard/CustomerTab';
import EquipmentTab from './dashboard/EquipmentTab';
import MastersTab from './dashboard/MastersTab';
import MaintenanceTab from './dashboard/MaintenanceTab';
import RentalsTab from './dashboard/RentalsTab'; // Import new tab component
import PaymentsTab from './dashboard/PaymentsTab';
import Footer from './Footer';
import { Outlet, useNavigate, useLocation, useMatch } from 'react-router-dom';

interface DashboardProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('customers');

  const { refreshData: refreshCustomerData, loading: customersLoading } = useCustomers();
  const { refreshEquipmentData, loading: equipmentLoading } = useEquipment();
  const { refreshCategories: refreshEqCategories, loading: eqCategoriesLoading } = useEquipmentCategories();
  const { refreshPaymentPlans, loading: ppLoading } = usePaymentPlans();
  const { refreshMaintenanceRecords, loading: maintenanceLoading } = useMaintenanceRecords();
  const { refreshRentalTransactions, loading: rentalsLoading } = useRentalTransactions(); // Add rentals refresh and loading
  const { refreshPayments, loading: paymentsLoading } = usePayments();

  const mainTabs = [
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'equipment', label: 'Equipment', icon: <Package size={18} /> },
    { id: 'rentals', label: 'Rentals', icon: <CalendarIcon size={18} /> }, // Use CalendarIcon
    { id: 'payments', label: 'Payments', icon: <IndianRupee size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
    { id: 'masters', label: 'Masters', icon: <Settings size={18} /> },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRefreshData = () => {
    switch (activeTab) {
      case 'customers': refreshCustomerData(); break;
      case 'equipment': refreshEquipmentData(); break;
      case 'rentals': refreshRentalTransactions(); break; // Add refresh for rentals
      case 'payments': refreshPayments(); break;
      case 'masters':
        refreshEqCategories();
        refreshPaymentPlans();
        break;
      case 'maintenance': refreshMaintenanceRecords(); break;
      default: break;
    }
  };

  const isLoading = () => {
    if (activeTab === 'customers') return customersLoading;
    if (activeTab === 'equipment') return equipmentLoading;
    if (activeTab === 'rentals') return rentalsLoading; // Add loading for rentals
    if (activeTab === 'payments') return paymentsLoading;
    if (activeTab === 'masters') return eqCategoriesLoading || ppLoading;
    if (activeTab === 'maintenance') return maintenanceLoading;
    return false;
  };

  // Determine if we are on a base path (list view) for each tab
  const isCustomersBase = useMatch({ path: '/customers', end: true });
  const isEquipmentBase = useMatch({ path: '/equipment', end: true });
  const isRentalsBase = useMatch({ path: '/rentals', end: true });
  const isMaintenanceBase = useMatch({ path: '/maintenance', end: true });
  const isMastersEqCatBase = useMatch({ path: '/masters/equipment-categories', end: true });
  const isMastersPayPlanBase = useMatch({ path: '/masters/payment-plans', end: true });
  const isPaymentsBase = useMatch({ path: '/payments', end: true });

  const handleNavigateToEquipmentDetail = (equipmentId: number) => {
    navigate(`/equipment/${equipmentId}`);
  };

  const handleViewMaintenanceForEquipment = (equipmentId: string) => {
    navigate('/maintenance', { state: { equipmentId, from: location.pathname } });
  };

  const handleViewRentalsForCustomer = (customerId: string) => {
    navigate('/rentals', { state: { customerId, from: location.pathname } });
  };

  useEffect(() => {
    if (location.pathname.startsWith('/equipment')) setActiveTab('equipment');
    else if (location.pathname.startsWith('/rentals')) setActiveTab('rentals');
    else if (location.pathname.startsWith('/maintenance')) setActiveTab('maintenance');
    else if (location.pathname.startsWith('/masters')) setActiveTab('masters');
    else if (location.pathname.startsWith('/payments')) setActiveTab('payments');
    else setActiveTab('customers');
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white-50 flex">
      {sidebarOpen && <div className="sidebar-overlay md:hidden" onClick={toggleSidebar}></div>}
      <div className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src="https://static.wixstatic.com/media/0293d4_78d06b6cb5314f6f9ac929a24bad8e46~mv2.png/v1/fill/w_246,h_123,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/SURGIHIRE%20LOGO.png" alt="SurgiHire Logo" className="h-8 w-auto mr-3"/>
          </div>
          <button className="text-gray-500 hover:text-gray-700 md:hidden" onClick={toggleSidebar}><X size={24} /></button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {mainTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    const paths: Record<string, string> = {
                      customers: '/customers',
                      equipment: '/equipment',
                      rentals: '/rentals',
                      maintenance: '/maintenance',
                      masters: '/masters/equipment-categories',
                      payments: '/payments',
                    };
                    navigate(paths[tab.id] || '/');

                    switch (tab.id) {
                      case 'customers':
                        refreshCustomerData();
                        break;
                      case 'equipment':
                        refreshEquipmentData();
                        break;
                      case 'rentals':
                        refreshRentalTransactions();
                        break;
                      case 'payments':
                        refreshPayments();
                        break;
                      case 'masters':
                        refreshEqCategories();
                        refreshPaymentPlans();
                        break;
                      case 'maintenance':
                        refreshMaintenanceRecords();
                        break;
                      default:
                        break;
                    }

                    if (sidebarOpen && window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${activeTab === tab.id ? 'bg-brand-blue text-white shadow-sm' : 'text-dark-text hover:bg-light-gray-100'}`}
                >
                  <span className="mr-3">{tab.icon}</span>{tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-light-gray-200">
          <button onClick={handleRefreshData} disabled={isLoading()} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-green hover:bg-brand-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 transition-colors">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading() ? 'animate-spin' : ''}`} />Refresh Data
          </button>
        </div>
      </div>

      <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''} p-4 md:p-6 flex flex-col`}>
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="text-dark-text mr-4 p-2 -ml-2 md:hidden" onClick={toggleSidebar} aria-label="Toggle sidebar"><Menu size={24} /></button>
              <h1 className="text-2xl font-bold text-dark-text">
                {mainTabs.find(tab => tab.id === activeTab)?.label}
              </h1>
            </div>
          </div>
        </header>

        <div className="flex-grow">
          {(() => {
            if (activeTab === 'customers' && isCustomersBase) {
              return (
                <CustomerTab onViewRentalsForCustomer={handleViewRentalsForCustomer} />
              );
            }
            if (activeTab === 'equipment' && isEquipmentBase) {
              return (
                <EquipmentTab onViewMaintenanceForEquipment={handleViewMaintenanceForEquipment} />
              );
            }
            if (activeTab === 'rentals' && isRentalsBase) {
              return <RentalsTab />;
            }
            if (activeTab === 'masters' && (isMastersEqCatBase || isMastersPayPlanBase)) {
              return <MastersTab />;
            }
            if (activeTab === 'maintenance' && isMaintenanceBase) {
              return (
                <MaintenanceTab navigateToEquipmentDetail={handleNavigateToEquipmentDetail} />
              );
            }
            if (activeTab === 'payments' && isPaymentsBase) {
              return <PaymentsTab />;
            }
            return <Outlet />;
          })()}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
