import React from 'react';
import MuiPagination from '@mui/material/Pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handleChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <MuiPagination
      page={currentPage}
      count={totalPages}
      onChange={handleChange}
      sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
    />
  );
};

export default PaginationControls;
