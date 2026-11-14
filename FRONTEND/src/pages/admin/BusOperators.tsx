import { useEffect, useMemo, useState } from "react";
import {
  getAdminOperators,
  type AdminOperator,
  type OperatorSummary,
} from "../../services/adminOperators";

const emptySummary: OperatorSummary = {
  active_count: 0,
  inactive_count: 0,
};

function isOperatorActive(value: boolean | string) {
  return value === true || value === "t" || value === "true" || value === "1";
}

export default function BusOperators() {
  const [operators, setOperators] = useState<AdminOperator[]>([]);
  const [summary, setSummary] = useState<OperatorSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOperator, setSelectedOperator] =
    useState<AdminOperator | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    async function loadOperators() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getAdminOperators();

        setOperators(result.operators);
        setSummary(result.summary);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load bus operators.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOperators();
  }, []);

  const filteredOperators = useMemo(() => {
    return operators.filter((operator) => {
      const keyword = search.toLowerCase();

      const matchesSearch = [
        String(operator.operator_id),
        operator.operator_name || "",
        operator.contact_person || "",
        operator.contact_number || "",
        operator.email || "",
        operator.address || "",
      ].some((value) => value.toLowerCase().includes(keyword));

      const active = isOperatorActive(operator.is_active);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [operators, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOperators.length / itemsPerPage),
  );

  const paginatedOperators = filteredOperators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="w-full space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Bus Operators</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage registered bus companies.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Total Operators</p>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {isLoading ? "—" : operators.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Registered bus companies
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Active Operators</p>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {isLoading ? "—" : summary.active_count}
          </p>
          <p className="mt-1 text-xs text-slate-400">Currently active</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Inactive Operators
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-600">
            {isLoading ? "—" : summary.inactive_count}
          </p>
          <p className="mt-1 text-xs text-slate-400">Currently inactive</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-[#0B2545]">Registered Operators</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredOperators.length} operator(s) found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search operators..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-[#1765E8] sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-[#1765E8]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Operator ID</th>
                <th className="px-5 py-4">Operator Name</th>
                <th className="px-5 py-4">Contact Person</th>
                <th className="px-5 py-4">Contact Number</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Loading bus operators...
                  </td>
                </tr>
              ) : paginatedOperators.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No bus operators found.
                  </td>
                </tr>
              ) : (
                paginatedOperators.map((operator) => {
                  const active = isOperatorActive(operator.is_active);

                  return (
                    <tr
                      key={operator.operator_id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-[#0B2545]">
                        #{operator.operator_id}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {operator.operator_name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {operator.contact_person || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {operator.contact_number || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {operator.email || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOperator(operator)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] hover:bg-blue-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            {filteredOperators.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredOperators.length)}{" "}
            of {filteredOperators.length} records
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

      {selectedOperator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedOperator(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0B2545]">
                  Operator Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Operator #{selectedOperator.operator_id}
                </p>
              </div>

              <button
                onClick={() => setSelectedOperator(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Bus Operator
                </p>
                <p className="mt-1 text-xl font-bold text-[#0B2545]">
                  {selectedOperator.operator_name}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isOperatorActive(selectedOperator.is_active)
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isOperatorActive(selectedOperator.is_active)
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              {[
                ["Operator ID", `#${selectedOperator.operator_id}`],
                ["Contact Person", selectedOperator.contact_person || "—"],
                ["Contact Number", selectedOperator.contact_number || "—"],
                ["Email Address", selectedOperator.email || "—"],
                ["Business Address", selectedOperator.address || "—"],
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
                onClick={() => setSelectedOperator(null)}
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
