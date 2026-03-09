import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  MapPin,
  Users,
  Landmark,
  CreditCard,
  Building2,
  Vote,
} from 'lucide-react';
import { Header } from '@/components/layout';
import { KPICard, ChartCard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useOverview } from '@/hooks/useElectionData';
import { formatNumber, formatPercent } from '@/utils/formatters';

const PVC_COLORS = ['#16a34a', '#dc2626'];

export default function Overview() {
  const { data, loading, error } = useOverview();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  const pvcData = [
    { name: 'Collected', value: data.totalPVCCollected },
    { name: 'Not Collected', value: data.totalPVCNotCollected },
  ];

  const lgaChartData = data.lgas.map((l) => ({
    name: l.name,
    registered: l.registeredVoters,
    accredited: l.accreditedVoters,
    pvc: l.pvcCollected,
  }));

  const collectionRate =
    (data.totalPVCCollected / (data.totalPVCCollected + data.totalPVCNotCollected)) * 100;

  return (
    <>
      <Header
        title="Dashboard Overview"
        subtitle="Ekiti State Election Portal — Key metrics at a glance"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="LGAs"
          value={data.totalLGAs}
          icon={<Building2 size={22} />}
        />
        <KPICard
          title="Wards"
          value={formatNumber(data.totalWards)}
          icon={<MapPin size={22} />}
        />
        <KPICard
          title="Polling Units"
          value={formatNumber(data.totalPollingUnits)}
          icon={<Vote size={22} />}
        />
        <KPICard
          title="Registered Voters"
          value={formatNumber(data.totalRegisteredVoters)}
          icon={<Users size={22} />}
        />
        <KPICard
          title="PVC Collected"
          value={formatNumber(data.totalPVCCollected)}
          icon={<CreditCard size={22} />}
          subtitle={formatPercent(collectionRate)}
          trend={{ value: formatPercent(collectionRate), positive: collectionRate > 75 }}
        />
        <KPICard
          title="PVC Not Collected"
          value={formatNumber(data.totalPVCNotCollected)}
          icon={<Landmark size={22} />}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* PVC Donut */}
        <ChartCard
          title="PVC Collection Status"
          subtitle="Percentage of PVCs collected vs outstanding"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pvcData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {pvcData.map((_, i) => (
                  <Cell key={i} fill={PVC_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Registered vs Accredited */}
        <ChartCard
          title="Registered vs Accredited Voters"
          subtitle="Per LGA breakdown"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={lgaChartData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatNumber(v)} />
              <Legend />
              <Bar
                dataKey="registered"
                name="Registered"
                fill="#16a34a"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="accredited"
                name="Accredited"
                fill="#dc2626"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* LGA Summary Table */}
      <div className="mt-6 card">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          LGA Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Wards</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PUs</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Registered</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">PVC Collected</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Collection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.lgas.map((lga) => {
                const rate = (lga.pvcCollected / lga.registeredVoters) * 100;
                return (
                  <tr key={lga.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{lga.name}</td>
                    <td className="px-3 py-2 text-right">{lga.wards}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(lga.pollingUnits)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(lga.registeredVoters)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(lga.pvcCollected)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`badge ${
                          rate > 80 ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {formatPercent(rate)}
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
