import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CustomerProvider } from './context/CustomerContext';
import { CrudProvider } from './context/CrudContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { EquipmentCategoryProvider } from './context/EquipmentCategoryContext';
import { PaymentPlanProvider } from './context/PaymentPlanContext';
import { MaintenanceRecordProvider } from './context/MaintenanceRecordContext';
import { RentalTransactionProvider } from './context/RentalTransactionContext'; // Import new provider
import { PaymentProvider } from './context/PaymentContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';
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
import LoginPage from './components/pages/LoginPage';
import RequireAuth from './components/RequireAuth';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = createTheme({
    components: {
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          InputLabelProps: { shrink: true },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <AuthProvider>
          <CrudProvider>
            <CustomerProvider>
              <EquipmentProvider>
                <EquipmentCategoryProvider>
                  <PaymentPlanProvider>
                    <MaintenanceRecordProvider>
                      <RentalTransactionProvider>
                        <PaymentProvider>
                          <UserProvider>
                          <Routes>
                            <Route element={<RequireAuth />}>
                              <Route
                                path="/"
                                element={
                                  <Dashboard
                                    sidebarOpen={sidebarOpen}
                                    setSidebarOpen={setSidebarOpen}
                                  />
                                }
                              >
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

                                <Route path="users" element={<></>} />

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
                            </Route>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                          </UserProvider>
                        </PaymentProvider>
                      </RentalTransactionProvider>
                    </MaintenanceRecordProvider>
            </PaymentPlanProvider>
          </EquipmentCategoryProvider>
        </EquipmentProvider>
      </CustomerProvider>
    </CrudProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;