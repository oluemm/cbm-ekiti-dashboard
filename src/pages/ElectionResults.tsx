import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { Header } from '@/components/layout';
import { ChartCard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useElectionResults } from '@/hooks/useElectionData';
import { formatNumber, formatPercent, deltaArrow, deltaColor } from '@/utils/formatters';
import type { ElectionResultUnit } from '@/types';

export default function ElectionResults() {
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const { data: data2018, loading: l18, error: e18 } = useElectionResults(2018);
  const { data: data2022, loading: l22, error: e22 } = useElectionResults(2022);

  const loading = l18 || l22;
  const error = e18 || e22;

  const currentData = selectedYear === 2018 ? data2018 : data2022;

  // Build comparison data across both years
  const comparisonData = useMemo(() => {
    if (!data2018 || !data2022) return [];

    const lgas2018 = data2018.results.filter((r) => r.type === 'lga');
    const lgas2022 = data2022.results.filter((r) => r.type === 'lga');

    return lgas2018.map((lga18) => {
      const lga22 = lgas2022.find((l) =>
        l.name === lga18.name
      );
      const apc18 = lga18.results.find((r) => r.party === 'APC')?.percentage ?? 0;
      const pdp18 = lga18.results.find((r) => r.party === 'PDP')?.percentage ?? 0;
      const apc22 = lga22?.results.find((r) => r.party === 'APC')?.percentage ?? 0;
      const pdp22 = lga22?.results.find((r) => r.party === 'PDP')?.percentage ?? 0;

      return {
        name: lga18.name,
        apc2018: apc18,
        pdp2018: pdp18,
        apc2022: apc22,
        pdp2022: pdp22,
        apcSwing: +(apc22 - apc18).toFixed(1),
        pdpSwing: +(pdp22 - pdp18).toFixed(1),
        winner2018: lga18.winner,
        winner2022: lga22?.winner ?? '',
      };
    });
  }, [data2018, data2022]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!currentData) return null;

  const stateResult = currentData.results.find((r) => r.type === 'state');
  const lgaResults = currentData.results.filter((r) => r.type === 'lga');

  const lgaBarData = lgaResults.map((lga) => ({
    name: lga.name,
    APC: lga.results.find((r) => r.party === 'APC')?.votes ?? 0,
    PDP: lga.results.find((r) => r.party === 'PDP')?.votes ?? 0,
    winner: lga.winner,
  }));

  return (
    <>
      <Header
        title="Election Results"
        subtitle="APC vs PDP head-to-head comparison across election cycles"
      />

      {/* Year Toggle */}
      <div className="mb-6 flex items-center gap-2">
        {[2018, 2022].map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedYear === year
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {year} Election
          </button>
        ))}
      </div>

      {/* State-level result summary */}
      {stateResult && (
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Winner — {selectedYear}</p>
              <p className="text-xl font-bold">
                <span
                  className={
                    stateResult.winner === 'APC'
                      ? 'text-apc'
                      : 'text-pdp'
                  }
                >
                  {stateResult.winner}
                </span>
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            {stateResult.results.map((pr) => (
              <div key={pr.party}>
                <p className="text-xs text-gray-500">{pr.party}</p>
                <p className="text-lg font-bold">
                  {formatNumber(pr.votes)}{' '}
                  <span className="text-sm font-normal text-gray-400">
                    ({formatPercent(pr.percentage)})
                  </span>
                </p>
              </div>
            ))}
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-xs text-gray-500">Total Votes Cast</p>
              <p className="text-lg font-bold">
                {formatNumber(stateResult.totalVotesCast)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Valid Votes</p>
              <p className="text-lg font-bold">
                {formatNumber(stateResult.validVotes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-lg font-bold text-red-500">
                {formatNumber(stateResult.rejectedVotes)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LGA Results Bar Chart */}
      <ChartCard
        title={`${selectedYear} Results by LGA`}
        subtitle="APC vs PDP vote counts per Local Government Area"
        className="mb-6"
      >
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={lgaBarData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => formatNumber(v)} />
            <Legend />
            <Bar dataKey="APC" fill="#2563eb" radius={[2, 2, 0, 0]} />
            <Bar dataKey="PDP" fill="#dc2626" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2018 vs 2022 Comparison Table */}
      {comparisonData.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            2018 vs 2022 — Swing Analysis
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            Shows percentage-point swing for each party between elections. Positive = gained, Negative = lost.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center">Winner '18</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center">Winner '22</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">APC '18</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">APC '22</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">APC Swing</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PDP '18</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PDP '22</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PDP Swing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonData.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{row.name}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`badge ${row.winner2018 === 'APC' ? 'badge-apc' : 'badge-pdp'}`}>
                        {row.winner2018}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`badge ${row.winner2022 === 'APC' ? 'badge-apc' : 'badge-pdp'}`}>
                        {row.winner2022}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{formatPercent(row.apc2018)}</td>
                    <td className="px-3 py-2 text-right">{formatPercent(row.apc2022)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${deltaColor(row.apcSwing)}`}>
                      {deltaArrow(row.apcSwing)} {Math.abs(row.apcSwing)}pp
                    </td>
                    <td className="px-3 py-2 text-right">{formatPercent(row.pdp2018)}</td>
                    <td className="px-3 py-2 text-right">{formatPercent(row.pdp2022)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${deltaColor(row.pdpSwing)}`}>
                      {deltaArrow(row.pdpSwing)} {Math.abs(row.pdpSwing)}pp
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed LGA Results Table */}
      <div className="card mt-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          {selectedYear} — Detailed LGA Results
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Registered</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Accredited</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Total Cast</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">APC</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PDP</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Others</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lgaResults.map((lga: ElectionResultUnit) => {
                const apc = lga.results.find((r) => r.party === 'APC');
                const pdp = lga.results.find((r) => r.party === 'PDP');
                const others = lga.results.find((r) => r.party === 'Others');
                return (
                  <tr key={lga.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{lga.name}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(lga.registeredVoters)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(lga.accreditedVoters)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(lga.totalVotesCast)}</td>
                    <td className="px-3 py-2 text-right text-apc font-medium">
                      {formatNumber(apc?.votes ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right text-pdp font-medium">
                      {formatNumber(pdp?.votes ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {formatNumber(others?.votes ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`badge ${lga.winner === 'APC' ? 'badge-apc' : 'badge-pdp'}`}>
                        {lga.winner}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
