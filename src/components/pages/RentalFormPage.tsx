import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import RentalTransactionForm from '../rentals/RentalTransactionForm';
import { RentalTransaction } from '../../types';
import { getRental, fetchRentalDetailsByRentalId } from '../../services/api/rentals';

const RentalFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { rental?: RentalTransaction } };

  const [rental, setRental] = useState<RentalTransaction | null>(location.state?.rental || null);
  const [loading, setLoading] = useState<boolean>(!!id && !rental);

  useEffect(() => {
    if (id && !rental) {
      Promise.all([
        getRental(Number(id)),
        fetchRentalDetailsByRentalId(Number(id), { records: 100, skip: 0 }),
      ])
        .then(([rentalRes, detailsRes]) => {
          if (rentalRes.success && rentalRes.data) {
            const base = Array.isArray(rentalRes.data) ? rentalRes.data[0] : rentalRes.data;
            let fullRental = base as RentalTransaction;
            if (detailsRes.success && Array.isArray(detailsRes.data)) {
              fullRental = { ...fullRental, rental_items: detailsRes.data };
            }
            setRental(fullRental);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, rental]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <RentalTransactionForm
        rental={rental}
        onSave={() => navigate('/rentals')}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default RentalFormPage;

