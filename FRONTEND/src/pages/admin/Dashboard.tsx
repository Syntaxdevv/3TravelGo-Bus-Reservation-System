import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  type AdminDashboardData,
  type Reservation,
} from "../../services/adminDashboard";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminDashboard();

        if (active) {
          setDashboard(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const statistics = [
    {
      label: "Total Reservations",
      value: dashboard?.totalReservations ?? 0,
      note: "All-time bookings",
      icon: "fa-ticket",
      color: "bg-[#EAF1FF] text-[#2563EB]",
    },
    {
      label: "Total Trips",
      value: dashboard?.totalTrips ?? 0,
      note: "Scheduled trips",
      icon: "fa-bus-simple",
      color: "bg-[#DDF7F2] text-[#0D9488]",
    },
    {
      label: "Total Passengers",
      value: dashboard?.totalPassengers ?? 0,
      note: "Passenger records",
      icon: "fa-users",
      color: "bg-[#FFF3D6] text-[#B7791F]",
    },
    {
      label: "Total Payments",
      value: dashboard?.totalPayments ?? 0,
      note: "Payment records",
      icon: "fa-credit-card",
      color: "bg-[#EFE8FF] text-[#7952C8]",
    },
  ];

  const recentReservations: Reservation[] = dashboard?.recentReservations ?? [];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-7">
        <h1 className="text-[29px] font-extrabold tracking-tight text-[#142D4E] max-sm:text-[25px]">
          Dashboard
        </h1>
        <p className="mt-[7px] text-sm text-[#71829B]">
          Welcome back, Admin! Here's your system overview.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}

      <div className="mb-7 grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-[150px] w-full items-center gap-5 rounded-[13px] border border-[#E7EDF5] bg-white px-6 py-5 shadow-[0_3px_14px_rgba(20,45,78,0.035)] transition-shadow hover:shadow-[0_6px_18px_rgba(20,45,78,0.07)]"
          >
            <div
              className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[13px] text-[21px] ${stat.color}`}
            >
              <i className={`fa-solid ${stat.icon}`} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="mb-2 text-[13px] font-semibold leading-5 text-[#71829B]">
                {stat.label}
              </p>

              <h2 className="text-[29px] font-extrabold leading-none text-[#142D4E]">
                {loading ? "..." : formatNumber(stat.value)}
              </h2>

              <p className="mt-2 text-xs leading-4 text-[#8997AA]">
                {stat.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="w-full overflow-hidden rounded-[13px] border border-[#E7EDF5] bg-white p-6 shadow-[0_3px_14px_rgba(20,45,78,0.035)] max-sm:p-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#142D4E]">
              Recent Reservations
            </h2>
            <p className="mt-[6px] text-[13px] text-[#71829B]">
              Latest bookings recorded in the system.
            </p>
          </div>

          <a
            href="/admin/reservations"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] font-bold text-[#2563EB] transition-colors hover:text-[#0D9488]"
          >
            View All
            <i className="fa-solid fa-arrow-right" />
          </a>
        </div>

        <div className="w-full overflow-x-auto rounded-[9px] border border-[#E7EDF5]">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F4F7FB]">
                {[
                  "BOOKING ID",
                  "PASSENGER",
                  "TRIP",
                  "BOOKING DATE",
                  "STATUS",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-[18px] py-4 text-[11px] font-extrabold tracking-[0.5px] text-[#71829B]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-[#8997AA]"
                  >
                    <i className="fa-solid fa-spinner fa-spin mr-2" />
                    Loading reservations...
                  </td>
                </tr>
              ) : recentReservations.length > 0 ? (
                recentReservations.map((reservation) => (
                  <tr
                    key={reservation.booking_id}
                    className="border-t border-[#E7EDF5] transition-colors hover:bg-[#FAFCFF]"
                  >
                    <td className="whitespace-nowrap px-[18px] py-4 text-[13px] text-[#26364B]">
                      {reservation.booking_id}
                    </td>
                    <td className="px-[18px] py-4 text-[13px] text-[#26364B]">
                      {reservation.passenger_name || "—"}
                    </td>
                    <td className="px-[18px] py-4 text-[13px] text-[#26364B]">
                      {reservation.trip_name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-[18px] py-4 text-[13px] text-[#26364B]">
                      {reservation.booking_date || "—"}
                    </td>
                    <td className="px-[18px] py-4 text-[13px] text-[#26364B]">
                      {reservation.status || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="mx-auto mb-[17px] grid h-[68px] w-[68px] place-items-center rounded-[20px] bg-[#E7F7F5] text-[27px] text-[#0D9488]">
                      <i className="fa-solid fa-bus-simple" />
                    </div>
                    <h3 className="mb-[7px] text-[15px] font-bold text-[#142D4E]">
                      No reservation data available
                    </h3>
                    <p className="text-[13px] text-[#8997AA]">
                      New reservations will appear here when available.
                    </p>
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
