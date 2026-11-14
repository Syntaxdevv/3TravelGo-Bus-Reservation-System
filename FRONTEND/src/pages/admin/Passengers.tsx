import { useEffect, useMemo, useState } from "react";
import {
  getAdminPassengers,
  getAdminPassenger,
  type Passenger,
  type PassengerDetails,
} from "../../services/adminPassengers";

export default function Passengers() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPassenger, setSelectedPassenger] =
    useState<PassengerDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const itemsPerPage = 8;

  async function loadPassengers() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminPassengers();
      setPassengers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load passengers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPassengers();
  }, []);

  const filteredPassengers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return passengers;
    }

    return passengers.filter((passenger) =>
      [
        passenger.passenger_id,
        passenger.full_name,
        passenger.email,
        passenger.phone,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [passengers, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPassengers.length / itemsPerPage),
  );

  const paginatedPassengers = filteredPassengers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function viewPassenger(id: number) {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedPassenger(null);

      const data = await getAdminPassenger(id);
      setSelectedPassenger(data);
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : "Unable to load passenger details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setSelectedPassenger(null);
    setDetailsError("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2545]">Passengers</h1>

          <p className="mt-1 text-sm text-slate-500">
            View and monitor registered bus passengers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPassengers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <i className="fa-solid fa-rotate-right" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Passengers
            </p>

            <i className="fa-solid fa-users text-lg text-[#1765E8]" />
          </div>

          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {passengers.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Search Results</p>

            <i className="fa-solid fa-magnifying-glass text-lg text-emerald-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-[#0B2545]">
            {filteredPassengers.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-[#0B2545]">Passenger Records</h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPassengers.length} passenger(s) found
            </p>
          </div>

          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1765E8] sm:w-72"
            />
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
            Loading passengers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Passenger ID</th>

                  <th className="px-5 py-4">Full Name</th>

                  <th className="px-5 py-4">Email Address</th>

                  <th className="px-5 py-4">Contact Number</th>

                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedPassengers.map((passenger) => (
                  <tr
                    key={passenger.passenger_id}
                    className="text-sm hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-[#1765E8]">
                      PSN-{passenger.passenger_id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#1765E8]">
                          {(passenger.full_name || "P").charAt(0).toUpperCase()}
                        </div>

                        <span className="font-semibold text-slate-800">
                          {passenger.full_name || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {passenger.email || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {passenger.phone || "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => viewPassenger(passenger.passenger_id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1765E8] hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedPassengers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <i className="fa-solid fa-users mb-3 text-2xl text-slate-300" />

                      <p className="text-sm font-semibold text-slate-600">
                        No passengers found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try another search keyword.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPassengers.length > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredPassengers.length)}{" "}
              of {filteredPassengers.length} records
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

      {(selectedPassenger || detailsLoading || detailsError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="font-bold text-[#0B2545]">Passenger Details</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Passenger information
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="p-6">
              {detailsLoading && (
                <div className="py-10 text-center text-sm text-slate-500">
                  <i className="fa-solid fa-spinner fa-spin mr-2" />
                  Loading passenger details...
                </div>
              )}

              {detailsError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {detailsError}
                </p>
              )}

              {selectedPassenger && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-[#1765E8]">
                      {(selectedPassenger.full_name || "P")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-bold text-[#0B2545]">
                        {selectedPassenger.full_name || "—"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        PSN-{selectedPassenger.passenger_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-lg border border-slate-200 p-4">
                    <PassengerDetail
                      label="Full Name"
                      value={selectedPassenger.full_name}
                    />

                    <PassengerDetail
                      label="Email Address"
                      value={selectedPassenger.email}
                    />

                    <PassengerDetail
                      label="Contact Number"
                      value={selectedPassenger.phone}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PassengerDetail({
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
