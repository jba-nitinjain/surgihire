import React, { useState } from 'react';
import { CustomerProvider } from './context/CustomerContext';
import { CrudProvider } from './context/CrudContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { EquipmentCategoryProvider } from './context/EquipmentCategoryContext';
import { PaymentPlanProvider } from './context/PaymentPlanContext';
import { MaintenanceRecordProvider } from './context/MaintenanceRecordContext';
import { RentalTransactionProvider } from './context/RentalTransactionContext'; // Import new provider
import Dashboard from './components/Dashboard';
import { Routes, Route } from 'react-router-dom';
import CustomerFormPage from './components/pages/CustomerFormPage';
import EquipmentFormPage from './components/pages/EquipmentFormPage';
import CustomerDetailPage from './components/pages/CustomerDetailPage';
import EquipmentDetailPage from './components/pages/EquipmentDetailPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <CrudProvider>
      <CustomerProvider>
        <EquipmentProvider>
          <EquipmentCategoryProvider>
            <PaymentPlanProvider>
              <MaintenanceRecordProvider>
                <RentalTransactionProvider>
                  <Routes>
                    <Route path="/" element={<Dashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
                    <Route path="/customers/new" element={<CustomerFormPage />} />
                    <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
                    <Route path="/customers/:id" element={<CustomerDetailPage />} />
                    <Route path="/customers/:id/*" element={<CustomerDetailPage />} />
                    <Route path="/equipment/new" element={<EquipmentFormPage />} />
                    <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
                    <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
                    <Route path="/equipment/:id/*" element={<EquipmentDetailPage />} />
                    <Route path="*" element={<Dashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
                  </Routes>
                </RentalTransactionProvider>
              </MaintenanceRecordProvider>
            </PaymentPlanProvider>
          </EquipmentCategoryProvider>
        </EquipmentProvider>
      </CustomerProvider>
    </CrudProvider>
  );
}

export default App;