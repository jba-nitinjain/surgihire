import React from 'react';
import { TabData } from '../../types';

interface TabNavigationProps {
  tabs: TabData[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="mb-6 overflow-x-auto">
      <nav className="flex space-x-4 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-brand-blue text-white'
                : 'text-dark-text hover:text-brand-blue hover:bg-light-gray-50'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === tab.id
                  ? 'bg-white text-brand-blue'
                  : 'bg-light-gray-100 text-dark-text'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;