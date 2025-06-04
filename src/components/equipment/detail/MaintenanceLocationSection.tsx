import React from 'react';
import { Equipment } from '../../../types';
import { Wrench, CalendarDays, MapPin } from 'lucide-react';
import { formatDate } from '../../../utils/formatting';

interface Props {
  equipment: Equipment;
}

const MaintenanceLocationSection: React.FC<Props> = ({ equipment }) => (
  <section>
    <h4 className="text-sm font-medium text-dark-text uppercase tracking-wider mb-3">
      Maintenance &amp; Location
    </h4>
    <div className="bg-white rounded-lg border border-light-gray-200 overflow-hidden shadow-sm">
      <div className="divide-y divide-light-gray-200">
        {equipment.last_maintenance_date && (
          <div className="flex p-4 items-start">
            <Wrench className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Last Maintenance</p>
              <p className="text-sm text-dark-text">{formatDate(equipment.last_maintenance_date)}</p>
            </div>
          </div>
        )}
        {equipment.next_calibration_date && (
          <div className="flex p-4 items-start">
            <CalendarDays className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Next Calibration</p>
              <p className="text-sm text-dark-text">{formatDate(equipment.next_calibration_date)}</p>
            </div>
          </div>
        )}
        {equipment.location && (
          <div className="flex p-4 items-start">
            <MapPin className="h-5 w-5 text-brand-blue mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-text/60 mb-0.5">Location</p>
              <p className="text-sm text-dark-text">{equipment.location}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);

export default MaintenanceLocationSection;
