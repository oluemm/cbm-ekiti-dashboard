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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Header } from '@/components/layout';
import { ChartCard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useVotingPatterns } from '@/hooks/useElectionData';
import { formatNumber, formatPercent } from '@/utils/formatters';

export default function VotingPattern() {
  const { data, loading, error } = useVotingPatterns();
  const [selectedYear, setSelectedYear] = useState<number>(2022);

  const yearData = useMemo(
    () => data?.filter((d) => d.year === selectedYear) ?? [],
    [data, selectedYear]
  );

  const comparisonData = useMemo(() => {
    if (!data) return [];
    const lgas2018 = data.filter((d) => d.year === 2018);
    const lgas2022 = data.filter((d) => d.year === 2022);

    return lgas2018.map((lga18) => {
      const lga22 = lgas2022.find((l) => l.lgaId === lga18.lgaId);
      return {
        name: lga18.lgaName,
        turnout2018: lga18.turnoutPercentage,
        turnout2022: lga22?.turnoutPercentage ?? 0,
      };
    });
  }, [data]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  const turnoutBarData = yearData.map((d) => ({
    name: d.lgaName,
    turnout: d.turnoutPercentage,
    apc: d.apcPercentage,
    pdp: d.pdpPercentage,
    others: d.othersPercentage,
  }));

  const radarData = yearData.map((d) => ({
    lga: d.lgaName,
    APC: d.apcPercentage,
    PDP: d.pdpPercentage,
  }));

  const avgTurnout =
    yearData.reduce((sum, d) => sum + d.turnoutPercentage, 0) / yearData.length;

  return (
    <>
      <Header
        title="Results & Voting Pattern"
        subtitle="Voter turnout analysis and party vote distribution across LGAs"
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
            {year}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Average Turnout</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatPercent(avgTurnout)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Highest Turnout LGA</p>
          <p className="text-lg font-bold">
            {yearData.sort((a, b) => b.turnoutPercentage - a.turnoutPercentage)[0]?.lgaName}
          </p>
          <p className="text-sm text-green-600">
            {formatPercent(
              yearData.sort((a, b) => b.turnoutPercentage - a.turnoutPercentage)[0]
                ?.turnoutPercentage ?? 0
            )}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Lowest Turnout LGA</p>
          <p className="text-lg font-bold">
            {yearData.sort((a, b) => a.turnoutPercentage - b.turnoutPercentage)[0]?.lgaName}
          </p>
          <p className="text-sm text-red-600">
            {formatPercent(
              yearData.sort((a, b) => a.turnoutPercentage - b.turnoutPercentage)[0]
                ?.turnoutPercentage ?? 0
            )}
          </p>
        </div>
      </div>

      {/* Turnout comparison (2018 vs 2022) */}
      <ChartCard
        title="Voter Turnout: 2018 vs 2022"
        subtitle="Turnout percentage comparison across LGAs"
        className="mb-6"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={comparisonData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Legend />
            <Bar
              dataKey="turnout2018"
              name="2018 Turnout"
              fill="#16a34a"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="turnout2022"
              name="2022 Turnout"
              fill="#dc2626"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Party Vote Share */}
        <ChartCard
          title={`${selectedYear} — Party Vote Share by LGA`}
          subtitle="APC vs PDP vs Others (%)"
        >
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={turnoutBarData}
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10 }}
                width={75}
              />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="apc" name="APC" stackId="a" fill="#2563eb" />
              <Bar dataKey="pdp" name="PDP" stackId="a" fill="#dc2626" />
              <Bar dataKey="others" name="Others" stackId="a" fill="#d4d4d4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar Chart */}
        <ChartCard
          title={`${selectedYear} — APC vs PDP Spread`}
          subtitle="Radar view of party strength across LGAs"
        >
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="lga" tick={{ fontSize: 8 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar
                name="APC"
                dataKey="APC"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.2}
              />
              <Radar
                name="PDP"
                dataKey="PDP"
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.2}
              />
              <Legend />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Table */}
      <div className="card mt-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          {selectedYear} — Detailed Voting Pattern
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Registered</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Accredited</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Votes Cast</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Turnout</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">APC %</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PDP %</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Others %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {yearData.map((d) => (
                <tr key={d.lgaId} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{d.lgaName}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(d.registeredVoters)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(d.accreditedVoters)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(d.totalVotesCast)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`badge ${d.turnoutPercentage > 40 ? 'badge-success' : 'badge-warning'}`}>
                      {formatPercent(d.turnoutPercentage)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-apc font-medium">
                    {formatPercent(d.apcPercentage)}
                  </td>
                  <td className="px-3 py-2 text-right text-pdp font-medium">
                    {formatPercent(d.pdpPercentage)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {formatPercent(d.othersPercentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
