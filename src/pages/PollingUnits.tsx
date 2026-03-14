import { useState, useMemo } from 'react';
import { MapPin, Building2, Vote, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout';
import { KPICard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import { usePollingUnits } from '@/hooks/useElectionData';
import { formatNumber } from '@/utils/formatters';

const PAGE_SIZE = 50;

export default function PollingUnits() {
  const { data, loading, error } = usePollingUnits();

  const [selectedLGAs, setSelectedLGAs] = useState<string[]>([]);
  const [selectedRAs, setSelectedRAs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Derive unique LGAs
  const allLGAs = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((d) => d.lga))].sort();
  }, [data]);

  // Derive RAs cascaded from selected LGAs
  const availableRAs = useMemo(() => {
    if (!data) return [];
    const pool =
      selectedLGAs.length > 0
        ? data.filter((d) => selectedLGAs.includes(d.lga))
        : data;
    return [...new Set(pool.map((d) => d.ra))].sort();
  }, [data, selectedLGAs]);

  // Reset RA selection when LGA filter changes
  const handleLGAChange = (newLGAs: string[]) => {
    setSelectedLGAs(newLGAs);
    // Remove any RA selections that are no longer valid
    if (data) {
      const validRAs = new Set(
        data
          .filter((d) => newLGAs.length === 0 || newLGAs.includes(d.lga))
          .map((d) => d.ra)
      );
      setSelectedRAs((prevRAs) => prevRAs.filter((ra) => validRAs.has(ra)));
    }
    setPage(1);
  };

  // Filtered data
  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;

    if (selectedLGAs.length > 0) {
      result = result.filter((d) => selectedLGAs.includes(d.lga));
    }
    if (selectedRAs.length > 0) {
      result = result.filter((d) => selectedRAs.includes(d.ra));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.pu.toLowerCase().includes(q) ||
          d.delimitation.toLowerCase().includes(q) ||
          d.ra.toLowerCase().includes(q)
      );
    }

    return result;
  }, [data, selectedLGAs, selectedRAs, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // KPI stats for current filter
  const stats = useMemo(() => {
    const lgas = new Set(filtered.map((d) => d.lga));
    const ras = new Set(filtered.map((d) => d.ra));
    const totalVoters = filtered.reduce((s, d) => s + d.registeredVoters, 0);
    return {
      lgaCount: lgas.size,
      raCount: ras.size,
      puCount: filtered.length,
      totalVoters,
    };
  }, [filtered]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  return (
    <>
      <Header
        title="INEC Polling Units"
        subtitle="Final Ekiti State registered voters — breakdown by LGA, Registration Area & Polling Unit"
      />

      {/* KPI Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="LGAs"
          value={stats.lgaCount}
          icon={<Building2 size={22} />}
        />
        <KPICard
          title="Registration Areas"
          value={formatNumber(stats.raCount)}
          icon={<MapPin size={22} />}
        />
        <KPICard
          title="Polling Units"
          value={formatNumber(stats.puCount)}
          icon={<Vote size={22} />}
        />
        <KPICard
          title="Registered Voters"
          value={formatNumber(stats.totalVoters)}
          icon={<Users size={22} />}
        />
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* LGA Filter */}
          <MultiSelectDropdown
            label="LGA Filter"
            placeholder="Select LGAs..."
            options={allLGAs}
            selected={selectedLGAs}
            onChange={(newLGAs) => {
              handleLGAChange(newLGAs);
            }}
          />

          {/* RA Filter */}
          <MultiSelectDropdown
            label="Registration Area (Ward) Filter"
            placeholder="Select wards..."
            options={availableRAs}
            selected={selectedRAs}
            onChange={(newRAs) => {
              setSelectedRAs(newRAs);
              setPage(1);
            }}
            disabled={selectedLGAs.length === 0}
          />

          {/* Search */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
              Polling Unit Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or code..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-2 text-xs text-gray-400">
              Showing {formatNumber(filtered.length)} of{' '}
              {formatNumber(data.length)} polling units
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Polling Unit Directory
          </h3>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gradient-to-r from-green-500 to-gray-900">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  LGA
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Registration Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Polling Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-white">
                  Regd Voters
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-white">
                  PVC Collected
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-white">
                  PVC Not Collected
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((row, idx) => (
                <tr
                  key={`${row.ra}-${idx}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{row.lga}</td>
                  <td className="px-4 py-3">{row.ra}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.pu}>
                    {row.pu}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-primary-700">
                    {formatNumber(row.registeredVoters)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-primary-700">
                    {formatNumber(row.pvcCollected)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    {formatNumber(row.pvcNotCollected)}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No polling units match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
              {formatNumber(filtered.length)} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page number buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`rounded px-2.5 py-1 text-xs ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
