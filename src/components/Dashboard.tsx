import React, { useState, useEffect } from 'react';
import { useCustomers } from '../context/CustomerContext';
import SearchBox from './ui/SearchBox'; // Keep if used directly in Dashboard for global search, otherwise remove
import { RefreshCw, Menu, X, Users, Package, Calendar, PlusCircle, Settings, Tag, ListChecks, IndianRupee, Wrench } from 'lucide-react';
import { Customer, Equipment, EquipmentCategory, PaymentPlan, MaintenanceRecord } from '../types';

// Import context hooks - these might still be needed for global actions or props passed to tabs
import { useCustomers } from '../context/CustomerContext';
import { useEquipment } from '../context/EquipmentContext';
import { useEquipmentCategories } from '../context/EquipmentCategoryContext';
import { usePaymentPlans } from '../context/PaymentPlanContext';
import { useMaintenanceRecords } from '../context/MaintenanceRecordContext';

// Import new Tab components
import CustomerTab from './dashboard/CustomerTab';
import EquipmentTab from './dashboard/EquipmentTab';
import MastersTab from './dashboard/MastersTab';
import MaintenanceTab from './dashboard/MaintenanceTab';

// Equipment statuses for filter dropdown (if still needed globally, otherwise move to EquipmentTab)
const equipmentStatusesForFilter = ['Available', 'Rented', 'Maintenance', 'Decommissioned', 'Lost'];
// Maintenance types for filter dropdown (if still needed globally, otherwise move to MaintenanceTab)
const maintenanceTypesForFilter = ['Routine', 'Repair', 'Inspection', 'Upgrade', 'Calibration', 'Emergency'];


