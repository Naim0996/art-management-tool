import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseDataTableOptions<T> {
  fetchData: (params: { page: number; per_page: number; search?: string }) => Promise<{
    items: T[];
    total: number;
  }>;
  initialPage?: number;
  initialPerPage?: number;
  onError?: (error: Error) => void;
}

export function useDataTable<T>(options: UseDataTableOptions<T>) {
  const { fetchData, initialPage = 1, initialPerPage = 10, onError } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Use refs to store the latest functions without causing re-renders
  const fetchDataRef = useRef(fetchData);
  const onErrorRef = useRef(onError);

  // Update refs when functions change
  useEffect(() => {
    fetchDataRef.current = fetchData;
    onErrorRef.current = onError;
  }, [fetchData, onError]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDataRef.current({
        page,
        per_page: perPage,
        search: searchQuery || undefined,
      });
      setItems(response.items || []);
      setTotalRecords(response.total || 0);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load data');
      console.error('Error fetching data:', err);
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onPageChange = (event: { first: number; rows: number }) => {
    setPage(Math.floor(event.first / event.rows) + 1);
    setPerPage(event.rows);
  };

  const refresh = () => {
    loadData();
  };

  const first = (page - 1) * perPage;

  return {
    items,
    loading,
    page,
    perPage,
    totalRecords,
    searchQuery,
    first,
    setItems,
    setSearchQuery,
    onPageChange,
    refresh,
  };
}
