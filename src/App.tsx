import React, { useState } from 'react';
import { CustomerProvider } from './context/CustomerContext';
import { CrudProvider } from './context/CrudContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { EquipmentCategoryProvider } from './context/EquipmentCategoryContext';
import { PaymentPlanProvider } from './context/PaymentPlanContext';
import { MaintenanceRecordProvider } from './context/MaintenanceRecordContext';
import Dashboard from './components/Dashboard';

function App() {
  // sidebarOpen state is now managed within Dashboard.tsx after refactoring
  // If you still need to control it from App.tsx for some reason,
  // you would re-add it here and pass it down.
  // For now, assuming Dashboard manages its own sidebar state or it's passed differently.
  const [sidebarOpen, setSidebarOpen] = useState(true);


  return (
    <CrudProvider>
      <CustomerProvider>
        <EquipmentProvider>
          <EquipmentCategoryProvider>
            <PaymentPlanProvider>
              <MaintenanceRecordProvider>
                {/* Pass sidebarOpen and setSidebarOpen if Dashboard expects them */}
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
