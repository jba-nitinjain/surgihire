import React from 'react';
import SearchBox from '../ui/SearchBox';
import { EquipmentCategory } from '../../types';

interface EquipmentFilters {
  status: string | null;
  category_id: number | string | null;
}

interface EquipmentFilterPanelProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: EquipmentFilters;
  onFiltersChange: (update: Partial<EquipmentFilters>) => void;
  categories: EquipmentCategory[];
  loadingCategories: boolean;
  categoriesError: string | null;
}

const equipmentStatusesForFilter = ['Available', 'Rented', 'Maintenance', 'Decommissioned', 'Lost'];

const EquipmentFilterPanel: React.FC<EquipmentFilterPanelProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  categories,
  loadingCategories,
  categoriesError,
}) => (
  <div className="mb-6 p-4 bg-white rounded-lg shadow">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div className="md:col-span-1">
        <label htmlFor="equipmentSearch" className="block text-sm font-medium text-dark-text mb-1">Search Equipment</label>
        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by name, serial..."
        />
      </div>
      <div>
        <label htmlFor="equipmentStatusFilter" className="block text-sm font-medium text-dark-text mb-1">Status</label>
        <select
          id="equipmentStatusFilter"
          name="status"
          value={filters.status || 'all'}
          onChange={(e) => onFiltersChange({ status: e.target.value === 'all' ? null : e.target.value })}
          className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
        >
          <option value="all">All Statuses</option>
          {equipmentStatusesForFilter.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="equipmentCategoryFilter" className="block text-sm font-medium text-dark-text mb-1">Category</label>
        <select
          id="equipmentCategoryFilter"
          name="category_id"
          value={filters.category_id || 'all'}
          onChange={(e) => onFiltersChange({ category_id: e.target.value === 'all' ? null : e.target.value })}
          disabled={loadingCategories || !!categoriesError}
          className="block w-full pl-3 pr-10 py-2 text-base border-light-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm"
        >
          <option value="all">{loadingCategories ? 'Loading...' : (categoriesError ? 'Error' : 'All Categories')}</option>
          {!loadingCategories && !categoriesError && categories.map(cat => (
            <option key={cat.category_id} value={String(cat.category_id)}>{cat.category_name}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default EquipmentFilterPanel;
