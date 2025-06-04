import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Menu, X, Users, Package, Calendar, Settings, Tag, ListChecks, IndianRupee, Wrench
} from 'lucide-react';

// Import context hooks for global actions or data needed at dashboard level (if any)
import { useCustomers } from '../context/CustomerContext';
import { useEquipment } from '../context/EquipmentContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext';
import { usePaymentPlans } from '../context/PaymentPlanContext';
import { useMaintenanceRecords } from '../context/MaintenanceRecordContext';

// Import Tab components
import CustomerTab from './dashboard/CustomerTab';
import EquipmentTab from './dashboard/EquipmentTab';
import MastersTab from './dashboard/MastersTab';
import MaintenanceTab from './dashboard/MaintenanceTab';

interface DashboardProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarOpen, setSidebarOpen }) => {
  // --- Global State (Managed by Dashboard) ---
  const [activeTab, setActiveTab] = useState('customers');
  // This state is for navigating TO the maintenance tab with a specific equipment filter
  const [initialMaintenanceEquipmentId, setInitialMaintenanceEquipmentId] = useState<string | null>(null);


  // --- Context Hooks (for refresh and loading states) ---
  const { refreshData: refreshCustomerData, loading: customersLoading } = useCustomers();
  const { refreshEquipmentData, loading: equipmentLoading } = useEquipment();
  const { refreshCategories: refreshEqCategories, loading: eqCategoriesLoading } = useEquipmentCategories();
  const { refreshPaymentPlans, loading: ppLoading } = usePaymentPlans();
  const { refreshMaintenanceRecords, loading: maintenanceLoading } = useMaintenanceRecords();


  const mainTabs = [
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'equipment', label: 'Equipment', icon: <Package size={18} /> },
    { id: 'rentals', label: 'Rentals', icon: <Calendar size={18} /> },
    { id: 'payments', label: 'Payments', icon: <IndianRupee size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
    { id: 'masters', label: 'Masters', icon: <Settings size={18} /> },
  ];


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRefreshData = () => {
    switch (activeTab) {
      case 'customers': refreshCustomerData(); break;
      case 'equipment': refreshEquipmentData(); break;
      case 'masters': // MastersTab will handle its own sub-tab refresh
        refreshEqCategories(); // Example: or trigger a refresh method from MastersTab if it manages sub-refreshes
        refreshPaymentPlans();
        break;
      case 'maintenance': refreshMaintenanceRecords(); break;
      default: break;
    }
  };

  const isLoading = () => {
    if (activeTab === 'customers') return customersLoading;
    if (activeTab === 'equipment') return equipmentLoading;
    if (activeTab === 'masters') return eqCategoriesLoading || ppLoading;
    if (activeTab === 'maintenance') return maintenanceLoading;
    return false;
  };

  // Handler for navigating to maintenance tab for a specific equipment
  const handleViewMaintenanceForEquipment = (equipmentId: string) => {
    setInitialMaintenanceEquipmentId(equipmentId);
    setActiveTab('maintenance');
  };

  // Effect to clear initialMaintenanceEquipmentId after navigating to maintenance tab
  // to ensure it's only applied once.
  useEffect(() => {
    if (activeTab !== 'maintenance' && initialMaintenanceEquipmentId) {
      setInitialMaintenanceEquipmentId(null);
    }
  }, [activeTab, initialMaintenanceEquipmentId]);


  return (
    <div className="min-h-screen bg-light-gray-50 flex">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay md:hidden" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
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
                    setActiveTab(tab.id);
                    if (tab.id !== 'maintenance') { // Clear specific filter if navigating away from maintenance
                        setInitialMaintenanceEquipmentId(null);
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

      {/* Main Content Area */}
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
          {activeTab === 'customers' && (
            <CustomerTab />
          )}
          {activeTab === 'equipment' && (
            // Pass the navigation handler to EquipmentTab
            <EquipmentTab onViewMaintenanceForEquipment={handleViewMaintenanceForEquipment} />
          )}
          {activeTab === 'masters' && (
            <MastersTab />
          )}
           {activeTab === 'maintenance' && (
            <MaintenanceTab
              key={initialMaintenanceEquipmentId} // Re-mount tab if initial equipment ID changes
              initialEquipmentIdFilter={initialMaintenanceEquipmentId}
            />
          )}
          {activeTab === 'rentals' && <div className="text-center p-10 text-gray-500 bg-white rounded-lg shadow">Rentals module coming soon.</div>}
          {activeTab === 'payments' && <div className="text-center p-10 text-gray-500 bg-white rounded-lg shadow">Payments module coming soon.</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
