import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = 'An error occurred while fetching data.',
  onRetry
}) => {
  return (
    <div className="rounded-md bg-red-50 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Corrected the className: removed the trailing backslash */}
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm 
                          leading-4 font-medium rounded-md text-red-700 bg-red-100 
                          hover:bg-red-200 focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
