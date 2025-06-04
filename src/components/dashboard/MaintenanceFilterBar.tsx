import React from 'react';
import SearchBox from '../ui/SearchBox';
import { Equipment } from '../../types';
import { MaintenanceRecordFilters } from '../../context/MaintenanceRecordContext';

interface MaintenanceFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: MaintenanceRecordFilters;
  onFiltersChange: (update: Partial<MaintenanceRecordFilters>) => void;
  equipmentList: Equipment[];
  loadingEquipmentList: boolean;
}

const maintenanceTypesForFilter = ['Routine', 'Repair', 'Inspection', 'Upgrade', 'Calibration', 'Emergency'];

const MaintenanceFilterBar: React.FC<MaintenanceFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  equipmentList,
  loadingEquipmentList,
}) => (
  <div className="mb-6 p-4 bg-white rounded-lg shadow">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div className="md:col-span-1">
        <label htmlFor="maintenanceSearch" className="block text-sm font-medium text-dark-text mb-1">Search Records</label>
        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by technician, notes..."
        />
      </div>
      <div>
        <label htmlFor="maintenanceTypeFilter" className="block text-sm font-medium text-dark-text mb-1">Maintenance Type</label>
        <select
          id="maintenanceTypeFilter"
          name="maintenance_type"
          value={filters.maintenance_type || 'all'}
          onChange={(e) => onFiltersChange({ maintenance_type: e.target.value === 'all' ? null : e.target.value })}
          className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
        >
          <option value="all">All Types</option>
          {maintenanceTypesForFilter.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="maintenanceEquipmentFilter" className="block text-sm font-medium text-dark-text mb-1">Equipment</label>
        <select
          id="maintenanceEquipmentFilter"
          name="equipment_id"
          value={filters.equipment_id || 'all'}
          onChange={(e) => onFiltersChange({ equipment_id: e.target.value === 'all' ? null : e.target.value })}
          disabled={loadingEquipmentList}
          className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
        >
          <option value="all">{loadingEquipmentList ? 'Loading Equipment...' : 'All Equipment'}</option>
          {!loadingEquipmentList && equipmentList.map(eq => (
            <option key={eq.equipment_id} value={String(eq.equipment_id)}>{eq.equipment_name} ({eq.serial_number || 'N/A'})</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default MaintenanceFilterBar;
