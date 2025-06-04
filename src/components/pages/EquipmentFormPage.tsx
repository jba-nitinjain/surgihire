import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import EquipmentForm from '../EquipmentForm';
import { Equipment } from '../../types';
import { getEquipmentItem } from '../../services/api/equipment';
import { useEquipment } from '../../context/EquipmentContext';

const EquipmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { equipment?: Equipment } };
  const [equipment, setEquipment] = useState<Equipment | null>(location.state?.equipment || null);
  const [loading, setLoading] = useState<boolean>(!!id && !equipment);
  const { refreshEquipmentData } = useEquipment();

  useEffect(() => {
    if (id && !equipment) {
      getEquipmentItem(Number(id)).then(res => {
        if (res.success && res.data) {
          setEquipment(res.data as Equipment);
        }
      }).finally(() => setLoading(false));
    }
  }, [id, equipment]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <EquipmentForm
        equipment={equipment}
        onSave={() => { refreshEquipmentData(); navigate('/equipment'); }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default EquipmentFormPage;
