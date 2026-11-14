import { useEffect, useMemo, useState } from "react";
import {
  getAdminPayments,
  type AdminPayment,
  type PaymentSummary,
} from "../../services/adminPayments";

const emptySummary: PaymentSummary = {
  total_amount: 0,
  paid_count: 0,
  pending_count: 0,
  failed_count: 0,
};

function formatAmount(amount: number | string) {
  return Number(amount || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status: string) {
  const normalized = status.toLowerCase();

  if (["paid", "demo_paid", "completed", "success"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (["pending", "processing"].includes(normalized)) {
    return "bg-amber-50 text-amber-700";
  }

  if (["failed", "cancelled", "declined"].includes(normalized)) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function Payments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null,
  );

  const itemsPerPage = 8;

  useEffect(() => {
    async function loadPayments() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getAdminPayments();

        setPayments(result.payments);
        setSummary(result.summary);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load payments.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const keyword = search.toLowerCase();

      const matchesSearch = [
        String(payment.payment_id),
        String(payment.booking_id),
        payment.payment_method,
        payment.payment_status,
        payment.payment_reference || "",
        payment.paypal_order_id || "",
      ].some((value) => value.toLowerCase().includes(keyword));

      const normalizedStatus = payment.payment_status.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" &&
          ["paid", "demo_paid", "completed", "success"].includes(
            normalizedStatus,
          )) ||
        (statusFilter === "pending" &&
          ["pending", "processing"].includes(normalizedStatus)) ||
        (statusFilter === "failed" &&
          ["failed", "cancelled", "declined"].includes(normalizedStatus));

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / itemsPerPage),
  );

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="w-full space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and monitor customer payment transactions.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Total Transactions
          </p>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {isLoading ? "—" : payments.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Recorded payments</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Total Paid Amount
          </p>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {isLoading ? "—" : formatAmount(summary.total_amount)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Includes recorded demo payments
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Paid Transactions
          </p>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {isLoading ? "—" : summary.paid_count}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Successful or demo-paid records
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Pending / Failed</p>
          <p className="mt-3 text-2xl font-bold text-amber-600">
            {isLoading ? "—" : summary.pending_count + summary.failed_count}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Transactions requiring attention
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-[#0B2545]">Payment Records</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredPayments.length} transaction(s) found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search payment..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-[#1765E8] sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-[#1765E8]"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Payment ID</th>
                <th className="px-5 py-4">Booking ID</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Loading payment records...
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No payment records found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-[#0B2545]">
                      #{payment.payment_id}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      #{payment.booking_id}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {payment.payment_method || "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-5 py-4 text-sm text-slate-500">
                      {payment.payment_reference ||
                        payment.paypal_order_id ||
                        "—"}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#0B2545]">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
                          payment.payment_status,
                        )}`}
                      >
                        {payment.payment_status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] transition hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            {filteredPayments.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredPayments.length)}{" "}
            of {filteredPayments.length} records
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-xs font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0B2545]">
                  Payment Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Transaction #{selectedPayment.payment_id}
                </p>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Payment Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0B2545]">
                  {formatAmount(selectedPayment.amount)}
                </p>
              </div>

              {[
                ["Payment ID", `#${selectedPayment.payment_id}`],
                ["Booking ID", `#${selectedPayment.booking_id}`],
                ["Payment Method", selectedPayment.payment_method],
                ["Payment Status", selectedPayment.payment_status],
                ["Payment Reference", selectedPayment.payment_reference || "—"],
                ["PayPal Order ID", selectedPayment.paypal_order_id || "—"],
                ["Transaction Date", formatDate(selectedPayment.created_at)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="max-w-[60%] break-all text-right text-sm font-semibold text-slate-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163A65]"
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
