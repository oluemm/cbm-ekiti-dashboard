import { useState, useEffect } from 'react';
import * as api from '@/services/dataService';
import type {
  OverviewData,
  ElectionYear,
  VotingPattern,
  LogisticsData,
  PVCAnalysis,
  CollationSummary,
  PollingUnitRecord,
} from '@/types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(fetcher: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export function useOverview() {
  return useAsync<OverviewData>(api.getOverview);
}

export function useElectionResults(year: number) {
  const [state, setState] = useState<AsyncState<ElectionYear>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    api
      .getElectionResults(year)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  return state;
}

export function useVotingPatterns() {
  return useAsync<VotingPattern[]>(api.getVotingPatterns);
}

export function useLogistics() {
  return useAsync<LogisticsData>(api.getLogistics);
}

export function usePVCAnalysis() {
  return useAsync<PVCAnalysis>(api.getPVCAnalysis);
}

export function useCollation() {
  return useAsync<CollationSummary>(api.getCollation);
}

export function usePollingUnits() {
  return useAsync<PollingUnitRecord[]>(api.getPollingUnits);
}
