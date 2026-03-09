/**
 * Data Service — Abstraction layer for fetching election data.
 *
 * Currently loads static JSON from /data/*.json.
 * When the client provides real APIs, swap the fetch URLs here
 * and every component continues to work unchanged.
 */

import type {
  OverviewData,
  ElectionYear,
  VotingPattern,
  LogisticsData,
  PVCAnalysis,
  CollationSummary,
  PollingUnitRecord,
} from '@/types';

const BASE = '/data';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

/** Overview KPIs — wards, PUs, voters, PVC stats */
export function getOverview(): Promise<OverviewData> {
  return fetchJson<OverviewData>('overview.json');
}

/** Election results for a given year (2018 | 2022) */
export function getElectionResults(year: number): Promise<ElectionYear> {
  return fetchJson<ElectionYear>(`results-${year}.json`);
}

/** Voting pattern data (both years in one array) */
export function getVotingPatterns(): Promise<VotingPattern[]> {
  return fetchJson<VotingPattern[]>('voting-patterns.json');
}

/** Security & logistics deployment data */
export function getLogistics(): Promise<LogisticsData> {
  return fetchJson<LogisticsData>('logistics.json');
}

/** PVC collection ward-level analysis */
export function getPVCAnalysis(): Promise<PVCAnalysis> {
  return fetchJson<PVCAnalysis>('pvc-collection.json');
}

/** Election day collation summary */
export function getCollation(): Promise<CollationSummary> {
  return fetchJson<CollationSummary>('collation.json');
}

/** INEC registered voters — all polling units */
export function getPollingUnits(): Promise<PollingUnitRecord[]> {
  return fetchJson<PollingUnitRecord[]>('polling-units.json');
}
