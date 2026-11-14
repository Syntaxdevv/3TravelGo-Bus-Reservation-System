import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  CalendarDays,
  Ticket,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  CreditCard,
  Armchair,
} from "lucide-react";

interface Reservation {
  id: string;
  booking_id: string;
  booking_reference: string;
  status: string;
  booking_date: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  seat_number: string;
  trip_name: string;
  trip_id: string;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  fare: string;
  operator_name: string;
  payment_method: string;
  payment_status: string;
  amount: string;
  payment_reference: string;
}

interface ApiResponse {
  success: boolean;
  data: Reservation[];
  total: number;
  message?: string;
}

interface DetailsResponse {
  success: boolean;
  data: {
    booking_id: string;
    booking_reference: string;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;
    origin_name: string;
    destination_name: string;
    operator_name: string;
    travel_date: string;
    departure_time: string;
    arrival_time: string;
    bus_type: string;
    fare: number;
    seat_numbers: string[];
    seat_count: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    booking_status: string;
  };
  message?: string;
}

const PAGE_SIZE = 8;

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (time?: string) => {
  if (!time) return "—";

  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  if (Number.isNaN(hour)) return time;

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minute} ${period}`;
};

const formatCurrency = (amount?: string | number) =>
  `₱${Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-green-50 text-green-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const paymentStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-50 text-green-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "failed":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedReservation, setSelectedReservation] = useState<
    DetailsResponse["data"] | null
  >(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const loadReservations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/staff/reservations", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load reservations.");
      }

      setReservations(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesSearch =
        !keyword ||
        reservation.booking_reference?.toLowerCase().includes(keyword) ||
        reservation.passenger_name?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        reservation.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReservations.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const pendingCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "pending",
  ).length;

  const confirmedCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "confirmed",
  ).length;

  const cancelledCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "cancelled",
  ).length;

  const openDetails = async (id: string) => {
    setSelectedReservation(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(id)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result: DetailsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load reservation details.",
        );
      }

      setSelectedReservation(result.data);
    } catch (err) {
      setDetailsError(
        err instanceof Error ? err.message : "Unable to load details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#172B4D]">
            Reservations
          </h1>
          <p className="mt-1 text-[13px] text-[#718096]">
            View and manage customer bus reservations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReservations()}
          disabled={loading}
          className="flex h-[40px] items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-[12px] font-semibold text-[#334155] hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Reservations",
            value: reservations.length,
            icon: Ticket,
            color: "text-[#2563EB]",
            bg: "bg-blue-50",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: Clock,
            color: "text-[#D97706]",
            bg: "bg-amber-50",
          },
          {
            label: "Confirmed",
            value: confirmedCount,
            icon: Users,
            color: "text-[#16A34A]",
            bg: "bg-green-50",
          },
          {
            label: "Cancelled",
            value: cancelledCount,
            icon: CalendarDays,
            color: "text-[#DC2626]",
            bg: "bg-red-50",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#E7ECF2] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#718096]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[27px] font-bold text-[#172B4D]">
                    {item.value}
                  </p>
                </div>

                <div
                  className={`grid h-11 w-11 place-items-center rounded-lg ${item.bg} ${item.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E7ECF2] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#EDF0F4] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#172B4D]">
              All Reservations
            </h2>
            <p className="mt-1 text-[12px] text-[#94A3B8]">
              Reservation records from customers
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-[260px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search reference or passenger..."
                className="h-[40px] w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="h-[40px] rounded-lg border border-[#E2E8F0] bg-white px-3 text-[12px] text-[#475569] outline-none focus:border-[#EA580C]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center gap-3 text-[13px] text-[#718096]">
            <RefreshCw size={18} className="animate-spin" />
            Loading reservations...
          </div>
        ) : !error && paginatedReservations.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
            <Ticket size={32} className="mb-3 text-[#CBD5E1]" />
            <p className="text-[14px] font-semibold text-[#334155]">
              No reservations found
            </p>
            <p className="mt-1 text-[12px] text-[#94A3B8]">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.5px] text-[#718096]">
                    <th className="px-5 py-4">Booking Reference</th>
                    <th className="px-5 py-4">Passenger</th>
                    <th className="px-5 py-4">Trip Details</th>
                    <th className="px-5 py-4">Travel Date</th>
                    <th className="px-5 py-4">Seat</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF0F4]">
                  {paginatedReservations.map((item) => (
                    <tr
                      key={item.booking_id}
                      className="text-[12px] text-[#475569] hover:bg-[#FAFBFD]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#172B4D]">
                          {item.booking_reference}
                        </p>
                        <p className="mt-1 text-[10px] text-[#94A3B8]">
                          ID: {item.booking_id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#334155]">
                          {item.passenger_name || "—"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#94A3B8]">
                          {item.passenger_email || "—"}
                        </p>
                      </td>

                      <td className="max-w-[200px] px-5 py-4">
                        <p className="font-medium text-[#334155]">
                          {item.trip_name || "—"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#94A3B8]">
                          {item.operator_name || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {formatDate(item.travel_date)}
                      </td>

                      <td className="px-5 py-4">{item.seat_number || "—"}</td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#172B4D]">
                        {formatCurrency(item.amount || item.fare)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusStyle(item.status)}`}
                        >
                          {item.status || "Unknown"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => void openDetails(item.booking_id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-[11px] font-semibold text-[#475569] hover:border-[#EA580C] hover:bg-orange-50 hover:text-[#EA580C]"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EDF0F4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[#94A3B8]">
                Showing{" "}
                {filteredReservations.length === 0
                  ? 0
                  : (currentPage - 1) * PAGE_SIZE + 1}{" "}
                to{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredReservations.length)}{" "}
                of {filteredReservations.length} reservations
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="grid h-8 w-8 place-items-center rounded-md border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="min-w-16 text-center text-[11px] font-semibold text-[#475569]">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="grid h-8 w-8 place-items-center rounded-md border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {(detailsLoading || selectedReservation || detailsError) && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EDF0F4] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#172B4D]">
                  Reservation Details
                </h2>
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Booking information
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedReservation(null);
                  setDetailsError("");
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#64748B] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-[200px] items-center justify-center gap-3 text-[13px] text-[#718096]">
                <RefreshCw size={18} className="animate-spin" />
                Loading details...
              </div>
            ) : detailsError ? (
              <div className="p-6 text-[13px] text-red-600">{detailsError}</div>
            ) : (
              selectedReservation && (
                <div className="space-y-5 p-5">
                  <div className="rounded-lg bg-[#172B4D] p-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                      Booking Reference
                    </p>
                    <p className="mt-2 break-all text-[17px] font-bold">
                      {selectedReservation.booking_reference}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${statusStyle(selectedReservation.booking_status)}`}
                      >
                        {selectedReservation.booking_status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${paymentStyle(selectedReservation.payment_status)}`}
                      >
                        Payment:{" "}
                        {selectedReservation.payment_status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <section>
                    <h3 className="mb-3 text-[12px] font-bold text-[#172B4D]">
                      Passenger Information
                    </h3>
                    <div className="grid gap-3 rounded-lg border border-[#EDF0F4] p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">Full Name</p>
                        <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                          {selectedReservation.passenger_name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">Email</p>
                        <p className="mt-1 break-all text-[12px] font-semibold text-[#334155]">
                          {selectedReservation.passenger_email || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">Phone</p>
                        <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                          {selectedReservation.passenger_phone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">
                          Bus Operator
                        </p>
                        <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                          {selectedReservation.operator_name || "—"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-[12px] font-bold text-[#172B4D]">
                      Trip Information
                    </h3>
                    <div className="space-y-4 rounded-lg border border-[#EDF0F4] p-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={17} className="mt-0.5 text-[#EA580C]" />
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Route</p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {selectedReservation.origin_name || "Unknown"} →{" "}
                            {selectedReservation.destination_name || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">
                            Travel Date
                          </p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {formatDate(selectedReservation.travel_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Bus Type</p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {selectedReservation.bus_type || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">
                            Departure
                          </p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {formatTime(selectedReservation.departure_time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Arrival</p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {formatTime(selectedReservation.arrival_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-[12px] font-bold text-[#172B4D]">
                      Seat and Payment
                    </h3>
                    <div className="grid gap-3 rounded-lg border border-[#EDF0F4] p-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <Armchair size={18} className="text-[#EA580C]" />
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">
                            Selected Seats
                          </p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {selectedReservation.seat_numbers?.join(", ") ||
                              "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-[#EA580C]" />
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">
                            Payment Method
                          </p>
                          <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                            {selectedReservation.payment_method || "—"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">Seat Count</p>
                        <p className="mt-1 text-[12px] font-semibold text-[#334155]">
                          {selectedReservation.seat_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">
                          Total Amount
                        </p>
                        <p className="mt-1 text-[15px] font-bold text-[#172B4D]">
                          {formatCurrency(selectedReservation.total_amount)}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
