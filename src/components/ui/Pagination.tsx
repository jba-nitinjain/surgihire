import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const pageRange = 2;
  let startPage = Math.max(currentPage - pageRange, 1);
  let endPage = Math.min(currentPage + pageRange, totalPages);

  if (startPage === 1) {
    endPage = Math.min(startPage + pageRange * 2, totalPages);
  }
  if (endPage === totalPages) {
    startPage = Math.max(endPage - pageRange * 2, 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-1 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-2 rounded-md flex items-center justify-center transition-colors
                   ${currentPage === 1 
                     ? 'text-gray-400 cursor-not-allowed' 
                     : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`px-3 py-1 rounded-md text-sm transition-colors
                      ${currentPage === 1 
                        ? 'bg-brand-blue text-white' 
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}`}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="px-2 text-gray-500">...</span>
          )}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md text-sm transition-colors
                    ${currentPage === page 
                      ? 'bg-brand-blue text-white' 
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}`}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`px-3 py-1 rounded-md text-sm transition-colors
                      ${currentPage === totalPages 
                        ? 'bg-brand-blue text-white' 
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}`}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md flex items-center justify-center transition-colors
                   ${currentPage === totalPages 
                     ? 'text-gray-400 cursor-not-allowed' 
                     : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;