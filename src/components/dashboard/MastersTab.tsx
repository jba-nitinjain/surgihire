import React from 'react';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';
import { usePaymentPlans } from '../../context/PaymentPlanContext';
import EquipmentCategoryList from '../masters/EquipmentCategoryList';
import EquipmentCategoryForm from '../masters/EquipmentCategoryForm';
import PaymentPlanList from '../masters/PaymentPlanList';
import PaymentPlanForm from '../masters/PaymentPlanForm';
import SearchBox from '../ui/SearchBox';
import { PlusCircle, Tag, ListChecks } from 'lucide-react';
import { EquipmentCategory, PaymentPlan } from '../../types';

interface MastersTabProps {
  activeMasterSubTab: string;
  setActiveMasterSubTab: (subTab: string) => void;
  isEqCategoryFormOpen: boolean;
  setIsEqCategoryFormOpen: (isOpen: boolean) => void;
  editingEqCategory: EquipmentCategory | null;
  setEditingEqCategory: (category: EquipmentCategory | null) => void;
  isPpFormOpen: boolean;
  setIsPpFormOpen: (isOpen: boolean) => void;
  editingPp: PaymentPlan | null;
  setEditingPp: (plan: PaymentPlan | null) => void;
}

const masterSubTabs = [
  { id: 'equipment_categories', label: 'Equipment Categories', icon: <Tag size={16} /> },
  { id: 'payment_plans', label: 'Payment Plans', icon: <ListChecks size={16} /> },
];

const MastersTab: React.FC<MastersTabProps> = ({
  activeMasterSubTab,
  setActiveMasterSubTab,
  isEqCategoryFormOpen,
  setIsEqCategoryFormOpen,
  editingEqCategory,
  setEditingEqCategory,
  isPpFormOpen,
  setIsPpFormOpen,
  editingPp,
  setEditingPp,
}) => {
  const { searchQuery: eqCategorySearchQuery, setSearchQuery: setEqCategorySearchQuery, refreshCategories: refreshEqCategories } = useEquipmentCategories();
  const { searchQuery: ppSearchQuery, setSearchQuery: setPpSearchQuery, refreshPaymentPlans } = usePaymentPlans();

  const handleOpenEqCategoryFormForCreate = () => { setEditingEqCategory(null); setIsEqCategoryFormOpen(true); };
  const handleOpenEqCategoryFormForEdit = (item: EquipmentCategory) => { setEditingEqCategory(item); setIsEqCategoryFormOpen(true); };
  const handleCloseEqCategoryForm = () => { setIsEqCategoryFormOpen(false); setEditingEqCategory(null); };
  const handleSaveEqCategoryForm = () => { handleCloseEqCategoryForm(); refreshEqCategories(); };

  const handleOpenPpFormForCreate = () => { setEditingPp(null); setIsPpFormOpen(true); };
  const handleOpenPpFormForEdit = (item: PaymentPlan) => { setEditingPp(item); setIsPpFormOpen(true); };
  const handleClosePpForm = () => { setIsPpFormOpen(false); setEditingPp(null); };
  const handleSavePpForm = () => { handleClosePpForm(); refreshPaymentPlans(); };

  return (
    <>
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

      {activeMasterSubTab === 'equipment_categories' && (
        <>
          <div className="mb-6 md:flex md:items-center md:justify-between">
            <div className="w-full md:max-w-xs mb-4 md:mb-0"><SearchBox value={eqCategorySearchQuery} onChange={setEqCategorySearchQuery} placeholder="Search categories..."/></div>
            <button onClick={handleOpenEqCategoryFormForCreate} className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
              <PlusCircle className="h-5 w-5 mr-2" />Add New Category
            </button>
          </div>
          <EquipmentCategoryList onEditCategory={handleOpenEqCategoryFormForEdit} />
          {isEqCategoryFormOpen && <EquipmentCategoryForm category={editingEqCategory} onSave={handleSaveEqCategoryForm} onCancel={handleCloseEqCategoryForm}/>}
        </>
      )}
      {activeMasterSubTab === 'payment_plans' && (
         <>
          <div className="mb-6 md:flex md:items-center md:justify-between">
            <div className="w-full md:max-w-xs mb-4 md:mb-0"><SearchBox value={ppSearchQuery} onChange={setPpSearchQuery} placeholder="Search payment plans..."/></div>
            <button onClick={handleOpenPpFormForCreate} className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors">
              <PlusCircle className="h-5 w-5 mr-2" />Add New Plan
            </button>
          </div>
          <PaymentPlanList onEditPlan={handleOpenPpFormForEdit} />
          {isPpFormOpen && <PaymentPlanForm plan={editingPp} onSave={handleSavePpForm} onCancel={handleClosePpForm}/>}
        </>
      )}
    </>
  );
};

export default MastersTab;