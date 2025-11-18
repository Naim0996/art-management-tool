import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPerPage = 10 } = options;
  
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalRecords, setTotalRecords] = useState(0);

  const onPageChange = useCallback((event: { first: number; rows: number }) => {
    setPage(Math.floor(event.first / event.rows) + 1);
    setPerPage(event.rows);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  const first = (page - 1) * perPage;

  return {
    page,
    perPage,
    totalRecords,
    first,
    setPage,
    setPerPage,
    setTotalRecords,
    onPageChange,
    resetPagination,
  };
}
