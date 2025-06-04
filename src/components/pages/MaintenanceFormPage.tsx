import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MaintenanceRecordForm from '../MaintenanceRecordForm';
import { MaintenanceRecord, MaintenanceRecordFormData } from '../../types';
import { getMaintenanceRecord } from '../../services/api/maintenance';

const MaintenanceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { record?: MaintenanceRecord } };

  const [record, setRecord] = useState<MaintenanceRecord | null>(location.state?.record || null);
  const [loading, setLoading] = useState<boolean>(!!id && !record);

  useEffect(() => {
    if (id && !record) {
      getMaintenanceRecord(Number(id))
        .then(res => {
          if (res.success && res.data) {
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setRecord(data as MaintenanceRecord);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, record]);

  const formRecord: MaintenanceRecordFormData | undefined = record
    ? {
        equipment_id: String(record.equipment_id),
        maintenance_date: record.maintenance_date,
        maintenance_type: record.maintenance_type || '',
        technician: record.technician || '',
        cost: record.cost !== null ? String(record.cost) : '',
        notes: record.notes || '',
      }
    : undefined;

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <MaintenanceRecordForm
        record={formRecord}
        onSave={() => navigate('/maintenance')}
        onCancel={() => navigate(-1)}
        isEditMode={!!id}
      />
    </div>
  );
};

export default MaintenanceFormPage;

