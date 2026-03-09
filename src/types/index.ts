/* ──────────────────────────────────────────────────────
   CBM Ekiti Dashboard — Shared TypeScript Types
   ────────────────────────────────────────────────────── */

// ── Geographic hierarchy ──────────────────────────────

export interface PollingUnit {
  id: string;
  name: string;
  wardId: string;
  registeredVoters: number;
  accreditedVoters: number;
  votingPoints?: number; // new voting points added
}

export interface Ward {
  id: string;
  name: string;
  lgaId: string;
  pollingUnits: number;
  registeredVoters: number;
  pvcCollected: number;
  pvcNotCollected: number;
}

export interface LGA {
  id: string;
  name: string;
  wards: number;
  pollingUnits: number;
  registeredVoters: number;
  accreditedVoters: number;
  pvcCollected: number;
  pvcNotCollected: number;
}

// ── Overview / KPI ────────────────────────────────────

export interface OverviewData {
  totalLGAs: number;
  totalWards: number;
  totalPollingUnits: number;
  totalRegisteredVoters: number;
  totalAccreditedVoters: number;
  totalPVCCollected: number;
  totalPVCNotCollected: number;
  lgas: LGA[];
}

// ── Election results ─────────────────────────────────

export type PartyCode = 'APC' | 'PDP' | string;

export interface PartyResult {
  party: PartyCode;
  votes: number;
  percentage: number;
}

export interface ElectionResultUnit {
  id: string;
  name: string;
  type: 'state' | 'lga' | 'ward' | 'polling-unit';
  parentId?: string;
  registeredVoters: number;
  accreditedVoters: number;
  totalVotesCast: number;
  validVotes: number;
  rejectedVotes: number;
  results: PartyResult[];
  winner: PartyCode;
}

export interface ElectionYear {
  year: number;
  title: string;
  results: ElectionResultUnit[];
}

export interface ElectionComparison {
  id: string;
  name: string;
  type: 'state' | 'lga' | 'ward' | 'polling-unit';
  year2018: { apc: number; pdp: number; winner: PartyCode };
  year2022: { apc: number; pdp: number; winner: PartyCode };
  swing: number; // positive = APC gained, negative = PDP gained
}

// ── Voting pattern ───────────────────────────────────

export interface VotingPattern {
  lgaId: string;
  lgaName: string;
  registeredVoters: number;
  accreditedVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  apcPercentage: number;
  pdpPercentage: number;
  othersPercentage: number;
  year: number;
}

// ── Security & Logistics ─────────────────────────────

export interface SecurityDeployment {
  lgaId: string;
  lgaName: string;
  hiluxDeployed: number;
  choppersDeployed: number;
  securityPersonnel: number;
  totalCost: number;
}

export interface LogisticsData {
  totalHilux: number;
  totalChoppers: number;
  totalSecurityPersonnel: number;
  totalSpending: number;
  deployments: SecurityDeployment[];
}

// ── PVC Collection ───────────────────────────────────

export interface PVCWardData {
  wardId: string;
  wardName: string;
  lgaId: string;
  lgaName: string;
  registeredVoters: number;
  pvcCollected: number;
  pvcNotCollected: number;
  collectionRate: number; // percentage
}

export interface PVCAnalysis {
  totalRegistered: number;
  totalCollected: number;
  totalNotCollected: number;
  overallCollectionRate: number;
  wards: PVCWardData[];
}

// ── Election Day Collation ───────────────────────────

export interface CollationEntry {
  lgaId: string;
  lgaName: string;
  wardsReported: number;
  totalWards: number;
  pusReported: number;
  totalPUs: number;
  apcVotes: number;
  pdpVotes: number;
  othersVotes: number;
  totalVotes: number;
  status: 'completed' | 'in-progress' | 'pending';
  reportingPercentage: number;
}

export interface CollationSummary {
  electionDate: string;
  totalLGAs: number;
  lgasCompleted: number;
  totalVotesCast: number;
  apcTotal: number;
  pdpTotal: number;
  othersTotal: number;
  entries: CollationEntry[];
}

// ── Navigation ───────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

// ── Cycle Comparison ─────────────────────────────────

export interface CycleComparison {
  lgaId: string;
  lgaName: string;
  registeredVoters2018: number;
  registeredVoters2022: number;
  pvcCollected2018: number;
  pvcCollected2022: number;
  accredited2018: number;
  accredited2022: number;
  voterGrowth: number;
  pvcGrowthRate: number;
}

// ── INEC Registered Voters / Polling Units ───────────

export interface PollingUnitRecord {
  sn: number;
  lga: string;
  ra: string;
  pu: string;
  delimitation: string;
  registeredVoters: number;
}
