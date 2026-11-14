import { useEffect, useMemo, useState } from "react";
import {
  Armchair,
  BusFront,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  MapPin,
  XCircle,
} from "lucide-react";

interface Seat {
  seat_id: string | number;
  trip_id: string | number;
  seat_number: string;
  status: string;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  bus_type: string;
  origin_name: string;
  destination_name: string;
  operator_name: string;
}

interface SeatSummary {
  total_seats: number;
  available_count: number;
  reserved_count: number;
  occupied_count: number;
  other_count: number;
}

interface SeatsApiResponse {
  success: boolean;
  data: Seat[];
  total: number;
  summary: SeatSummary;
  message?: string;
}

const emptySummary: SeatSummary = {
  total_seats: 0,
  available_count: 0,
  reserved_count: 0,
  occupied_count: 0,
  other_count: 0,
};

export default function StaffSeats() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSeats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/staff/seats", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result: SeatsApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load seat availability.");
      }

      const records = Array.isArray(result.data) ? result.data : [];

      setSeats(records);

      setSelectedTripId((current) => {
        if (
          current &&
          records.some((seat) => String(seat.trip_id) === current)
        ) {
          return current;
        }

        return records.length > 0 ? String(records[0].trip_id) : "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading seats.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const trips = useMemo(() => {
    const uniqueTrips = new Map<string, Seat>();

    seats.forEach((seat) => {
      const id = String(seat.trip_id);

      if (!uniqueTrips.has(id)) {
        uniqueTrips.set(id, seat);
      }
    });

    return Array.from(uniqueTrips.values());
  }, [seats]);

  const selectedTrip = trips.find(
    (trip) => String(trip.trip_id) === selectedTripId,
  );

  const tripSeats = useMemo(() => {
    return seats
      .filter((seat) => String(seat.trip_id) === selectedTripId)
      .sort((a, b) =>
        String(a.seat_number).localeCompare(String(b.seat_number), undefined, {
          numeric: true,
        }),
      );
  }, [seats, selectedTripId]);

  const selectedSummary = useMemo<SeatSummary>(() => {
    const result = { ...emptySummary };

    tripSeats.forEach((seat) => {
      result.total_seats++;

      const status = seat.status?.toLowerCase().trim();

      if (status === "available") {
        result.available_count++;
      } else if (status === "reserved") {
        result.reserved_count++;
      } else if (status === "occupied") {
        result.occupied_count++;
      } else {
        result.other_count++;
      }
    });

    return result;
  }, [tripSeats]);

  const filteredSeats = useMemo(() => {
    return tripSeats.filter((seat) => {
      const matchesSearch = seat.seat_number
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesStatus =
        statusFilter === "all" || seat.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tripSeats, search, statusFilter]);

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-PH", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    if (Number.isNaN(hour)) return time;

    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const getSeatStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return {
          container: "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: "text-emerald-600",
        };

      case "reserved":
        return {
          container: "border-amber-200 bg-amber-50 text-amber-700",
          icon: "text-amber-600",
        };

      case "occupied":
        return {
          container: "border-red-200 bg-red-50 text-red-700",
          icon: "text-red-600",
        };

      default:
        return {
          container: "border-gray-200 bg-gray-100 text-gray-600",
          icon: "text-gray-500",
        };
    }
  };

  const statCards = [
    {
      label: "Total Seats",
      value: selectedSummary.total_seats,
      icon: Armchair,
      style: "bg-blue-50 text-blue-700",
    },
    {
      label: "Available",
      value: selectedSummary.available_count,
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Reserved",
      value: selectedSummary.reserved_count,
      icon: Clock3,
      style: "bg-amber-50 text-amber-700",
    },
    {
      label: "Occupied",
      value: selectedSummary.occupied_count,
      icon: XCircle,
      style: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">
            Seat Availability
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor seat availability for scheduled bus trips.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSeats}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load seat availability</p>

          <p className="mt-1">{error}</p>

          <button
            type="button"
            onClick={fetchSeats}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <BusFront size={19} className="text-[#0D9488]" />

          <h2 className="font-bold text-[#172B4D]">Select Trip Schedule</h2>
        </div>

        <select
          value={selectedTripId}
          onChange={(e) => {
            setSelectedTripId(e.target.value);
            setSearch("");
            setStatusFilter("all");
          }}
          disabled={loading || trips.length === 0}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
        >
          {trips.length === 0 ? (
            <option value="">No trip schedules available</option>
          ) : (
            trips.map((trip) => (
              <option key={trip.trip_id} value={String(trip.trip_id)}>
                Trip #{trip.trip_id} — {trip.origin_name} to{" "}
                {trip.destination_name} ({formatDate(trip.travel_date)})
              </option>
            ))
          )}
        </select>

        {selectedTrip && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Bus Operator</p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedTrip.operator_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">Travel Date</p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CalendarDays size={15} className="text-gray-400" />
                {formatDate(selectedTrip.travel_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">
                Departure / Arrival
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Clock3 size={15} className="text-gray-400" />
                {formatTime(selectedTrip.departure_time)} –{" "}
                {formatTime(selectedTrip.arrival_time)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400">Bus Type</p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedTrip.bus_type || "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#172B4D]">
                    {loading ? "—" : card.value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.style}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#172B4D]">Seat Overview</h2>

            <p className="mt-1 text-sm text-gray-500">
              Current seat status for the selected trip.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search seat number..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0D9488] sm:w-52"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0D9488]"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 border-b border-gray-100 px-5 py-4">
          {[
            {
              label: "Available",
              color: "bg-emerald-500",
            },
            {
              label: "Reserved",
              color: "bg-amber-500",
            },
            {
              label: "Occupied",
              color: "bg-red-500",
            },
            {
              label: "Other",
              color: "bg-gray-400",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />

              <span className="text-xs font-medium text-gray-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw size={27} className="animate-spin text-[#0D9488]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading seat availability...
            </p>
          </div>
        ) : !error && filteredSeats.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <Armchair size={35} className="text-gray-300" />

            <h3 className="mt-3 font-semibold text-gray-700">No seats found</h3>

            <p className="mt-1 text-sm text-gray-500">
              Try another search or status filter.
            </p>
          </div>
        ) : !error ? (
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {filteredSeats.length} seats displayed
              </p>

              <p className="text-xs text-gray-400">Trip #{selectedTripId}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {filteredSeats.map((seat) => {
                const style = getSeatStyle(seat.status);

                return (
                  <div
                    key={seat.seat_id}
                    className={`flex flex-col items-center justify-center rounded-xl border px-3 py-4 ${style.container}`}
                  >
                    <Armchair size={24} className={style.icon} />

                    <span className="mt-2 text-sm font-bold">
                      {seat.seat_number}
                    </span>

                    <span className="mt-1 text-[10px] font-semibold capitalize">
                      {seat.status || "Unknown"}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-xs text-gray-400">
              Seat tiles are arranged for status viewing. Their grid positions
              do not represent the physical bus seating arrangement.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <MapPin size={14} />
        <span>3TravelGo Staff Portal</span>
      </div>
    </div>
  );
}
