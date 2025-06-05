import React, { useState } from 'react';
import { Customer } from '../types';
import { Edit3, Trash2, ListChecks } from 'lucide-react';
import { useCrud } from '../context/CrudContext';
import ConfirmationModal from './ui/ConfirmationModal';
import { useCustomers } from '../context/CustomerContext';
import { formatDate } from '../utils/formatting';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

interface CustomerListItemProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onSelect: (customer: Customer) => void;
  onViewRentals: (customerId: string) => void;
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, onEdit, onSelect, onViewRentals }) => {
  const { deleteItem, loading: crudLoading } = useCrud();
  const { refreshData } = useCustomers();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteItem('customers', customer.customer_id);
      refreshData();
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onSelect(customer)}>
        <TableCell>{customer.customer_id}</TableCell>
        <TableCell>{customer.full_name || 'Unnamed'}</TableCell>
        <TableCell>{customer.mobile_number_1 || '-'}</TableCell>
        <TableCell>{customer.email || '-'}</TableCell>
        <TableCell>{formatDate(customer.registration_date)}</TableCell>
        <TableCell align="right">
          <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); onViewRentals(String(customer.customer_id)); }}>
            <ListChecks size={18} />
          </IconButton>
          <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); onEdit(customer); }} disabled={crudLoading}>
            <Edit3 size={18} />
          </IconButton>
          <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setConfirmOpen(true); }} disabled={crudLoading}>
            <Trash2 size={18} />
          </IconButton>
        </TableCell>
      </TableRow>
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.full_name || 'this customer'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        isLoading={crudLoading}
        confirmText="Delete"
      />
    </>
  );
};

export default CustomerListItem;
