import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import EquipmentCategoryForm from '../masters/EquipmentCategoryForm';
import { EquipmentCategory } from '../../types';
import { getEquipmentCategory } from '../../services/api/equipmentCategories';
import { useEquipmentCategories } from '../../context/EquipmentCategoryContext';

const EquipmentCategoryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { category?: EquipmentCategory } };

  const [category, setCategory] = useState<EquipmentCategory | null>(location.state?.category || null);
  const [loading, setLoading] = useState<boolean>(!!id && !category);
  const { refreshCategories } = useEquipmentCategories();

  useEffect(() => {
    if (id && !category) {
      getEquipmentCategory(Number(id))
        .then(res => {
          if (res.success && res.data) {
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setCategory(data as EquipmentCategory);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, category]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <EquipmentCategoryForm
        category={category}
        onSave={() => { refreshCategories(); navigate('/masters/equipment-categories'); }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default EquipmentCategoryFormPage;

