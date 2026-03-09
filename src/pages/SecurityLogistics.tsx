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
import { Shield, Truck, Plane } from 'lucide-react';
import { Header } from '@/components/layout';
import { KPICard, ChartCard } from '@/components/cards';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useLogistics } from '@/hooks/useElectionData';
import { formatNumber, formatCurrency } from '@/utils/formatters';

const COLORS = [
  '#16a34a', '#dc2626', '#15803d', '#b91c1c', '#22c55e',
  '#ef4444', '#4ade80', '#f87171', '#86efac', '#fca5a5',
  '#166534', '#991b1b', '#a7f3d0', '#fecaca', '#bbf7d0',
  '#fee2e2',
];

export default function SecurityLogistics() {
  const { data, loading, error } = useLogistics();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return null;

  const barData = data.deployments.map((d) => ({
    name: d.lgaName,
    hilux: d.hiluxDeployed,
    choppers: d.choppersDeployed,
    personnel: d.securityPersonnel,
  }));

  const costPieData = data.deployments.map((d) => ({
    name: d.lgaName,
    value: d.totalCost,
  }));

  return (
    <>
      <Header
        title="Security & Logistics"
        subtitle="Deployment of security vehicles and personnel across LGAs"
      />

      {/* KPI Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Hilux Deployed"
          value={formatNumber(data.totalHilux)}
          icon={<Truck size={22} />}
        />
        <KPICard
          title="Choppers Deployed"
          value={formatNumber(data.totalChoppers)}
          icon={<Plane size={22} />}
        />
        <KPICard
          title="Security Personnel"
          value={formatNumber(data.totalSecurityPersonnel)}
          icon={<Shield size={22} />}
        />
        <KPICard
          title="Total Spending"
          value={formatCurrency(data.totalSpending)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vehicle deployment chart */}
        <ChartCard
          title="Vehicle Deployment per LGA"
          subtitle="Number of Hilux trucks and Choppers"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={barData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="hilux"
                name="Hilux"
                fill="#16a34a"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="choppers"
                name="Choppers"
                fill="#dc2626"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost distribution pie */}
        <ChartCard
          title="Spending Distribution"
          subtitle="Security spending per LGA"
        >
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={costPieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.06 ? `${name.split(' ')[0]}` : ''
                }
              >
                {costPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Personnel bar chart */}
      <ChartCard
        title="Security Personnel per LGA"
        subtitle="Number of personnel deployed to each Local Government Area"
        className="mt-6"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar
              dataKey="personnel"
              name="Personnel"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Full detail table */}
      <div className="card mt-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          Deployment Detail
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">LGA</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Hilux</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Choppers</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Personnel</th>
                <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.deployments.map((d) => (
                <tr key={d.lgaId} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{d.lgaName}</td>
                  <td className="px-3 py-2 text-right">{d.hiluxDeployed}</td>
                  <td className="px-3 py-2 text-right">{d.choppersDeployed}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(d.securityPersonnel)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatCurrency(d.totalCost)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 font-bold">
                <td className="px-3 py-2">TOTAL</td>
                <td className="px-3 py-2 text-right">{data.totalHilux}</td>
                <td className="px-3 py-2 text-right">{data.totalChoppers}</td>
                <td className="px-3 py-2 text-right">{formatNumber(data.totalSecurityPersonnel)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(data.totalSpending)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
