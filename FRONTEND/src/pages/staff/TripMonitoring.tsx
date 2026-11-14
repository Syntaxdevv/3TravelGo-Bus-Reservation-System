import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BusFront,
  CalendarDays,
  MapPin,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  UserCheck,
  Activity,
} from "lucide-react";

interface Trip {
  trip_id: string | number;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  trip_status: string;
  monitoring_status: string;
  fare: string | number;
  bus_type: string;
  operator_name: string;
  origin_name: string;
  destination_name: string;
  bus_number: string | null;
  plate_number: string | null;
  seat_capacity: string | number | null;
  passenger_count: string | number;
  checked_in_count: string | number;
}

interface MonitoringSummary {
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface ApiResponse {
  success: boolean;
  summary: MonitoringSummary;
  data: Trip[];
  message?: string;
}

const ITEMS_PER_PAGE = 8;

const emptySummary: MonitoringSummary = {
  upcoming: 0,
  ongoing: 0,
  completed: 0,
  cancelled: 0,
  total: 0,
};

export default function TripMonitoring() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summary, setSummary] = useState<MonitoringSummary>(emptySummary);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/staff/trip-monitoring", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load trip monitoring data.",
        );
      }

      setTrips(Array.isArray(result.data) ? result.data : []);
      setSummary(result.summary || emptySummary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading trips.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredTrips = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return trips.filter((trip) => {
      const matchesSearch =
        String(trip.trip_id).toLowerCase().includes(keyword) ||
        trip.operator_name?.toLowerCase().includes(keyword) ||
        trip.origin_name?.toLowerCase().includes(keyword) ||
        trip.destination_name?.toLowerCase().includes(keyword) ||
        trip.bus_type?.toLowerCase().includes(keyword) ||
        trip.bus_number?.toLowerCase().includes(keyword) ||
        trip.plate_number?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        trip.monitoring_status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrips.length / ITEMS_PER_PAGE),
  );

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");
    const parsedHours = Number(hours);

    if (Number.isNaN(parsedHours)) return time;

    const period = parsedHours >= 12 ? "PM" : "AM";
    const displayHour = parsedHours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ongoing":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeStatus = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const statCards = [
    {
      label: "Total Trips",
      value: summary.total,
      icon: BusFront,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Upcoming Trips",
      value: summary.upcoming,
      icon: CalendarDays,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Ongoing Trips",
      value: summary.ongoing,
      icon: Activity,
      color: "bg-orange-50 text-orange-700",
    },
    {
      label: "Completed Trips",
      value: summary.completed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Trip Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor upcoming, ongoing, and completed bus trips.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTrips}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#172B4D]">
                    {card.value.toLocaleString("en-PH")}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#172B4D]">
                Trip Activity
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review trip schedules, bus assignments, and passenger check-ins.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder="Search trips..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => changeStatus(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0D9488]"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Unable to load trip monitoring</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={fetchTrips}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw size={28} className="animate-spin text-[#0D9488]" />
            <p className="mt-3 text-sm text-gray-500">
              Loading trip monitoring...
            </p>
          </div>
        ) : !error && paginatedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <BusFront size={25} />
            </div>
            <h3 className="mt-4 font-semibold text-gray-700">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Try changing your search or status filter."
                : "There are currently no trips to monitor."}
            </p>
          </div>
        ) : !error ? (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Trip / Operator
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Route
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Schedule
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Bus Details
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Passengers
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Check-ins
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Monitoring Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedTrips.map((trip) => {
                    const passengers = Number(trip.passenger_count || 0);

                    const checkedIn = Number(trip.checked_in_count || 0);

                    const checkinProgress =
                      passengers > 0
                        ? Math.min(100, (checkedIn / passengers) * 100)
                        : 0;

                    return (
                      <tr
                        key={trip.trip_id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#172B4D]">
                            #{trip.trip_id}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {trip.operator_name || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={16}
                              className="mt-0.5 shrink-0 text-[#0D9488]"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {trip.origin_name || "Unknown origin"}
                              </p>
                              <p className="my-1 text-xs text-gray-400">to</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {trip.destination_name || "Unknown destination"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(trip.travel_date)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatTime(trip.departure_time)}
                            {" – "}
                            {formatTime(trip.arrival_time)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-700">
                            {trip.bus_number || "No bus assigned"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {trip.plate_number || "—"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {trip.bus_type || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Users size={16} className="text-gray-400" />
                            {passengers}
                            {trip.seat_capacity
                              ? ` / ${trip.seat_capacity}`
                              : ""}
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Confirmed bookings
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <UserCheck size={16} className="text-[#0D9488]" />
                            {checkedIn} / {passengers}
                          </div>
                          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#0D9488]"
                              style={{
                                width: `${checkinProgress}%`,
                              }}
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                              trip.monitoring_status,
                            )}`}
                          >
                            {trip.monitoring_status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-700">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTrips.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {filteredTrips.length}
                </span>{" "}
                trips
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="px-2 text-sm font-medium text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <BusFront size={14} />
        <span>3TravelGo Staff Portal</span>
      </div>
    </div>
  );
}
