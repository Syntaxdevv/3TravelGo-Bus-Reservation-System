import { useEffect, useState } from "react";
import {
  BusFront,
  Ticket,
  Clock,
  CircleCheck,
  CalendarDays,
  FolderOpen,
} from "lucide-react";

interface DashboardProps {
  staff?: {
    name?: string;
  };
}

interface Booking {
  booking_reference: string;
  full_name: string;
  travel_date: string;
  seat_number: string;
  booking_status: string;
}

interface UpcomingTrip {
  travel_date: string;
  departure_time: string;
  operator_name: string;
  bus_type: string;
  arrival_time: string;
  fare: number | string;
}

interface DashboardData {
  todayTrips: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  recentBookings: Booking[];
  upcomingTrips: UpcomingTrip[];
}

interface DashboardApiResponse {
  success: boolean;
  message?: string;
  data?: DashboardData;
}

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-[#FEF3C7] text-[#A16207]";
    case "confirmed":
      return "bg-[#DCFCE7] text-[#15803D]";
    case "cancelled":
      return "bg-[#FEE2E2] text-[#B91C1C]";
    default:
      return "bg-[#E2E8F0] text-[#475569]";
  }
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "-";

  const [hours, minutes] = time.split(":");
  const parsedHours = Number(hours);

  if (Number.isNaN(parsedHours)) {
    return time;
  }

  const period = parsedHours >= 12 ? "PM" : "AM";
  const displayHours = parsedHours % 12 || 12;

  return `${displayHours}:${minutes || "00"} ${period}`;
}

