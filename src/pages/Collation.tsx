import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Header } from '@/components/layout';
import { KPICard, ChartCard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useCollation } from '@/hooks/useElectionData';
import { formatNumber } from '@/utils/formatters';
import { ClipboardList, CheckCircle2, Vote, AlertCircle } from 'lucide-react';

const PARTY_COLORS = { APC: '#2563eb', PDP: '#dc2626', Others: '#d4d4d4' };

export default function Collation() {
  const { data, loading, error } = useCollation();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  const partyTotals = [
    { name: 'APC', value: data.apcTotal, color: PARTY_COLORS.APC },
    { name: 'PDP', value: data.pdpTotal, color: PARTY_COLORS.PDP },
    { name: 'Others', value: data.othersTotal, color: PARTY_COLORS.Others },
  ];

  const lgaBarData = data.entries.map((e) => ({
    name: e.lgaName,
    APC: e.apcVotes,
    PDP: e.pdpVotes,
    Others: e.othersVotes,
  }));

  const completionRate = Math.round(
    (data.lgasCompleted / data.totalLGAs) * 100
  );

  return (
    <>
      <Header
        title="Election Day Results Collation"
        subtitle={`${data.electionDate} — Real-time collation status`}
      />

      {/* KPI Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="LGAs Reported"
          value={`${data.lgasCompleted} / ${data.totalLGAs}`}
          icon={<ClipboardList size={22} />}
          trend={{
            value: `${completionRate}%`,
            positive: completionRate === 100,
          }}
        />
        <KPICard
          title="Total Votes Cast"
          value={formatNumber(data.totalVotesCast)}
          icon={<Vote size={22} />}
        />
        <KPICard
          title="APC Total"
          value={formatNumber(data.apcTotal)}
          icon={<CheckCircle2 size={22} />}
          subtitle={`${((data.apcTotal / data.totalVotesCast) * 100).toFixed(1)}%`}
        />
        <KPICard
          title="PDP Total"
          value={formatNumber(data.pdpTotal)}
          icon={<AlertCircle size={22} />}
          subtitle={`${((data.pdpTotal / data.totalVotesCast) * 100).toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Party vote split pie */}
        <ChartCard title="Party Vote Share" subtitle="All LGAs combined">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={partyTotals}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {partyTotals.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* LGA bar chart */}
        <ChartCard
          title="Votes per LGA"
          subtitle="APC vs PDP vs Others"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
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
              <Bar dataKey="APC" fill={PARTY_COLORS.APC} radius={[2, 2, 0, 0]} />
              <Bar dataKey="PDP" fill={PARTY_COLORS.PDP} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Others" fill={PARTY_COLORS.Others} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Collation Table */}
      <div className="card mt-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          LGA Collation Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center">Status</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Wards</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PUs</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">APC</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PDP</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Others</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Total</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-center">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.entries.map((e) => {
                const winner =
                  e.apcVotes > e.pdpVotes
                    ? 'APC'
                    : e.pdpVotes > e.apcVotes
                    ? 'PDP'
                    : 'TIE';
                return (
                  <tr key={e.lgaId} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{e.lgaName}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`badge ${
                          e.status === 'completed'
                            ? 'badge-success'
                            : e.status === 'in-progress'
                            ? 'badge-warning'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {e.status === 'completed'
                          ? '✓ Complete'
                          : e.status === 'in-progress'
                          ? '⏳ In Progress'
                          : '⏸ Pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {e.wardsReported}/{e.totalWards}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {e.pusReported}/{e.totalPUs}
                    </td>
                    <td className="px-3 py-2 text-right text-apc font-medium">
                      {formatNumber(e.apcVotes)}
                    </td>
                    <td className="px-3 py-2 text-right text-pdp font-medium">
                      {formatNumber(e.pdpVotes)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {formatNumber(e.othersVotes)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">
                      {formatNumber(e.totalVotes)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`badge ${
                          winner === 'APC' ? 'badge-apc' : 'badge-pdp'
                        }`}
                      >
                        {winner}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                <td className="px-3 py-2">TOTAL</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right text-apc">
                  {formatNumber(data.apcTotal)}
                </td>
                <td className="px-3 py-2 text-right text-pdp">
                  {formatNumber(data.pdpTotal)}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {formatNumber(data.othersTotal)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatNumber(data.totalVotesCast)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="badge badge-apc font-bold">
                    {data.apcTotal > data.pdpTotal ? 'APC' : 'PDP'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
