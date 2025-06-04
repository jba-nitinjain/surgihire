import React, { useState } from 'react';
import { CustomerProvider } from './context/CustomerContext';
import { CrudProvider } from './context/CrudContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { EquipmentCategoryProvider } from './context/EquipmentCategoryContext';
import { PaymentPlanProvider } from './context/PaymentPlanContext';
import { MaintenanceRecordProvider } from './context/MaintenanceRecordContext';
import Dashboard from './components/Dashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true); 

  return (
    <CrudProvider>
      <CustomerProvider>
        <EquipmentProvider>
          <EquipmentCategoryProvider> 
            <PaymentPlanProvider>
              <MaintenanceRecordProvider>
                <Dashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              </MaintenanceRecordProvider>
            </PaymentPlanProvider>
          </EquipmentCategoryProvider>
        </EquipmentProvider>
      </CustomerProvider>
    </CrudProvider>
  );
}

export default App;
