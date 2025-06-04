import React from 'react';
import { Equipment } from '../../../types';
import { Info, Layers, Tag, Hash } from 'lucide-react';

interface Props {
  equipment: Equipment;
  categoryName?: string;
}

const BasicInfoSection: React.FC<Props> = ({ equipment, categoryName }) => (
  <section>
    <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
      Basic Information
    </h4>
    <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
      <div className="divide-y divide-light-gray-200">
        {equipment.description && (
          <div className="flex p-4 items-start">
            <Info className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Description</p>
              <p className="text-sm text-dark-text break-words">{equipment.description}</p>
            </div>
          </div>
        )}
        {categoryName && (
          <div className="flex p-4 items-start">
            <Layers className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Category</p>
              <p className="text-sm text-dark-text">{categoryName}</p>
            </div>
          </div>
        )}
        {equipment.model && (
          <div className="flex p-4 items-start">
            <Tag className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Model</p>
              <p className="text-sm text-dark-text">{equipment.model}</p>
            </div>
          </div>
        )}
        {equipment.make && (
          <div className="flex p-4 items-start">
            <Tag className="h-5 w-5 text-dark-text/70 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Make</p>
              <p className="text-sm text-dark-text">{equipment.make}</p>
            </div>
          </div>
        )}
        {equipment.serial_number && (
          <div className="flex p-4 items-start">
            <Hash className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Serial Number</p>
              <p className="text-sm text-dark-text">{equipment.serial_number}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);

export default BasicInfoSection;
