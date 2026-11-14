import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  Banknote,
  CalendarDays,
  UserRound,
  BusFront,
  Armchair,
  MapPin,
  Hash,
  AlertCircle,
} from "lucide-react";

interface Payment {
  payment_id: string;
  booking_id: string;
  payment_method: string;
  payment_status: string;
  amount: string;
  payment_reference: string | null;
  created_at: string;
  paypal_order_id: string | null;
  booking_reference: string | null;
  booking_status: string | null;
  booked_at: string | null;
  passenger_name: string | null;
  passenger_email: string | null;
  passenger_phone: string | null;
  seat_number: string | null;
  trip_id: string | null;
  travel_date: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  fare: string | null;
  bus_type: string | null;
  origin_name: string | null;
  destination_name: string | null;
  operator_name: string | null;
}

interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  paid_count: number;
  pending_count: number;
  failed_count: number;
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface PaymentsResponse {
  success: boolean;
  message?: string;
  data: Payment[];
  summary: PaymentSummary;
  pagination: Pagination;
}

const emptySummary: PaymentSummary = {
  total_payments: 0,
  total_amount: 0,
  paid_count: 0,
  pending_count: 0,
  failed_count: 0,
};

const emptyPagination: Pagination = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

const formatCurrency = (amount: string | number | null | undefined) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount || 0));
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatTime = (value: string | null | undefined) => {
  if (!value) return "—";

  const [hours, minutes] = value.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getPaymentStatus = (status: string | null | undefined) => {
  const value = (status || "").toLowerCase().trim();

  if (["paid", "demo_paid", "completed", "success"].includes(value)) {
    return {
      label: value === "demo_paid" ? "Demo Paid" : "Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  }

  if (["pending", "processing"].includes(value)) {
    return {
      label: value === "processing" ? "Processing" : "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    };
  }

  if (["failed", "cancelled", "declined"].includes(value)) {
    return {
      label: value.charAt(0).toUpperCase() + value.slice(1),
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    };
  }

  return {
    label: status || "Unknown",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: AlertCircle,
  };
};

const getBookingStatus = (status: string | null | undefined) => {
  const value = (status || "").toLowerCase();

  if (value === "confirmed" || value === "paid") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  if (value === "cancelled") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
};

export default function StaffPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>(emptySummary);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "10",
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const response = await fetch(
          `/api/staff/payments?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const result: PaymentsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load payment records.");
        }

        setPayments(result.data || []);
        setSummary(result.summary || emptySummary);
        setPagination(result.pagination || emptyPagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading payments.",
        );

        setPayments([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "10",
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const response = await fetch(
          `/api/staff/payments?${params.toString()}`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          },
        );

        const result: PaymentsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load payment records.");
        }

        setPayments(result.data || []);
        setSummary(result.summary || emptySummary);
        setPagination(result.pagination || emptyPagination);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading payments.",
        );

        setPayments([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [page, search, statusFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchPayments(true);
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
    <div className="min-w-0 space-y-6 text-slate-800">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <CreditCard size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Payment Verification
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                View and monitor customer payment records.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Payments
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {summary.total_payments.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CreditCard size={21} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            All recorded transactions
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Paid Amount
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {formatCurrency(summary.total_amount)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Banknote size={21} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Successful payment records
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Paid Payments
              </p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                {summary.paid_count.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Successfully recorded payments
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending / Failed
              </p>
              <h2 className="mt-2 text-2xl font-bold text-amber-600">
                {(
                  summary.pending_count + summary.failed_count
                ).toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock3 size={21} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {summary.pending_count} pending · {summary.failed_count} failed
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Payment Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review payment transactions and their booking details.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search payment, booking, passenger..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load payments</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Payment Details
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Passenger
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Payment Method
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Amount
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-orange-500"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading payment records...
                    </p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <CreditCard size={22} />
                    </div>
                    <p className="mt-3 font-semibold text-slate-700">
                      No payment records found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const status = getPaymentStatus(payment.payment_status);
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={payment.payment_id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {payment.payment_reference || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Booking: {payment.booking_reference || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Payment ID: #{payment.payment_id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {payment.passenger_name || "Unknown"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {payment.passenger_email || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {payment.payment_method || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {formatCurrency(payment.amount)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDate(payment.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {payment.created_at?.split(" ")[1]?.slice(0, 5) || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {firstRecord}-{lastRecord}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total}
            </span>{" "}
            payments
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="px-2 text-sm font-semibold text-slate-600">
              {pagination.current_page} / {pagination.last_page}
            </span>

            <button
              type="button"
              disabled={page >= pagination.last_page || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.last_page, current + 1),
                )
              }
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="my-auto w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Payment Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Transaction #{selectedPayment.payment_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">
                  Payment Amount
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">
                  {formatCurrency(selectedPayment.amount)}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(() => {
                    const status = getPaymentStatus(
                      selectedPayment.payment_status,
                    );
                    const StatusIcon = status.icon;

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>
                    );
                  })()}

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getBookingStatus(
                      selectedPayment.booking_status,
                    )}`}
                  >
                    Booking: {selectedPayment.booking_status || "Unknown"}
                  </span>
                </div>
              </div>

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Transaction Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    icon={<Hash size={16} />}
                    label="Payment Reference"
                    value={selectedPayment.payment_reference}
                  />
                  <DetailItem
                    icon={<CreditCard size={16} />}
                    label="Payment Method"
                    value={selectedPayment.payment_method}
                  />
                  <DetailItem
                    icon={<CalendarDays size={16} />}
                    label="Payment Date"
                    value={formatDateTime(selectedPayment.created_at)}
                  />
                  <DetailItem
                    icon={<Hash size={16} />}
                    label="PayPal Order ID"
                    value={selectedPayment.paypal_order_id}
                  />
                </div>
              </section>

              <div className="border-t border-slate-100" />

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Passenger Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    icon={<UserRound size={16} />}
                    label="Passenger Name"
                    value={selectedPayment.passenger_name}
                  />
                  <DetailItem
                    icon={<Hash size={16} />}
                    label="Booking Reference"
                    value={selectedPayment.booking_reference}
                  />
                  <DetailItem
                    icon={<UserRound size={16} />}
                    label="Email Address"
                    value={selectedPayment.passenger_email}
                  />
                  <DetailItem
                    icon={<UserRound size={16} />}
                    label="Contact Number"
                    value={selectedPayment.passenger_phone}
                  />
                </div>
              </section>

              <div className="border-t border-slate-100" />

              <section>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Trip Information
                </h3>

                <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <MapPin size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">
                      {selectedPayment.origin_name || "Unknown"}{" "}
                      <span className="text-slate-400">→</span>{" "}
                      {selectedPayment.destination_name || "Unknown"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPayment.operator_name || "Unknown operator"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    icon={<CalendarDays size={16} />}
                    label="Travel Date"
                    value={formatDate(selectedPayment.travel_date)}
                  />
                  <DetailItem
                    icon={<BusFront size={16} />}
                    label="Bus Type"
                    value={selectedPayment.bus_type}
                  />
                  <DetailItem
                    icon={<Clock3 size={16} />}
                    label="Departure"
                    value={formatTime(selectedPayment.departure_time)}
                  />
                  <DetailItem
                    icon={<Clock3 size={16} />}
                    label="Arrival"
                    value={formatTime(selectedPayment.arrival_time)}
                  />
                  <DetailItem
                    icon={<Armchair size={16} />}
                    label="Seat Number"
                    value={selectedPayment.seat_number}
                  />
                  <DetailItem
                    icon={<Banknote size={16} />}
                    label="Trip Fare"
                    value={formatCurrency(selectedPayment.fare)}
                  />
                </div>
              </section>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs leading-relaxed text-blue-800">
                  This page displays the payment status recorded by the system.
                  The current customer payment process uses demo payment
                  confirmation. This record does not independently verify an
                  external bank or e-wallet transaction.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
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

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="break-words text-sm font-semibold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}
