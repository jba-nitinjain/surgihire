import React, { useState } from 'react';
import { Customer } from '../types';
import { Edit3, Trash2, ListChecks } from 'lucide-react';
import { useCrud } from '../context/CrudContext';
import ConfirmationModal from './ui/ConfirmationModal';
import { useCustomers } from '../context/CustomerContext';
import { formatDate } from '../utils/formatting';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
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
      <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => onSelect(customer)}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ID: {customer.customer_id}
          </Typography>
          <Typography variant="h6" component="div">
            {customer.full_name || 'Unnamed'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customer.mobile_number_1 || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customer.email || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registered: {formatDate(customer.registration_date)}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            color="primary"
            onClick={e => {
              e.stopPropagation();
              onViewRentals(String(customer.customer_id));
            }}
          >
            <ListChecks size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={e => {
              e.stopPropagation();
              onEdit(customer);
            }}
            disabled={crudLoading}
          >
            <Edit3 size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={e => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            disabled={crudLoading}
          >
            <Trash2 size={18} />
          </IconButton>
        </CardActions>
      </Card>
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
