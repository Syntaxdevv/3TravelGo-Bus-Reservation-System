import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getAdminReports,
  type AdminReports,
} from "../../services/adminReports";

const COLORS = [
  "#2563EB",
  "#0D9488",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#64748B",
  "#06B6D4",
  "#84CC16",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-PH").format(Number(value || 0));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const titleCase = (value: string) =>
  String(value || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

interface ChartItem {
  label: string;
  value: number;
}

function SummaryCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-700">
          <i className={`fa-solid ${icon}`} />
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function MonthlyBarChart({
  title,
  subtitle,
  data,
  currency = false,
}: {
  title: string;
  subtitle: string;
  data: { month: string; total: number }[];
  currency?: boolean;
}) {
  const chartData = data.map((item) => ({
    month: item.month,
    total: Number(item.total || 0),
  }));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-6">
        <h3 className="font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          No monthly data available.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={currency ? 75 : 40}
                tickFormatter={(value: number) =>
                  currency ? `₱${formatNumber(value)}` : formatNumber(value)
                }
              />

              <Tooltip
                formatter={(value) => [
                  currency
                    ? formatCurrency(Number(value))
                    : formatNumber(Number(value)),
                  currency ? "Demo Revenue" : "Reservations",
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="total"
                fill={currency ? "#0D9488" : "#2563EB"}
                radius={[5, 5, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function StatusPieChart({
  title,
  subtitle,
  data,
  currency = false,
}: {
  title: string;
  subtitle: string;
  data: ChartItem[];
  currency?: boolean;
}) {
  const chartData = data.filter((item) => Number(item.value) > 0);

  const total = chartData.reduce((sum, item) => sum + Number(item.value), 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      {chartData.length === 0 || total === 0 ? (
        <div className="flex h-60 items-center justify-center text-sm text-slate-400">
          No data available.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
          <div className="relative h-56 w-full max-w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={`${item.label}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    currency
                      ? formatCurrency(Number(value))
                      : formatNumber(Number(value)),
                    "Total",
                  ]}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-900">
                {currency ? formatCurrency(total) : formatNumber(total)}
              </span>

              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {chartData.map((item, index) => {
              const percentage = (Number(item.value) / total) * 100;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />

                    <span className="truncate text-sm text-slate-600">
                      {item.label}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {currency
                        ? formatCurrency(Number(item.value))
                        : formatNumber(Number(item.value))}
                    </p>

                    <p className="text-xs text-slate-400">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Reports() {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const result = await getAdminReports();

        if (active) {
          setReports(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load reports.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-600" />

          <p className="mt-3 text-sm text-slate-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error || !reports) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <i className="fa-solid fa-circle-exclamation text-3xl text-red-500" />

        <h3 className="mt-3 font-bold text-slate-800">
          Unable to Load Reports
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {error || "No report data was returned."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const overview = reports.overview;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview and performance of your bus reservation system.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <i className="fa-solid fa-print" />
          Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Reservations"
          value={formatNumber(overview.total_reservations)}
          icon="fa-ticket"
          description="All recorded bookings"
        />

        <SummaryCard
          label="Total Payments"
          value={formatNumber(overview.total_payments)}
          icon="fa-credit-card"
          description="All payment records"
        />

        <SummaryCard
          label="Demo Revenue"
          value={formatCurrency(overview.demo_revenue)}
          icon="fa-peso-sign"
          description="Recorded demo-paid amounts only"
        />

        <SummaryCard
          label="Total Trips"
          value={formatNumber(overview.total_trips)}
          icon="fa-bus"
          description="All recorded trips"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <MonthlyBarChart
          title="Monthly Reservations"
          subtitle="Number of reservations recorded each month"
          data={reports.monthly_reservations}
        />

        <MonthlyBarChart
          title="Monthly Demo Revenue"
          subtitle="Recorded demo-paid amounts each month"
          data={reports.monthly_revenue}
          currency
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatusPieChart
          title="Reservation Status"
          subtitle="Distribution of booking records by status"
          data={reports.booking_summary.map((item) => ({
            label: titleCase(item.booking_status),
            value: Number(item.total),
          }))}
        />

        <StatusPieChart
          title="Payment Status"
          subtitle="Distribution of payment records by status"
          data={reports.payment_summary.map((item) => ({
            label: titleCase(item.payment_status),
            value: Number(item.total),
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatusPieChart
          title="Payment Methods"
          subtitle="Distribution of transactions by payment method"
          data={reports.payment_methods.map((item) => ({
            label: titleCase(item.payment_method),
            value: Number(item.total),
          }))}
        />

        <StatusPieChart
          title="Trip Status"
          subtitle="Distribution of recorded trip statuses"
          data={reports.trip_statuses.map((item) => ({
            label: titleCase(item.status),
            value: Number(item.total),
          }))}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <h3 className="font-bold text-slate-800">Top Routes</h3>

          <p className="mt-1 text-xs text-slate-500">
            Routes with the highest number of reservations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-4">Origin</th>
                <th className="py-3 pr-4">Destination</th>
                <th className="py-3 text-right">Reservations</th>
              </tr>
            </thead>

            <tbody>
              {reports.top_routes.map((route, index) => (
                <tr
                  key={`${route.origin_name}-${route.destination_name}-${index}`}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 pr-4 font-medium text-slate-700">
                    {route.origin_name || "Unknown"}
                  </td>

                  <td className="py-3 pr-4 text-slate-600">
                    {route.destination_name || "Unknown"}
                  </td>

                  <td className="py-3 text-right font-semibold text-slate-800">
                    {formatNumber(Number(route.total_reservations))}
                  </td>
                </tr>
              ))}

              {reports.top_routes.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No route records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