export default function Dashboard(_props: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/staff/dashboard", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        const result: DashboardApiResponse = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Your staff session has expired. Please log in again.",
            );
          }

          throw new Error(
            result.message || "Unable to load dashboard information.",
          );
        }

        if (!result.success || !result.data) {
          throw new Error(
            result.message || "Invalid dashboard response from server.",
          );
        }

        setDashboardData(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Staff dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the dashboard.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      controller.abort();
    };
  }, []);

  const todayTrips = dashboardData?.todayTrips ?? 0;
  const totalBookings = dashboardData?.totalBookings ?? 0;
  const pendingBookings = dashboardData?.pendingBookings ?? 0;
  const confirmedBookings = dashboardData?.confirmedBookings ?? 0;

  const recentBookings = dashboardData?.recentBookings ?? [];
  const upcomingTrips = dashboardData?.upcomingTrips ?? [];

  const stats = [
    {
      label: "Today's Trips",
      value: todayTrips,
      caption: "Scheduled for today",
      icon: BusFront,
      iconStyle: "bg-[#EAF1FF] text-[#2563EB]",
    },
    {
      label: "Total Reservations",
      value: totalBookings,
      caption: "All recorded bookings",
      icon: Ticket,
      iconStyle: "bg-[#E6F6F3] text-[#0D9488]",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings,
      caption: "Awaiting confirmation",
      icon: Clock,
      iconStyle: "bg-[#FFF4E5] text-[#D97706]",
    },
    {
      label: "Confirmed Bookings",
      value: confirmedBookings,
      caption: "Successfully confirmed",
      icon: CircleCheck,
      iconStyle: "bg-[#E8F7ED] text-[#16A34A]",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="w-full min-w-0">
      <div className="mb-[27px] flex flex-col items-start justify-between gap-[15px] min-[601px]:flex-row min-[601px]:items-end">
        <div>
          <h1 className="m-0 text-[25px] font-extrabold tracking-[-0.6px] text-[#142D4E]">
            Dashboard Overview
          </h1>

          <p className="mt-[7px] text-[13px] text-[#8996A8]">
            Monitor reservations and daily bus operations.
          </p>
        </div>

        <div className="whitespace-nowrap rounded-[6px] border border-[#E5EAF1] bg-white px-[13px] py-[10px] text-[12px] font-semibold text-[#64748B]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} />
            {currentDate}
          </span>
        </div>
      </div>

      {loading && (
        <div className="mb-5 rounded-[7px] border border-[#E5EAF1] bg-white px-4 py-3 text-[12px] text-[#64748B]">
          Loading dashboard information...
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-[7px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          {error}
        </div>
      )}

      <div className="mb-[25px] grid grid-cols-2 gap-[10px] min-[601px]:gap-[17px] min-[1151px]:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-[8px] border border-[#E5EAF1] bg-white p-[14px] min-[601px]:p-[19px]"
            >
              <div className="flex items-center justify-between gap-[10px]">
                <div className="text-[12px] font-semibold text-[#718096]">
                  {stat.label}
                </div>

                <div
                  className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[7px] ${stat.iconStyle}`}
                >
                  <Icon size={17} />
                </div>
              </div>

              <div className="mt-[15px] text-[24px] font-extrabold tracking-[-0.7px] text-[#142D4E] min-[601px]:text-[29px]">
                {loading
                  ? "..."
                  : error
                    ? "—"
                    : stat.value.toLocaleString("en-PH")}
              </div>

              <div className="mt-1 text-[11px] text-[#94A3B8]">
                {stat.caption}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-[19px] min-[1151px]:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.9fr)]">
        <section className="mb-[19px] min-w-0 overflow-hidden rounded-[8px] border border-[#E5EAF1] bg-white">
          <div className="flex items-center justify-between border-b border-[#EDF0F4] px-[19px] py-[17px]">
            <div>
              <h3 className="m-0 text-[14px] font-extrabold text-[#142D4E]">
                Recent Reservations
              </h3>

              <p className="mt-1 text-[11px] text-[#94A3B8]">
                Latest customer booking records
              </p>
            </div>

            <a
              href="/staff/reservations"
              className="whitespace-nowrap text-[11px] font-bold text-[#0D9488] hover:text-[#0F766E]"
            >
              View all <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[590px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-[15px] py-[13px] text-[10px] font-extrabold tracking-[0.45px] text-[#8794A6]">
                    BOOKING REF.
                  </th>
                  <th className="px-[15px] py-[13px] text-[10px] font-extrabold tracking-[0.45px] text-[#8794A6]">
                    PASSENGER
                  </th>
                  <th className="px-[15px] py-[13px] text-[10px] font-extrabold tracking-[0.45px] text-[#8794A6]">
                    TRAVEL DATE
                  </th>
                  <th className="px-[15px] py-[13px] text-[10px] font-extrabold tracking-[0.45px] text-[#8794A6]">
                    SEAT
                  </th>
                  <th className="px-[15px] py-[13px] text-[10px] font-extrabold tracking-[0.45px] text-[#8794A6]">
                    STATUS
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-[15px] py-[30px] text-center text-[12px] text-[#94A3B8]"
                    >
                      Loading reservations...
                    </td>
                  </tr>
                ) : recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr
                      key={booking.booking_reference}
                      className="border-b border-[#F0F2F5] last:border-0 hover:bg-[#FAFCFE]"
                    >
                      <td className="px-[15px] py-[14px] text-[11px] font-bold text-[#142D4E]">
                        {booking.booking_reference}
                      </td>
                      <td className="px-[15px] py-[14px] text-[11px] font-semibold text-[#334155]">
                        {booking.full_name}
                      </td>
                      <td className="px-[15px] py-[14px] text-[11px] text-[#526176]">
                        {formatDate(booking.travel_date)}
                      </td>
                      <td className="px-[15px] py-[14px] text-[11px] text-[#526176]">
                        {booking.seat_number}
                      </td>
                      <td className="px-[15px] py-[14px] text-[11px] text-[#526176]">
                        <span
                          className={`inline-block rounded-[4px] px-2 py-[5px] text-[10px] font-bold capitalize ${getStatusStyle(booking.booking_status)}`}
                        >
                          {booking.booking_status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-[15px] py-[30px] text-center">
                      <div className="flex flex-col items-center text-[12px] text-[#94A3B8]">
                        <FolderOpen
                          size={23}
                          className="mb-[10px] text-[#CBD5E1]"
                        />
                        No reservation records found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-[19px] min-w-0 overflow-hidden rounded-[8px] border border-[#E5EAF1] bg-white">
          <div className="border-b border-[#EDF0F4] px-[19px] py-[17px]">
            <h3 className="m-0 text-[14px] font-extrabold text-[#142D4E]">
              Upcoming Trips
            </h3>

            <p className="mt-1 text-[11px] text-[#94A3B8]">
              Next scheduled departures
            </p>
          </div>

          {loading ? (
            <div className="px-[15px] py-[30px] text-center text-[12px] text-[#94A3B8]">
              Loading upcoming trips...
            </div>
          ) : upcomingTrips.length > 0 ? (
            upcomingTrips.map((trip, index) => (
              <div
                key={`${trip.travel_date}-${trip.departure_time}-${index}`}
                className="border-b border-[#EDF0F4] px-[18px] py-4 last:border-0"
              >
                <div className="flex items-center justify-between gap-[10px]">
                  <div className="text-[11px] font-bold text-[#0D9488]">
                    {formatDate(trip.travel_date)}
                  </div>

                  <div className="text-[12px] font-bold text-[#142D4E]">
                    {formatTime(trip.departure_time)}
                  </div>
                </div>

                <div className="mt-[10px] text-[13px] font-bold text-[#334155]">
                  {trip.operator_name || "Bus Operator"}
                </div>

                <div className="mt-[5px] text-[11px] text-[#8996A8]">
                  {trip.bus_type || "Bus"}
                  {" · "}
                  Arrival: {formatTime(trip.arrival_time)}
                </div>

                <div className="mt-[5px] text-[11px] text-[#8996A8]">
                  Fare: ₱
                  {Number(trip.fare || 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center px-[15px] py-[30px] text-center text-[12px] text-[#94A3B8]">
              <BusFront size={23} className="mb-[10px] text-[#CBD5E1]" />
              No upcoming trips available.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
