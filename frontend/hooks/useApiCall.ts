import { useState, useCallback } from 'react';

export interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showToast?: (severity: 'success' | 'error', summary: string, detail?: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiCall<T = unknown>(
  apiFunction: (...args: never[]) => Promise<T>,
  options?: UseApiCallOptions<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: never[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        if (options?.successMessage && options?.showToast) {
          options.showToast('success', 'Success', options.successMessage);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);

        if (options?.onError) {
          options.onError(error);
        }

        if (options?.errorMessage && options?.showToast) {
          options.showToast('error', 'Error', options.errorMessage);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  return { execute, loading, error, data };
}
