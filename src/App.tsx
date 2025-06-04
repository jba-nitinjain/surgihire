import React, { useState } from 'react';
import { CustomerProvider } from './context/CustomerContext';
import { CrudProvider } from './context/CrudContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { EquipmentCategoryProvider } from './context/EquipmentCategoryContext';
import { PaymentPlanProvider } from './context/PaymentPlanContext';
import { MaintenanceRecordProvider } from './context/MaintenanceRecordContext';
import { RentalTransactionProvider } from './context/RentalTransactionContext'; // Import new provider
import { PaymentProvider } from './context/PaymentContext';
import Dashboard from './components/Dashboard';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerFormPage from './components/pages/CustomerFormPage';
import EquipmentFormPage from './components/pages/EquipmentFormPage';
import CustomerDetailPage from './components/pages/CustomerDetailPage';
import EquipmentDetailPage from './components/pages/EquipmentDetailPage';
import RentalFormPage from './components/pages/RentalFormPage';
import MaintenanceFormPage from './components/pages/MaintenanceFormPage';
import PaymentPlanFormPage from './components/pages/PaymentPlanFormPage';
import EquipmentCategoryFormPage from './components/pages/EquipmentCategoryFormPage';
import PaymentFormPage from './components/pages/PaymentFormPage';
import PaymentDetailPage from './components/pages/PaymentDetailPage';
import NotFound from './components/pages/NotFound';

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
                  <PaymentProvider>
                    <Routes>
                    <Route path="/" element={<Dashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}>
                      <Route index element={<Navigate to="customers" replace />} />

                      <Route path="customers" element={<></>} />
                      <Route path="customers/new" element={<CustomerFormPage />} />
                      <Route path="customers/:id/edit" element={<CustomerFormPage />} />
                      <Route path="customers/:id" element={<CustomerDetailPage />} />

                      <Route path="equipment" element={<></>} />
                      <Route path="equipment/new" element={<EquipmentFormPage />} />
                      <Route path="equipment/:id/edit" element={<EquipmentFormPage />} />
                      <Route path="equipment/:id" element={<EquipmentDetailPage />} />

                      <Route path="rentals" element={<></>} />
                      <Route path="rentals/new" element={<RentalFormPage />} />
                      <Route path="rentals/:id/edit" element={<RentalFormPage />} />

                      <Route path="payments" element={<></>} />
                      <Route path="payments/new" element={<PaymentFormPage />} />
                      <Route path="payments/:id/edit" element={<PaymentFormPage />} />
                      <Route path="payments/:id" element={<PaymentDetailPage />} />

                      <Route path="maintenance" element={<></>} />
                      <Route path="maintenance/new" element={<MaintenanceFormPage />} />
                      <Route path="maintenance/:id/edit" element={<MaintenanceFormPage />} />

                      <Route path="masters/equipment-categories" element={<></>} />
                      <Route path="masters/equipment-categories/new" element={<EquipmentCategoryFormPage />} />
                      <Route path="masters/equipment-categories/:id/edit" element={<EquipmentCategoryFormPage />} />
                      <Route path="masters/payment-plans" element={<></>} />
                      <Route path="masters/payment-plans/new" element={<PaymentPlanFormPage />} />
                      <Route path="masters/payment-plans/:id/edit" element={<PaymentPlanFormPage />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </PaymentProvider>
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