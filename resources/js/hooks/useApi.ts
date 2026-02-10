// resources/js/hooks/useApi.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { ApiResponse, PaginatedResponse } from '@/types';

interface UseApiOptions {
  baseURL?: string;
  timeout?: number;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
}

export function useApi(options?: UseApiOptions) {
  const api: AxiosInstance = axios.create({
    baseURL: options?.baseURL || '/api',
    timeout: options?.timeout || 10000,
  });

  const get = useCallback(async <T,>(url: string): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url);
    return response.data.data;
  }, [api]);

  const post = useCallback(async <T,>(url: string, data: unknown): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }, [api]);

  const put = useCallback(async <T,>(url: string, data: unknown): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }, [api]);

  const delete_ = useCallback(async <T,>(url: string): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url);
    return response.data.data;
  }, [api]);

  const paginated = useCallback(async <T,>(url: string): Promise<PaginatedResponse<T>> => {
    const response = await api.get<PaginatedResponse<T>>(url);
    return response.data;
  }, [api]);

  return { get, post, put, delete: delete_, paginated };
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as AxiosError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  React.useEffect(() => {
    fetch();
  }, dependencies);

  return { data, loading, error };
}

