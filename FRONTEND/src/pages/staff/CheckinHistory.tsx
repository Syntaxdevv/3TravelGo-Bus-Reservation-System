import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  History,
  Users,
  Ticket,
  CalendarDays,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Armchair,
} from "lucide-react";

interface CheckinRecord {
  checkin_id: string;
  checked_in_at: string;
  booking_id: string;
  booking_reference: string;
  booking_status: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  origin_name: string;
  destination_name: string;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  operator_name: string;
  seat_number: string;
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface ApiResponse {
  success: boolean;
  data: CheckinRecord[];
  pagination: Pagination;
  message?: string;
}

const initialPagination: Pagination = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) return "—";

  const [hours, minutes] = value.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(value: string) {
  if (!value) return "—";

  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CheckinHistory() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(pagination.current_page),
        per_page: String(pagination.per_page),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/staff/check-in-history?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load check-in history.");
      }

      setRecords(result.data || []);
      setPagination(result.pagination || initialPagination);
    } catch (err) {
      setRecords([]);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading check-in history.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.current_page, pagination.per_page, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = () => {
    setPagination((previous) => ({
      ...previous,
      current_page: 1,
    }));

    setSearch(searchInput.trim());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const goToPage = (page: number) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    setPagination((previous) => ({
      ...previous,
      current_page: page,
    }));
  };

  const firstRecord =
    pagination.total === 0
      ? 0
      : (pagination.current_page - 1) * pagination.per_page + 1;

  const lastRecord = Math.min(
    pagination.current_page * pagination.per_page,
    pagination.total,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <History size={22} className="text-[#EA580C]" />
            <h1 className="text-[23px] font-bold tracking-tight text-[#172B4D]">
              Check-in History
            </h1>
          </div>

          <p className="mt-1 text-sm text-[#718096]">
            View all passengers who have successfully checked in.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E7ECF2] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                Total Checked-in Passengers
              </p>

              <h2 className="mt-2 text-[28px] font-bold text-[#172B4D]">
                {pagination.total}
              </h2>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#ECFDF5] text-[#059669]">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E7ECF2] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                Records on This Page
              </p>

              <h2 className="mt-2 text-[28px] font-bold text-[#172B4D]">
                {records.length}
              </h2>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#FFF7ED] text-[#EA580C]">
              <Ticket size={21} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7ECF2] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search booking reference, passenger, route, operator or seat..."
              className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="h-11 rounded-lg bg-[#EA580C] px-6 text-sm font-semibold text-white transition hover:bg-[#C94B0A]"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load check-in history</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchHistory}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#E7ECF2] bg-white">
        <div className="flex flex-col justify-between gap-2 border-b border-[#E7ECF2] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[15px] font-bold text-[#172B4D]">
              Passenger Records
            </h2>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Successfully recorded passenger check-ins
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-[11px] font-bold text-[#059669]">
            <CheckCircle2 size={13} />
            Verified Check-ins
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#EA580C]" />
            <p className="text-sm text-[#718096]">
              Loading check-in records...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[180px] items-center justify-center px-5 text-center">
            <p className="text-sm text-[#718096]">
              Check-in records could not be displayed.
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
              <History size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#172B4D]">
              No check-in records found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-[#94A3B8]">
              {search
                ? "Try another search keyword."
                : "Passenger check-ins will appear here after successful verification."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-[#E7ECF2] bg-[#F8FAFC]">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Passenger
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Booking Reference
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Trip Route
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Travel Date
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Seat
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Checked-in At
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.checkin_id}
                      className="border-b border-[#F1F5F9] transition hover:bg-[#FAFBFD]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-bold text-[#172B4D]">
                          {record.passenger_name || "—"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#94A3B8]">
                          {record.passenger_email || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-[12px] font-semibold text-[#334155]">
                          {record.booking_reference}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#334155]">
                          <MapPin
                            size={13}
                            className="shrink-0 text-[#EA580C]"
                          />
                          {record.origin_name || "—"}
                        </div>
                        <p className="ml-5 mt-1 text-[12px] text-[#718096]">
                          to {record.destination_name || "—"}
                        </p>
                        <p className="ml-5 mt-1 text-[10px] text-[#94A3B8]">
                          {record.operator_name || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[12px] text-[#334155]">
                          <CalendarDays size={14} className="text-[#94A3B8]" />
                          {formatDate(record.travel_date)}
                        </div>
                        <p className="ml-[22px] mt-1 text-[11px] text-[#94A3B8]">
                          {formatTime(record.departure_time)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F1F5F9] px-2.5 py-1.5 text-xs font-bold text-[#334155]">
                          <Armchair size={13} />
                          {record.seat_number || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2 text-[12px] text-[#334155]">
                          <Clock
                            size={14}
                            className="mt-0.5 shrink-0 text-[#94A3B8]"
                          />
                          <span>{formatDateTime(record.checked_in_at)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1.5 text-[10px] font-bold text-[#059669]">
                          <CheckCircle2 size={12} />
                          Checked In
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-[#E7ECF2] px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-[#718096]">
                Showing{" "}
                <span className="font-bold text-[#334155]">
                  {firstRecord}–{lastRecord}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#334155]">
                  {pagination.total}
                </span>{" "}
                records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="px-2 text-xs font-semibold text-[#334155]">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
