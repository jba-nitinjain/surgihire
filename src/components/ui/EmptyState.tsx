import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No customers found',
  message = 'Try adjusting your search or filters to find what you\'re looking for.',
  icon = <FileQuestion className="w-16 h-16 text-gray-400" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md">{message}</p>
    </div>
  );
};

export default EmptyState;