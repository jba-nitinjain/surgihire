import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { RentalTransaction, RentalItem } from '../../types';
import { useCrud } from '../../context/CrudContext';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { useEquipment } from '../../context/EquipmentContext';
import { fetchRentalDetailsByRentalId } from '../../services/api/rentals';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  rental: RentalTransaction;
}

const ReturnRentalDialog: React.FC<Props> = ({ open, onClose, rental }) => {
  const { updateItem, createItem, loading } = useCrud();
  const { refreshRentalTransactions } = useRentalTransactions();
  const { refreshEquipmentData } = useEquipment();
  const [items, setItems] = useState<RentalItem[]>(rental.rental_items || []);
  const [selected, setSelected] = useState<number[]>([]);
  const [payment, setPayment] = useState('');

  useEffect(() => {
    if (open) {
      if (!rental.rental_items || rental.rental_items.some(it => !('equipment_name' in it))) {
        fetchRentalDetailsByRentalId(rental.rental_id, { records: 20, skip: 0 }).then(res => {
          if (res.success && Array.isArray(res.data)) {
            setItems(res.data as any);
            setSelected((res.data as any).map((it: any) => it.equipment_id));
          }
        });
      } else {
        setItems(rental.rental_items);
        setSelected(rental.rental_items.map(it => it.equipment_id));
      }
      setPayment('');
    }
  }, [open, rental]);

  const toggleItem = (id: number) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleConfirm = async () => {
    try {
      await Promise.all(selected.map(id => updateItem('equipment', id, { status: 'Available' })));
      if (selected.length === items.length) {
        await updateItem('rental_transactions', rental.rental_id, {
          status: 'Returned/Completed',
          actual_return_date: dayjs().format('YYYY-MM-DD'),
        });
        await updateItem('customers', rental.customer_id, { has_active_rentals: 0 });
      }
      if (payment && Number(payment) > 0) {
        await createItem('payments', {
          rental_id: rental.rental_id,
          payment_date: dayjs().format('YYYY-MM-DD'),
          payment_amount: Number(payment),
          nature: 'rental',
        });
      }
      refreshEquipmentData();
      refreshRentalTransactions();
      onClose();
    } catch (err) {
      console.error('Failed to process return', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Return Rental Items</DialogTitle>
      <DialogContent dividers>
        <div className="space-y-2">
          {items.map(item => (
            <FormControlLabel
              key={item.equipment_id}
              control={
                <Checkbox
                  checked={selected.includes(item.equipment_id)}
                  onChange={() => toggleItem(item.equipment_id)}
                />
              }
              label={item.equipment_name || `ID: ${item.equipment_id}`}
            />
          ))}
        </div>
        <TextField
          label="Payment Amount"
          type="number"
          fullWidth
          margin="normal"
          value={payment}
          onChange={e => setPayment(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={loading || selected.length === 0} variant="contained" color="primary">
          Return
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnRentalDialog;