interface DashboardProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarOpen, setSidebarOpen }) => {
  // Customer states
  const { searchQuery: customerSearchQuery, setSearchQuery: setCustomerSearchQuery, refreshData: refreshCustomerData, loading: customersLoading } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Equipment states
  const { 
    searchQuery: equipmentSearchQuery, 
    setSearchQuery: setEquipmentSearchQuery, 
    refreshEquipmentData, 
    loading: equipmentLoading,
    filters: equipmentFilters, 
    setFilters: setEquipmentFilters 
  } = useEquipment();
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null); // Added state for selected equipment

  // Equipment Category states (used for equipment filter dropdown)
  const { categories: allEquipmentCategories, loading: eqCategoriesLoadingForFilter, refreshCategories: refreshEqCategoriesForFilter, error: eqCategoriesFilterError } = useEquipmentCategories(); // Added error
  const { searchQuery: eqCategorySearchQuery, setSearchQuery: setEqCategorySearchQuery, refreshCategories: refreshEqCategories, loading: eqCategoriesLoading } = useEquipmentCategories(); // For master list
  const [isEqCategoryFormOpen, setIsEqCategoryFormOpen] = useState(false);
  const [editingEqCategory, setEditingEqCategory] = useState<EquipmentCategory | null>(null);

  // Payment Plan states
  const { searchQuery: ppSearchQuery, setSearchQuery: setPpSearchQuery, refreshPaymentPlans, loading: ppLoading } = usePaymentPlans();
  const [isPpFormOpen, setIsPpFormOpen] = useState(false);
  const [editingPp, setEditingPp] = useState<PaymentPlan | null>(null);

  // Maintenance Record states
  const {
    searchQuery: maintenanceSearchQuery,
    setSearchQuery: setMaintenanceSearchQuery,
    refreshMaintenanceRecords,
    loading: maintenanceLoading,
    filters: maintenanceFilters,
    setFilters: setMaintenanceFilters,
  } = useMaintenanceRecords();
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [editingMaintenanceRecord, setEditingMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [viewingMaintenanceForEquipment, setViewingMaintenanceForEquipment] = useState<string | null>(null);


  const [activeTab, setActiveTab] = useState('customers');
  const [activeMasterSubTab, setActiveMasterSubTab] = useState('equipment_categories'); // This will be managed within MastersTab
  const [activeMaintenanceSubTab, setActiveMaintenanceSubTab] = useState('list'); // This will be managed within MaintenanceTab

  // Fetch equipment categories for the filter dropdown when dashboard mounts
  // This logic might be moved to EquipmentTab if it's the only place using allEquipmentCategories for filters
  useEffect(() => {
    if (allEquipmentCategories.length === 0 && !eqCategoriesLoadingForFilter && !eqCategoriesFilterError) {
      refreshEqCategoriesForFilter();
    }
  }, [allEquipmentCategories.length, eqCategoriesLoadingForFilter, refreshEqCategoriesForFilter, eqCategoriesFilterError]);

  const mainTabs = [
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'equipment', label: 'Equipment', icon: <Package size={18} /> },
    { id: 'rentals', label: 'Rentals', icon: <Calendar size={18} /> },
    { id: 'payments', label: 'Payments', icon: <IndianRupee size={18} /> }, 
    { id: 'masters', label: 'Masters', icon: <Settings size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
  ];

  const masterSubTabs = [
    { id: 'equipment_categories', label: 'Equipment Categories', icon: <Tag size={16} /> },
    { id: 'payment_plans', label: 'Payment Plans', icon: <ListChecks size={16} /> },
  ];

  const maintenanceSubTabs = [
    { id: 'list', label: 'Records List', icon: <ListChecks size={16} /> },
    { id: 'form', label: 'Add New Record', icon: <PlusCircle size={16} /> },
  ];

  const handleSelectCustomerForDetail = (customer: Customer) => setSelectedCustomer(customer);
  const handleCloseCustomerDetail = () => setSelectedCustomer(null);
  const handleOpenCustomerFormForCreate = () => { setEditingCustomer(null); setIsCustomerFormOpen(true); };
  const handleOpenCustomerFormForEdit = (customer: Customer) => { setEditingCustomer(customer); setIsCustomerFormOpen(true); setSelectedCustomer(null); };
  const handleCloseCustomerForm = () => { setIsCustomerFormOpen(false); setEditingCustomer(null); };
  const handleSaveCustomerForm = () => { handleCloseCustomerForm(); refreshCustomerData(); };

  const handleOpenEquipmentFormForCreate = () => { setEditingEquipment(null); setIsEquipmentFormOpen(true); };
  const handleOpenEquipmentFormForEdit = (item: Equipment) => { setEditingEquipment(item); setIsEquipmentFormOpen(true); };
  const handleCloseEquipmentForm = () => { setIsEquipmentFormOpen(false); setEditingEquipment(null); };
  const handleSaveEquipmentForm = () => { handleCloseEquipmentForm(); refreshEquipmentData(); };

  const handleSelectEquipmentForDetail = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleCloseEquipmentDetail = () => {
    setSelectedEquipment(null);
  };

  const handleOpenEqCategoryFormForCreate = () => { setEditingEqCategory(null); setIsEqCategoryFormOpen(true); };
  const handleOpenEqCategoryFormForEdit = (item: EquipmentCategory) => { setEditingEqCategory(item); setIsEqCategoryFormOpen(true); };
  const handleCloseEqCategoryForm = () => { setIsEqCategoryFormOpen(false); setEditingEqCategory(null); };
  const handleSaveEqCategoryForm = () => { handleCloseEqCategoryForm(); refreshEqCategories(); };

  const handleOpenPpFormForCreate = () => { setEditingPp(null); setIsPpFormOpen(true); };
  const handleOpenPpFormForEdit = (item: PaymentPlan) => { setEditingPp(item); setIsPpFormOpen(true); };
  const handleClosePpForm = () => { setIsPpFormOpen(false); setEditingPp(null); };
  const handleSavePpForm = () => { handleClosePpForm(); refreshPaymentPlans(); };

  const handleOpenMaintenanceFormForCreate = () => { setEditingMaintenanceRecord(null); setIsMaintenanceFormOpen(true); setActiveMaintenanceSubTab('form'); };
  const handleOpenMaintenanceFormForEdit = (record: MaintenanceRecord) => { setEditingMaintenanceRecord(record); setIsMaintenanceFormOpen(true); setActiveMaintenanceSubTab('form'); };
  const handleCloseMaintenanceForm = () => { setIsMaintenanceFormOpen(false); setEditingMaintenanceRecord(null); setActiveMaintenanceSubTab('list'); };
  const handleSaveMaintenanceForm = () => { handleCloseMaintenanceForm(); refreshMaintenanceRecords(); };

  const handleViewMaintenanceForEquipment = (equipmentId: string) => {
    setViewingMaintenanceForEquipment(equipmentId); // This state might be passed to MaintenanceTab
    // setMaintenanceFilters({ equipment_id: equipmentId }); // This will be handled within MaintenanceTab
    setActiveTab('maintenance');
    // setActiveMaintenanceSubTab('list'); // Handled in MaintenanceTab
    // setIsMaintenanceFormOpen(false); // Handled in MaintenanceTab
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRefreshData = () => {
    switch (activeTab) {
      case 'customers': refreshCustomerData(); break;
      case 'equipment': refreshEquipmentData(); break;
      case 'masters':
        if (activeMasterSubTab === 'equipment_categories') refreshEqCategories();
        else if (activeMasterSubTab === 'payment_plans') refreshPaymentPlans();
        break;
      case 'maintenance': refreshMaintenanceRecords(); break;
      default: break;
    }
  };
  
  const isLoading = () => {
    if (activeTab === 'customers') return customersLoading;
    if (activeTab === 'equipment') return equipmentLoading || eqCategoriesLoadingForFilter; 
    if (activeTab === 'masters') {
        if (activeMasterSubTab === 'equipment_categories') return eqCategoriesLoading;
        if (activeMasterSubTab === 'payment_plans') return ppLoading;
    }
    if (activeTab === 'maintenance') return maintenanceLoading || eqCategoriesLoadingForFilter; // Assuming equipment list might be needed for filters
    return false;
  }

  return (
    <div className="min-h-screen bg-light-gray-50 flex">
      {sidebarOpen && <div className="sidebar-overlay md:hidden" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center"><img src="https://static.wixstatic.com/media/0293d4_78d06b6cb5314f6f9ac929a24bad8e46~mv2.png/v1/fill/w_246,h_123,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/SURGIHIRE%20LOGO.png" alt="SurgiHire Logo" className="h-8 w-auto mr-3"/></div>
          <button className="text-gray-500 hover:text-gray-700 md:hidden" onClick={toggleSidebar}><X size={24} /></button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {mainTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Clear selections when changing main tabs
                    setSelectedCustomer(null);
                    setSelectedEquipment(null); 
                    setIsCustomerFormOpen(false);
                    setEditingCustomer(null);
                    setIsEquipmentFormOpen(false);
                    setEditingEquipment(null);
                    setIsEqCategoryFormOpen(false);
                    setEditingEqCategory(null);
                    setIsPpFormOpen(false);
                    setEditingPp(null);
                    setIsMaintenanceFormOpen(false);
                    setEditingMaintenanceRecord(null);
                    setViewingMaintenanceForEquipment(null);
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
                {activeTab === 'maintenance' && isMaintenanceFormOpen 
                  ? (editingMaintenanceRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record') 
                  : mainTabs.find(tab => tab.id === activeTab)?.label}
              </h1>
            </div>
          </div>
        </header>

        {activeTab === 'masters' && (
          <div className="mb-6 border-b border-light-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {masterSubTabs.map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveMasterSubTab(subTab.id)}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeMasterSubTab === subTab.id
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-dark-text/70 hover:text-dark-text hover:border-gray-300'
                    }`}
                >
                  {subTab.icon && <span className="mr-2">{subTab.icon}</span>}
                  {subTab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {activeTab === 'maintenance' && !isMaintenanceFormOpen && (
          <div className="mb-6 border-b border-light-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {maintenanceSubTabs.map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => {
                    setActiveMaintenanceSubTab(subTab.id);
                    if (subTab.id === 'form') {
                        handleOpenMaintenanceFormForCreate();
                    } else {
                        setIsMaintenanceFormOpen(false); // Ensure form closes if navigating back to list via subtab
                    }
                  }}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeMaintenanceSubTab === subTab.id
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-dark-text/70 hover:text-dark-text hover:border-gray-300'
                    }`}
                >
                  {subTab.icon && <span className="mr-2">{subTab.icon}</span>}
                  {subTab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="flex-grow">
          {activeTab === 'customers' && (
            <CustomerTab 
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              isCustomerFormOpen={isCustomerFormOpen}
              setIsCustomerFormOpen={setIsCustomerFormOpen}
              editingCustomer={editingCustomer}
              setEditingCustomer={setEditingCustomer}
              customerSearchQuery={customerSearchQuery} // Pass search query
              setCustomerSearchQuery={setCustomerSearchQuery} // Pass setter for search query
              handleOpenCustomerFormForCreate={handleOpenCustomerFormForCreate}
              handleOpenCustomerFormForEdit={handleOpenCustomerFormForEdit}
              handleCloseCustomerDetail={handleCloseCustomerDetail}
              handleCloseCustomerForm={handleCloseCustomerForm}
              handleSaveCustomerForm={handleSaveCustomerForm}
              handleSelectCustomerForDetail={handleSelectCustomerForDetail}
            />
          )}
          {activeTab === 'equipment' && (
            <EquipmentTab 
              isEquipmentFormOpen={isEquipmentFormOpen}
              setIsEquipmentFormOpen={setIsEquipmentFormOpen}
              editingEquipment={editingEquipment}
              setEditingEquipment={setEditingEquipment}
              selectedEquipment={selectedEquipment}
              setSelectedEquipment={setSelectedEquipment}
              equipmentSearchQuery={equipmentSearchQuery} // Pass search query
              setEquipmentSearchQuery={setEquipmentSearchQuery} // Pass setter for search query
              handleOpenEquipmentFormForCreate={handleOpenEquipmentFormForCreate}
              handleOpenEquipmentFormForEdit={handleOpenEquipmentFormForEdit}
              handleCloseEquipmentForm={handleCloseEquipmentForm}
              handleSaveEquipmentForm={handleSaveEquipmentForm}
              handleSelectEquipmentForDetail={handleSelectEquipmentForDetail}
              handleCloseEquipmentDetail={handleCloseEquipmentDetail}
              handleViewMaintenanceForEquipment={handleViewMaintenanceForEquipment} // Pass this down
            />
          )}
          {activeTab === 'masters' && (
            <MastersTab 
              activeMasterSubTab={activeMasterSubTab}
              setActiveMasterSubTab={setActiveMasterSubTab}
              eqCategorySearchQuery={eqCategorySearchQuery}
              setEqCategorySearchQuery={setEqCategorySearchQuery}
              isEqCategoryFormOpen={isEqCategoryFormOpen}
              setIsEqCategoryFormOpen={setIsEqCategoryFormOpen}
              editingEqCategory={editingEqCategory}
              setEditingEqCategory={setEditingEqCategory}
              handleOpenEqCategoryFormForCreate={handleOpenEqCategoryFormForCreate}
              handleOpenEqCategoryFormForEdit={handleOpenEqCategoryFormForEdit}
              handleCloseEqCategoryForm={handleCloseEqCategoryForm}
              handleSaveEqCategoryForm={handleSaveEqCategoryForm}
              ppSearchQuery={ppSearchQuery}
              setPpSearchQuery={setPpSearchQuery}
              isPpFormOpen={isPpFormOpen}
              setIsPpFormOpen={setIsPpFormOpen}
              editingPp={editingPp}
              setEditingPp={setEditingPp}
              handleOpenPpFormForCreate={handleOpenPpFormForCreate}
              handleOpenPpFormForEdit={handleOpenPpFormForEdit}
              handleClosePpForm={handleClosePpForm}
              handleSavePpForm={handleSavePpForm}
            />
          )}

          {activeTab === 'rentals' && <div className="text-center p-10 text-gray-500 bg-white rounded-lg shadow">Rentals module coming soon.</div>}
          {activeTab === 'payments' && <div className="text-center p-10 text-gray-500 bg-white rounded-lg shadow">Payments module coming soon.</div>}

          {activeTab === 'maintenance' && (
            <MaintenanceTab 
              isMaintenanceFormOpen={isMaintenanceFormOpen}
              setIsMaintenanceFormOpen={setIsMaintenanceFormOpen}
              editingMaintenanceRecord={editingMaintenanceRecord}
              setEditingMaintenanceRecord={setEditingMaintenanceRecord}
              activeMaintenanceSubTab={activeMaintenanceSubTab} // Pass sub-tab state
              setActiveMaintenanceSubTab={setActiveMaintenanceSubTab} // Pass sub-tab setter
              viewingMaintenanceForEquipment={viewingMaintenanceForEquipment} // Pass specific equipment ID if viewing its records
              // Note: Search query, filters, and their setters for maintenance are managed within MaintenanceRecordContext and accessed directly by MaintenanceTab
              // handleOpenMaintenanceFormForCreate, handleOpenMaintenanceFormForEdit, handleCloseMaintenanceForm, handleSaveMaintenanceForm are now internal to MaintenanceTab
            />
          )}
        </div>
      </div>
      
      {/* Modal-like components (Detail views and Forms) are now rendered within their respective Tab components */}
      {/* Remove the following blocks as they are handled by individual Tab components */} 
      {/* {selectedCustomer && activeTab === 'customers' && <CustomerDetail customer={selectedCustomer} onClose={handleCloseCustomerDetail} onEdit={() => handleOpenCustomerFormForEdit(selectedCustomer)}/>} */}


    </div>
  );
};

export default Dashboard;
