import { useEffect, useMemo, useState } from "react";
import {
  getAdminSeats,
  type AdminSeat,
  type SeatSummary,
} from "../../services/adminSeats";

const ITEMS_PER_PAGE = 8;

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-emerald-50 text-emerald-700";
    case "reserved":
      return "bg-amber-50 text-amber-700";
    case "occupied":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function Seats() {
  const [seats, setSeats] = useState<AdminSeat[]>([]);
  const [summary, setSummary] = useState<SeatSummary>({
    total_seats: 0,
    available_count: 0,
    reserved_count: 0,
    occupied_count: 0,
    other_count: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState<AdminSeat | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeats() {
      try {
        setLoading(true);
        setError("");

        const result = await getAdminSeats();

        setSeats(result.seats);
        setSummary(result.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load seats.");
      } finally {
        setLoading(false);
      }
    }

    loadSeats();
  }, []);

  const filteredSeats = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return seats.filter((seat) => {
      const matchesSearch = [
        seat.seat_id,
        seat.trip_id,
        seat.seat_number,
        seat.operator_name,
        seat.origin_name,
        seat.destination_name,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword),
      );

      const matchesStatus =
        statusFilter === "all" || seat.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [seats, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSeats.length / ITEMS_PER_PAGE),
  );

  const paginatedSeats = filteredSeats.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const statCards = [
    {
      label: "Total Seats",
      value: summary.total_seats,
      icon: "fa-chair",
      color: "text-[#1765E8]",
      bg: "bg-blue-50",
    },
    {
      label: "Available",
      value: summary.available_count,
      icon: "fa-check-circle",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Reserved",
      value: summary.reserved_count,
      icon: "fa-clock",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Occupied",
      value: summary.occupied_count,
      icon: "fa-user",
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Seats Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and monitor seat availability across scheduled trips.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#0B2545]">
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
              >
                <i className={`fa-solid ${card.icon}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-[#0B2545]">Seat Records</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredSeats.length} seat records found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search seats..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1765E8] sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-[#1765E8]"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <i className="fa-solid fa-spinner fa-spin mr-2" />
            Loading seat records...
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <i className="fa-solid fa-circle-exclamation text-2xl text-red-500" />
            <p className="mt-3 text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Seat</th>
                    <th className="px-5 py-4">Trip</th>
                    <th className="px-5 py-4">Route</th>
                    <th className="px-5 py-4">Operator</th>
                    <th className="px-5 py-4">Travel Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedSeats.map((seat) => (
                    <tr
                      key={seat.seat_id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#0B2545]">
                          {seat.seat_number}
                        </span>
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {seat.seat_id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        #{seat.trip_id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {seat.origin_name || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          to {seat.destination_name || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {seat.operator_name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(seat.travel_date)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(seat.status)}`}
                        >
                          {seat.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedSeat(seat)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] hover:bg-blue-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}

                  {paginatedSeats.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-slate-400"
                      >
                        No seat records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                {filteredSeats.length === 0
                  ? 0
                  : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredSeats.length)}{" "}
                of {filteredSeats.length} records
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-xs text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedSeat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedSeat(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0B2545]">
                  Seat Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Seat ID: {selectedSeat.seat_id}
                </p>
              </div>

              <button
                onClick={() => setSelectedSeat(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 p-6">
              <div>
                <p className="text-xs text-slate-400">Seat Number</p>
                <p className="mt-1 font-semibold text-[#0B2545]">
                  {selectedSeat.seat_number}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Trip ID</p>
                <p className="mt-1 font-semibold text-[#0B2545]">
                  #{selectedSeat.trip_id}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Operator</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedSeat.operator_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(selectedSeat.status)}`}
                >
                  {selectedSeat.status}
                </span>
              </div>

              <div className="col-span-2">
                <p className="text-xs text-slate-400">Route</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedSeat.origin_name || "—"} to{" "}
                  {selectedSeat.destination_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Travel Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatDate(selectedSeat.travel_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Departure</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatTime(selectedSeat.departure_time)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Arrival</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatTime(selectedSeat.arrival_time)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedSeat(null)}
                className="rounded-lg bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16385f]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
