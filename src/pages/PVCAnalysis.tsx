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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Header } from '@/components/layout';
import { KPICard, ChartCard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { usePVCAnalysis } from '@/hooks/useElectionData';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

const PVC_COLORS = ['#16a34a', '#dc2626'];

export default function PVCAnalysis() {
  const { data, loading, error } = usePVCAnalysis();
  const [selectedLGA, setSelectedLGA] = useState<string>('all');

  const lgaOptions = useMemo(() => {
    if (!data) return [];
    const unique = [...new Set(data.wards.map((w) => w.lgaName))];
    return unique.sort();
  }, [data]);

  const filteredWards = useMemo(() => {
    if (!data) return [];
    if (selectedLGA === 'all') return data.wards;
    return data.wards.filter((w) => w.lgaName === selectedLGA);
  }, [data, selectedLGA]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  // Aggregate by LGA for bar chart
  const lgaAggregated = lgaOptions.map((lgaName) => {
    const wards = data.wards.filter((w) => w.lgaName === lgaName);
    const collected = wards.reduce((s, w) => s + w.pvcCollected, 0);
    const notCollected = wards.reduce((s, w) => s + w.pvcNotCollected, 0);
    const total = collected + notCollected;
    return {
      name: lgaName,
      collected,
      notCollected,
      rate: total > 0 ? +((collected / total) * 100).toFixed(1) : 0,
    };
  });

  const pvcDonut = [
    { name: 'Collected', value: data.totalCollected },
    { name: 'Not Collected', value: data.totalNotCollected },
  ];

  return (
    <>
      <Header
        title="PVC Collection Analysis"
        subtitle="Ekiti Gubernatorial Logistics — Ward-level PVC collection rates"
      />

      {/* KPI Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Registered"
          value={formatNumber(data.totalRegistered)}
          icon={<CreditCard size={22} />}
        />
        <KPICard
          title="PVC Collected"
          value={formatNumber(data.totalCollected)}
          icon={<CheckCircle size={22} />}
          trend={{
            value: formatPercent(data.overallCollectionRate),
            positive: true,
          }}
        />
        <KPICard
          title="PVC Not Collected"
          value={formatNumber(data.totalNotCollected)}
          icon={<XCircle size={22} />}
        />
        <KPICard
          title="Collection Rate"
          value={formatPercent(data.overallCollectionRate)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Donut */}
        <ChartCard title="Overall PVC Status" subtitle="Collected vs Outstanding">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pvcDonut}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {pvcDonut.map((_, i) => (
                  <Cell key={i} fill={PVC_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* LGA collection rate bar */}
        <ChartCard
          title="Collection Rate by LGA"
          subtitle="Percentage of PVCs collected per LGA"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={lgaAggregated} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" name="Collection Rate %" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Stacked bar: collected vs not */}
      <ChartCard
        title="PVC Collected vs Not Collected by LGA"
        subtitle="Absolute numbers stacked"
        className="mt-6"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={lgaAggregated} margin={{ left: 10, right: 10 }}>
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
            <Bar dataKey="collected" name="Collected" stackId="a" fill="#16a34a" />
            <Bar dataKey="notCollected" name="Not Collected" stackId="a" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Ward-level table */}
      <div className="card mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Ward-Level PVC Collection
          </h3>
          <select
            value={selectedLGA}
            onChange={(e) => setSelectedLGA(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All LGAs</option>
            {lgaOptions.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">Ward</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Registered</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Collected</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Not Collected</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWards.map((w) => (
                <tr key={w.wardId} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{w.wardName}</td>
                  <td className="px-3 py-2 text-gray-500">{w.lgaName}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(w.registeredVoters)}</td>
                  <td className="px-3 py-2 text-right text-green-600 font-medium">
                    {formatNumber(w.pvcCollected)}
                  </td>
                  <td className="px-3 py-2 text-right text-red-600 font-medium">
                    {formatNumber(w.pvcNotCollected)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={`badge ${w.collectionRate > 80 ? 'badge-success' : 'badge-warning'}`}>
                      {formatPercent(w.collectionRate)}
                    </span>
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
