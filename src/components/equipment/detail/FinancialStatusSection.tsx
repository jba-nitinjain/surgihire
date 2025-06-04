import React from 'react';
import { Equipment } from '../../../types';
import { CalendarDays, Info } from 'lucide-react';
import { formatDate, formatCurrency } from '../../../utils/formatting';

interface Props {
  equipment: Equipment;
}

const FinancialStatusSection: React.FC<Props> = ({ equipment }) => (
  <section>
    <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
      Financial &amp; Status
    </h4>
    <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
      <div className="divide-y divide-light-gray-200">
        {equipment.purchase_date && (
          <div className="flex p-4 items-start">
            <CalendarDays className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Purchase Date</p>
              <p className="text-sm text-dark-text">{formatDate(equipment.purchase_date)}</p>
            </div>
          </div>
        )}
        {(equipment.rental_rate !== null && equipment.rental_rate !== undefined) && (
          <div className="flex p-4 items-start">
            <span className={`h-5 w-5 mr-3 mt-1 flex-shrink-0 text-brand-blue font-semibold`}>
              {formatCurrency(equipment.rental_rate).charAt(0)}
            </span>
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Rental Rate (per day)</p>
              <p className="text-sm text-dark-text">{formatCurrency(equipment.rental_rate)}</p>
            </div>
          </div>
        )}
        {equipment.status && (
          <div className="flex p-4 items-start">
            <Info className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Status</p>
              <p className="text-sm text-dark-text">{equipment.status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);

export default FinancialStatusSection;
