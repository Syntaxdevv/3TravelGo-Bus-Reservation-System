import { useEffect, useMemo, useState } from "react";
import { getAdminTrips, type Trip } from "../../services/adminTrips";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const itemsPerPage = 8;

  async function loadTrips() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminTrips();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trips.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesSearch =
        !keyword ||
        [
          trip.trip_id,
          trip.operator_name,
          trip.origin_name,
          trip.destination_name,
          trip.bus_type,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword),
        );

      const matchesStatus =
        statusFilter === "all" ||
        String(trip.status ?? "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrips.length / itemsPerPage),
  );

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const scheduledCount = trips.filter(
    (trip) => trip.status?.toLowerCase() === "scheduled",
  ).length;

  const delayedCount = trips.filter(
    (trip) => trip.status?.toLowerCase() === "delayed",
  ).length;

  const cancelledCount = trips.filter(
    (trip) => trip.status?.toLowerCase() === "cancelled",
  ).length;

  function formatDate(value: string) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(value: string) {
    if (!value) return "—";

    const [hour, minute] = value.split(":");
    const date = new Date();

    date.setHours(Number(hour), Number(minute), 0, 0);

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusStyle(status: string) {
    switch (String(status ?? "").toLowerCase()) {
      case "scheduled":
        return "bg-emerald-50 text-emerald-700";

      case "delayed":
        return "bg-amber-50 text-amber-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      case "completed":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2545]">Trips</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor scheduled bus trips.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTrips}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <i className="fa-solid fa-rotate-right" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Trips"
          value={trips.length}
          icon="fa-route"
          iconColor="text-[#1765E8]"
        />

        <SummaryCard
          label="Scheduled"
          value={scheduledCount}
          icon="fa-calendar-check"
          iconColor="text-emerald-600"
        />

        <SummaryCard
          label="Delayed"
          value={delayedCount}
          icon="fa-clock"
          iconColor="text-amber-500"
        />

        <SummaryCard
          label="Cancelled"
          value={cancelledCount}
          icon="fa-ban"
          iconColor="text-red-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-bold text-[#0B2545]">Trip Records</h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredTrips.length} record(s) found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trips..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1765E8] sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1765E8]"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <i className="fa-solid fa-circle-exclamation mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            <i className="fa-solid fa-spinner fa-spin mr-2" />
            Loading trips...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Trip ID</th>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Operator</th>
                  <th className="px-5 py-4">Travel Date</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4">Bus Type</th>
                  <th className="px-5 py-4">Fare</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedTrips.map((trip) => (
                  <tr key={trip.trip_id} className="text-sm hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-[#1765E8]">
                      TRP-{trip.trip_id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {trip.origin_name || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        to {trip.destination_name || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {trip.operator_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(trip.travel_date)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">
                        {formatTime(trip.departure_time)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        to {formatTime(trip.arrival_time)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {trip.bus_type || "—"}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      ₱
                      {Number(trip.fare || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                          trip.status,
                        )}`}
                      >
                        {trip.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTrip(trip)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedTrips.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <i className="fa-solid fa-route mb-3 text-2xl text-slate-300" />

                      <p className="text-sm font-semibold text-slate-600">
                        No trips found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredTrips.length > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTrips.length)} of{" "}
              {filteredTrips.length} records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs font-semibold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="font-bold text-[#0B2545]">Trip Details</h2>
                <p className="mt-1 text-xs text-slate-500">
                  TRP-{selectedTrip.trip_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#0B2545]">
                  {selectedTrip.origin_name} to {selectedTrip.destination_name}
                </h3>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle(
                    selectedTrip.status,
                  )}`}
                >
                  {selectedTrip.status}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TripDetail
                  label="Bus Operator"
                  value={selectedTrip.operator_name}
                />
                <TripDetail label="Bus Type" value={selectedTrip.bus_type} />
                <TripDetail
                  label="Travel Date"
                  value={formatDate(selectedTrip.travel_date)}
                />
                <TripDetail
                  label="Departure"
                  value={formatTime(selectedTrip.departure_time)}
                />
                <TripDetail
                  label="Arrival"
                  value={formatTime(selectedTrip.arrival_time)}
                />
                <TripDetail
                  label="Fare"
                  value={`₱${Number(selectedTrip.fare || 0).toLocaleString(
                    "en-PH",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconColor,
}: {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <i className={`fa-solid ${icon} text-lg ${iconColor}`} />
      </div>

      <p className="mt-3 text-2xl font-bold text-[#0B2545]">{value}</p>
    </div>
  );
}

function TripDetail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}
