import { useEffect, useMemo, useState } from "react";
import {
  getAdminReservations,
  getAdminReservation,
  type Reservation,
  type ReservationDetails,
} from "../../services/adminReservations";

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<ReservationDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const itemsPerPage = 8;

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReservations();
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load reservations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesSearch =
        !keyword ||
        [
          reservation.booking_reference,
          reservation.passenger_name,
          reservation.trip_name,
          reservation.operator_name,
          reservation.seat_number,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword),
        );

      const matchesStatus =
        statusFilter === "all" ||
        String(reservation.status ?? "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReservations.length / itemsPerPage),
  );

  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  async function openDetails(id: number) {
    try {
      setDetailsLoading(true);
      setSelected(null);

      const details = await getAdminReservation(id);
      setSelected(details);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reservation details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

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
      case "confirmed":
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "pending":
        return "bg-amber-50 text-amber-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      case "completed":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  const confirmedCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "confirmed",
  ).length;

  const pendingCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2545]">Reservations</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and monitor all customer bus reservations.
          </p>
        </div>

        <button
          onClick={loadReservations}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <i className="fa-solid fa-rotate-right" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Reservations
            </p>
            <i className="fa-solid fa-ticket text-lg text-[#1765E8]" />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {reservations.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Confirmed</p>
            <i className="fa-solid fa-circle-check text-lg text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {confirmedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <i className="fa-solid fa-clock text-lg text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {pendingCount}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-bold text-[#0B2545]">Reservation Records</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredReservations.length} record(s) found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reservations..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1765E8] sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1765E8]"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
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
            Loading reservations...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Passenger</th>
                  <th className="px-5 py-4">Trip</th>
                  <th className="px-5 py-4">Travel Date</th>
                  <th className="px-5 py-4">Seat</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedReservations.map((reservation) => (
                  <tr
                    key={reservation.booking_id}
                    className="text-sm hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-[#1765E8]">
                      {reservation.booking_reference ||
                        `BK-${reservation.booking_id}`}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {reservation.passenger_name || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {reservation.operator_name || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {reservation.trip_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(reservation.travel_date)}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {reservation.seat_number || "—"}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      ₱
                      {Number(
                        reservation.amount ?? reservation.fare ?? 0,
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                          reservation.status,
                        )}`}
                      >
                        {reservation.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openDetails(reservation.booking_id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedReservations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <i className="fa-solid fa-ticket mb-3 text-2xl text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">
                        No reservations found
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

        {!loading && filteredReservations.length > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredReservations.length,
              )}{" "}
              of {filteredReservations.length} records
            </p>

            <div className="flex items-center gap-2">
              <button
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

      {(detailsLoading || selected) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="font-bold text-[#0B2545]">
                  Reservation Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Complete booking information
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading details...
              </div>
            ) : (
              selected && (
                <div className="space-y-6 p-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs text-slate-500">
                        Booking Reference
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#1765E8]">
                        {selected.booking_reference ||
                          `BK-${selected.booking_id}`}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle(
                        selected.booking_status,
                      )}`}
                    >
                      {selected.booking_status}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="mb-4 text-sm font-bold text-[#0B2545]">
                      Passenger Information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Detail
                        label="Full Name"
                        value={selected.passenger_name}
                      />
                      <Detail
                        label="Email Address"
                        value={selected.passenger_email}
                      />
                      <Detail
                        label="Phone Number"
                        value={selected.passenger_phone}
                      />
                      <Detail
                        label="Bus Operator"
                        value={selected.operator_name}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="mb-4 text-sm font-bold text-[#0B2545]">
                      Trip Information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Detail label="Origin" value={selected.origin_name} />
                      <Detail
                        label="Destination"
                        value={selected.destination_name}
                      />
                      <Detail
                        label="Travel Date"
                        value={formatDate(selected.travel_date)}
                      />
                      <Detail label="Bus Type" value={selected.bus_type} />
                      <Detail
                        label="Departure"
                        value={formatTime(selected.departure_time)}
                      />
                      <Detail
                        label="Arrival"
                        value={formatTime(selected.arrival_time)}
                      />
                      <Detail
                        label="Seats"
                        value={selected.seat_numbers.join(", ")}
                      />
                      <Detail
                        label="Seat Count"
                        value={String(selected.seat_count)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="mb-4 text-sm font-bold text-[#0B2545]">
                      Payment Information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Detail
                        label="Payment Method"
                        value={selected.payment_method}
                      />
                      <Detail
                        label="Payment Status"
                        value={selected.payment_status}
                      />
                      <Detail
                        label="Payment Reference"
                        value={selected.payment_reference}
                      />
                      <Detail
                        label="Total Amount"
                        value={`₱${Number(selected.total_amount).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}`}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({
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
