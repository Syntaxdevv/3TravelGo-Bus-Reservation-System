import { useEffect, useMemo, useState } from "react";
import {
  getAdminTerminals,
  type AdminTerminal,
} from "../../services/adminTerminals";

export default function Terminals() {
  const [terminals, setTerminals] = useState<AdminTerminal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTerminal, setSelectedTerminal] =
    useState<AdminTerminal | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    async function loadTerminals() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getAdminTerminals();
        setTerminals(result.terminals);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load terminals.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTerminals();
  }, []);

  const cities = useMemo(() => {
    return [...new Set(terminals.map((terminal) => terminal.city))]
      .filter(Boolean)
      .sort();
  }, [terminals]);

  const filteredTerminals = useMemo(() => {
    return terminals.filter((terminal) => {
      const keyword = search.toLowerCase();

      const matchesSearch = [
        String(terminal.terminal_id),
        terminal.terminal_name || "",
        terminal.city || "",
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchesCity = cityFilter === "all" || terminal.city === cityFilter;

      return matchesSearch && matchesCity;
    });
  }, [terminals, search, cityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTerminals.length / itemsPerPage),
  );

  const paginatedTerminals = filteredTerminals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter]);

  return (
    <div className="w-full space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Terminals</h1>
        <p className="mt-1 text-sm text-slate-500">
          View registered bus terminals and their locations.
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
          <p className="text-sm font-medium text-slate-500">Total Terminals</p>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {isLoading ? "—" : terminals.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Registered terminal locations
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Cities Covered</p>
          <p className="mt-3 text-2xl font-bold text-[#1765E8]">
            {isLoading ? "—" : cities.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Unique terminal cities</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Filtered Results</p>
          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {isLoading ? "—" : filteredTerminals.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Matching terminal records
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-[#0B2545]">Registered Terminals</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredTerminals.length} terminal(s) found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search terminals..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-[#1765E8] sm:w-64"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-[#1765E8]"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Terminal ID</th>
                <th className="px-5 py-4">Terminal Name</th>
                <th className="px-5 py-4">City</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Loading terminals...
                  </td>
                </tr>
              ) : paginatedTerminals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No terminals found.
                  </td>
                </tr>
              ) : (
                paginatedTerminals.map((terminal) => (
                  <tr
                    key={terminal.terminal_id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-[#0B2545]">
                      #{terminal.terminal_id}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {terminal.terminal_name}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-[#1765E8]" />
                        {terminal.city}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTerminal(terminal)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] hover:bg-blue-50"
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
            {filteredTerminals.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredTerminals.length)}{" "}
            of {filteredTerminals.length} records
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

      {selectedTerminal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedTerminal(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0B2545]">
                  Terminal Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Terminal #{selectedTerminal.terminal_id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTerminal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Terminal Name
                </p>
                <p className="mt-1 text-xl font-bold text-[#0B2545]">
                  {selectedTerminal.terminal_name}
                </p>
              </div>

              {[
                ["Terminal ID", `#${selectedTerminal.terminal_id}`],
                ["Terminal Name", selectedTerminal.terminal_name],
                ["City", selectedTerminal.city],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedTerminal(null)}
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
