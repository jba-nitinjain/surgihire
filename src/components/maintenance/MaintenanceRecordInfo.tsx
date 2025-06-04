import React from 'react';
import { MaintenanceRecordFormData, Equipment } from '../../types';
import { Loader2, Package, CalendarDays } from 'lucide-react';

interface Props {
  formData: MaintenanceRecordFormData;
  formErrors: Partial<Record<keyof MaintenanceRecordFormData, string>>;
  equipmentList: Equipment[];
  loadingEquipment: boolean;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  inputClass: string;
  labelClass: string;
}

const MaintenanceRecordInfo: React.FC<Props> = ({
  formData,
  formErrors,
  equipmentList,
  loadingEquipment,
  handleChange,
  inputClass,
  labelClass,
}) => {
  const iconClass = 'h-5 w-5 text-gray-400';
  return (
    <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
      <div>
        <label htmlFor="equipment_id" className={labelClass}>
          Equipment <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {loadingEquipment ? (
              <Loader2 className={`${iconClass} animate-spin`} />
            ) : (
              <Package className={iconClass} />
            )}
          </div>
          <select
            id="equipment_id"
            name="equipment_id"
            value={formData.equipment_id}
            onChange={handleChange}
            required
            disabled={loadingEquipment}
            className={`${inputClass} pl-10`}
          >
            <option value="">{loadingEquipment ? 'Loading Equipment...' : 'Select Equipment'}</option>
            {!loadingEquipment &&
              equipmentList.map((equipment) => (
                <option key={equipment.equipment_id} value={String(equipment.equipment_id)}>
                  {equipment.equipment_name} ({equipment.serial_number || 'N/A'})
                </option>
              ))}
          </select>
        </div>
        {formErrors.equipment_id && <p className="text-xs text-red-500 mt-1">{formErrors.equipment_id}</p>}
      </div>

      <div>
        <label htmlFor="maintenance_date" className={labelClass}>
          Maintenance Date <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarDays className={iconClass} />
          </div>
          <input
            type="date"
            id="maintenance_date"
            name="maintenance_date"
            value={formData.maintenance_date}
            onChange={handleChange}
            required
            className={`${inputClass} pl-10`}
          />
        </div>
        {formErrors.maintenance_date && <p className="text-xs text-red-500 mt-1">{formErrors.maintenance_date}</p>}
      </div>
    </fieldset>
  );
};

export default MaintenanceRecordInfo;
