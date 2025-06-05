import React from 'react';
import { RentalItemFormData, Equipment as EquipmentType } from '../../types';
import { Trash2, PackagePlus } from 'lucide-react';
import OutlinedTextField from '../ui/OutlinedTextField';
import AutocompleteField from '../ui/AutocompleteField';
import InputAdornment from '@mui/material/InputAdornment';
import { formatCurrency } from '../../utils/formatting';

interface Props {
  items: RentalItemFormData[];
  formErrors: Record<string, string>;
  availableEquipment: EquipmentType[];
  loadingEquipment: boolean;
  handleItemChange: (index: number, field: keyof RentalItemFormData, value: string) => void;
  removeItem: (index: number) => void;
  addItem: () => void;
  inputClass: string;
  labelClass: string;
  isEditing?: boolean;
}

const RentalItemsSection: React.FC<Props> = ({
  items,
  formErrors,
  availableEquipment,
  loadingEquipment,
  handleItemChange,
  removeItem,
  addItem,
  inputClass,
  labelClass,
  isEditing = false,
}) => (
  <fieldset>
    <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Rental Items</legend>
    {formErrors.rental_items && typeof formErrors.rental_items !== 'object' && (
      <p className="text-xs text-red-500 mb-2">{formErrors.rental_items}</p>
    )}
    {isEditing ? (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-left">
              <th className="p-2">Equipment</th>
              <th className="p-2">Unit Rate (₹/day)</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.temp_id} className="border-b last:border-b-0">
                <td className="p-2">
                  <AutocompleteField
                    id={`item_equipment_${index}`}
                    name={`item_equipment_${index}`}
                    value={item.equipment_id}
                    onChange={(e) => handleItemChange(index, 'equipment_id', e.target.value)}
                    options={availableEquipment
                      .filter(eq =>
                        eq.status === 'Available' ||
                        items.some(it => it.equipment_id === String(eq.equipment_id))
                      )
                      .map(eq => ({
                        value: String(eq.equipment_id),
                        label: `${eq.equipment_name} (SN: ${eq.serial_number || 'N/A'}) - Rate: ${formatCurrency(eq.rental_rate)}`,
                      }))}
                    loading={loadingEquipment}
                    disabled={loadingEquipment}
                    placeholder={loadingEquipment ? 'Loading...' : 'Select Equipment'}
                    className="w-full"
                  />
                  {formErrors[`rental_items.${index}.equipment_id`] && (
                    <p className="text-xs text-red-500 mt-1">{formErrors[`rental_items.${index}.equipment_id`]}</p>
                  )}
                </td>
                <td className="p-2">
                  <OutlinedTextField
                    type="number"
                    id={`item_rate_${index}`}
                    value={item.rental_rate}
                    onChange={(e) => handleItemChange(index, 'rental_rate', e.target.value)}
                    className={`${inputClass} text-xs`}
                    inputProps={{ step: '0.01', min: '0' }}
                    placeholder={item.default_equipment_rate !== null ? String(item.default_equipment_rate) : '0.00'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                  {formErrors[`rental_items.${index}.rental_rate`] && (
                    <p className="text-xs text-red-500 mt-1">{formErrors[`rental_items.${index}.rental_rate`]}</p>
                  )}
                </td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div key={item.temp_id} className="p-4 border border-light-gray-200 rounded-md space-y-3 bg-light-gray-50 relative">
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
              title="Remove Item"
            >
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label htmlFor={`item_equipment_${index}`} className={`${labelClass} text-xs`}>Equipment <span className="text-red-500">*</span></label>
                <AutocompleteField
                  id={`item_equipment_${index}`}
                  name={`item_equipment_${index}`}
                  value={item.equipment_id}
                  onChange={(e) => handleItemChange(index, 'equipment_id', e.target.value)}
                  options={availableEquipment
                    .filter(eq =>
                      eq.status === 'Available' ||
                      items.some(it => it.equipment_id === String(eq.equipment_id))
                    )
                    .map(eq => ({
                      value: String(eq.equipment_id),
                      label: `${eq.equipment_name} (SN: ${eq.serial_number || 'N/A'}) - Rate: ${formatCurrency(eq.rental_rate)}`,
                    }))}
                  loading={loadingEquipment}
                  disabled={loadingEquipment}
                  placeholder={loadingEquipment ? 'Loading...' : 'Select Equipment'}
                />
                {formErrors[`rental_items.${index}.equipment_id`] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors[`rental_items.${index}.equipment_id`]}</p>
                )}
              </div>
              <div>
                <label htmlFor={`item_rate_${index}`} className={`${labelClass} text-xs`}>Unit Rate (₹/day) <span className="text-red-500">*</span></label>
                <OutlinedTextField
                  type="number"
                  id={`item_rate_${index}`}
                  value={item.rental_rate}
                  onChange={(e) => handleItemChange(index, 'rental_rate', e.target.value)}
                  className={`${inputClass} text-xs`}
                  inputProps={{ step: '0.01', min: '0' }}
                  placeholder={item.default_equipment_rate !== null ? String(item.default_equipment_rate) : '0.00'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                />
                {formErrors[`rental_items.${index}.rental_rate`] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors[`rental_items.${index}.rental_rate`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    <button
      type="button"
      onClick={addItem}
      className="mt-3 inline-flex items-center px-3 py-1.5 border border-dashed border-brand-blue text-brand-blue text-xs font-medium rounded-md hover:bg-brand-blue/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-blue"
    >
      <PackagePlus size={16} className="mr-2" /> Add Rental Item
    </button>
  </fieldset>
);

export default RentalItemsSection;
