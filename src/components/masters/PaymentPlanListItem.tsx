import React, { useState } from 'react';
import { PaymentPlan } from '../../types';
import { ListChecks, Edit3, Trash2, Loader2, CalendarClock } from 'lucide-react';
import { useCrud } from '../../context/CrudContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { usePaymentPlans } from '../../context/PaymentPlanContext';

interface PaymentPlanListItemProps {
  plan: PaymentPlan;
  onEdit: (plan: PaymentPlan) => void;
}

const PaymentPlanListItem: React.FC<PaymentPlanListItemProps> = ({ plan, onEdit }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshPaymentPlans } = usePaymentPlans();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleEdit = () => {
    onEdit(plan);
  };

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem('payment_plans', plan.plan_id);
      refreshPaymentPlans();
    } catch (error) {
      console.error("Failed to delete payment plan:", error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <tr className="bg-white hover:bg-light-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{plan.plan_id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text flex items-center">
            <ListChecks size={16} className="mr-2 text-brand-blue" /> {plan.plan_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">
            {plan.frequency_in_days ? (
                <span className="flex items-center"><CalendarClock size={15} className="mr-1.5 text-gray-500"/> {plan.frequency_in_days} days</span>
            ) : <span className="italic text-gray-400">Not set</span>}
        </td>
        <td className="px-6 py-4 whitespace-normal text-sm text-dark-text/80 max-w-md truncate" title={plan.description || ''}>
            {plan.description || <span className="italic text-gray-400">No description</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button
            onClick={handleEdit}
            disabled={crudLoading}
            className="text-brand-blue hover:text-brand-blue/80 disabled:opacity-50 p-1 rounded hover:bg-brand-blue/10"
            title="Edit Plan"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={crudLoading}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1 rounded hover:bg-red-100"
            title="Delete Plan"
          >
            {crudLoading && isConfirmModalOpen ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </td>
      </tr>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Payment Plan"
        message={`Are you sure you want to delete "${plan.plan_name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default PaymentPlanListItem;
