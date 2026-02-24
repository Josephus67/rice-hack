/**
 * useScans Hook
 * Manages scan data with pagination and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPaginatedScans,
  getScanById,
  deleteScan as deleteScanFromDb,
  createScan,
} from '@/services/database';
import { useScansStore } from '@/store';
import type { ScanSummary, ScanResult } from '@/types';

const PAGE_SIZE = 20;

interface UseScansResult {
  scans: ScanSummary[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  totalCount: number;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  saveScan: (scan: ScanResult) => Promise<void>;
  getScan: (id: string) => Promise<ScanResult | null>;
}

export function useScans(): UseScansResult {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { removeScan } = useScansStore();

  // Initial load
  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getPaginatedScans(1, PAGE_SIZE);
      setScans(result.scans);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scans');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const result = await getPaginatedScans(nextPage, PAGE_SIZE);
      setScans((prev) => [...prev, ...result.scans]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more scans');
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page]);

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const result = await getPaginatedScans(1, PAGE_SIZE);
      setScans(result.scans);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh scans');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const deleteScan = useCallback(async (id: string) => {
    try {
      await deleteScanFromDb(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
      setTotalCount((prev) => prev - 1);
      removeScan(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete scan');
    }
  }, [removeScan]);

  const saveScan = useCallback(async (scan: ScanResult) => {
    try {
      await createScan(scan);
      // Refresh to include the new scan
      await refresh();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save scan');
    }
  }, [refresh]);

  const getScan = useCallback(async (id: string): Promise<ScanResult | null> => {
    try {
      return await getScanById(id);
    } catch (err) {
      return null;
    }
  }, []);

  return {
    scans,
    isLoading,
    isRefreshing,
    hasMore,
    totalCount,
    error,
    loadMore,
    refresh,
    deleteScan,
    saveScan,
    getScan,
  };
}
