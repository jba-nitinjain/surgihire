import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import EquipmentDetail from '../EquipmentDetail';
import { Equipment } from '../../types';
import { getEquipmentItem } from '../../services/api/equipment';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';

const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { equipment?: Equipment } };
  const [equipment, setEquipment] = useState<Equipment | null>(location.state?.equipment || null);
  const [loading, setLoading] = useState<boolean>(!!id && !equipment);
  const { getCategoryNameById } = useEquipmentCategories();

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

  if (!equipment) {
    return <div className="p-4">Equipment not found.</div>;
  }

  const handleViewMaintenance = (equipmentId: string) => {
    navigate('/maintenance', { state: { equipmentId, from: location.pathname } });
  };

  return (
    <div className="p-4">
      <EquipmentDetail
        equipment={equipment}
        categoryName={getCategoryNameById(equipment.category_id)}
        isModal={false}
        onClose={() => navigate(-1)}
        onEdit={() => navigate(`/equipment/${equipment.equipment_id}/edit`, { state: { equipment } })}
        onViewMaintenance={handleViewMaintenance}
      />
    </div>
  );
};

export default EquipmentDetailPage;
