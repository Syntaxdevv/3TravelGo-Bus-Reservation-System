import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  Clock,
  MapPin,
  Snowflake,
  Armchair,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getCustomerTrips } from "../../services/customerTrips";
import type { CustomerTrip } from "../../types/customer";

const BUS_IMAGES = [
  "/images/bus victory.png",
  "/images/five star.jpg",
  "/images/rabiit.jpg",
  "/images/genesis bus.png",
];

function formatTravelDate(date: string) {
  if (!date) return "Not specified";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string) {
  if (!time || time === "TBA") return "TBA";

  const [hours, minutes] = time.split(":");
  const parsedHours = Number(hours);

  if (Number.isNaN(parsedHours)) return time;

  const period = parsedHours >= 12 ? "PM" : "AM";
  const formattedHours = parsedHours % 12 || 12;

  return `${formattedHours}:${minutes || "00"} ${period}`;
}

function formatDuration(departure: string, arrival: string) {
  if (!departure || !arrival || departure === "TBA" || arrival === "TBA") {
    return "See schedule";
  }

  const getMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  let difference = getMinutes(arrival) - getMinutes(departure);

  if (difference < 0) {
    difference += 24 * 60;
  }

  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hrs`;

  return `${hours} hrs ${minutes} mins`;
}

function getLocationName(terminalName?: string, cityName?: string) {
  if (terminalName && cityName) {
    return terminalName.toLowerCase().includes(cityName.toLowerCase())
      ? terminalName
      : `${terminalName}, ${cityName}`;
  }

  return terminalName || cityName || "Unknown location";
}

export default function Trips() {
  const params = new URLSearchParams(window.location.search);

  const originId = params.get("origin_id") || "";
  const destinationId = params.get("destination_id") || "";
  const travelDate = params.get("travel_date") || "";

  const [trips, setTrips] = useState<CustomerTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrips() {
      if (!originId || !destinationId || !travelDate) {
        setError("Missing search information. Please search for a trip again.");
        setLoading(false);
        return;
      }

      if (originId === destinationId) {
        setError("Departure and destination must be different.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getCustomerTrips({
          origin_id: originId,
          destination_id: destinationId,
          travel_date: travelDate,
        });

        if (active) {
          setTrips(result || []);
        }
      } catch (err) {
        console.error("Failed to load customer trips:", err);

        if (active) {
          setError("Unable to load available trips. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      active = false;
    };
  }, [originId, destinationId, travelDate]);

  function handleSelectTrip(trip: CustomerTrip) {
    const query = new URLSearchParams({
      trip_id: String(trip.trip_id),
      origin_id: originId,
      destination_id: destinationId,
      travel_date: travelDate,
    });

    window.location.href = `/customer/seats?${query.toString()}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center px-4 sm:px-6">
          <a
            href="/customer/dashboard"
            className="flex items-center gap-0 text-2xl font-extrabold tracking-tight text-[#17365d]"
          >
            3Travel<span className="text-[#009b9b]">Go</span>
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#17365d]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `
                            linear-gradient(
                                110deg,
                                rgba(23,59,94,0.96),
                                rgba(16,66,82,0.82)
                            ),
                            url("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1800&q=85")
                        `,
          }}
        />

        <div className="relative mx-auto flex min-h-[260px] max-w-6xl flex-col items-center justify-center px-4 py-14 text-center sm:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-teal-100">
            <Bus size={15} />
            Your journey starts here
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Available Trips
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            Compare schedules, explore your options, and find a trip that fits
            your journey. Your next destination starts here.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[1.3px] text-teal-700">
            Your journey
          </p>

          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-[#17365d] sm:text-3xl">
            Your Route
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-bold text-[#17365d]">
              <MapPin size={16} className="text-[#009b9b]" />
              {trips[0]
                ? getLocationName(trips[0].origin_name, trips[0].origin_city)
                : `Departure #${originId || "—"}`}
            </span>

            <ArrowRight size={16} className="text-slate-400" />

            <span className="inline-flex items-center gap-2 font-bold text-[#17365d]">
              <MapPin size={16} className="text-[#009b9b]" />
              {trips[0]
                ? getLocationName(
                    trips[0].destination_name,
                    trips[0].destination_city,
                  )
                : `Destination #${destinationId || "—"}`}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={15} className="text-[#009b9b]" />
            <span>Travel date: {formatTravelDate(travelDate)}</span>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
              <RefreshCw size={25} className="animate-spin text-teal-700" />
            </div>

            <h3 className="text-lg font-extrabold text-[#17365d]">
              Searching Available Buses
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we find trips for your journey.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>

            <h3 className="mb-2 text-xl font-extrabold text-[#17365d]">
              Something Went Wrong
            </h3>

            <p className="mx-auto max-w-md text-sm leading-7 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <Bus size={30} />
            </div>

            <h3 className="mb-2 text-xl font-extrabold text-[#17365d]">
              No Trips Available
            </h3>

            <p className="mx-auto max-w-md text-sm leading-7 text-slate-500">
              No scheduled trips were found for this route and travel date.
              Please try another date or destination.
            </p>

            <a
              href="/customer/book-trip"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-teal-700"
            >
              Search Another Trip
              <ArrowRight size={16} />
            </a>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-extrabold text-[#17365d]">
                Available Buses
              </h3>

              <span className="text-xs font-semibold text-slate-500">
                {trips.length} {trips.length === 1 ? "trip" : "trips"} found
              </span>
            </div>

            <div className="space-y-4">
              {trips.map((trip, index) => {
                const operator = trip.operator_name || "Bus Operator";
                const busType = trip.bus_type || "Air-conditioned Bus";
                const departure = trip.departure_time || "TBA";
                const arrival = trip.arrival_time || "TBA";
                const seats = Number(trip.available_seats || 0);
                const fare = Number(trip.fare || 0);
                const busImage = BUS_IMAGES[index % BUS_IMAGES.length];

                const origin = getLocationName(
                  trip.origin_name,
                  trip.origin_city,
                );

                const destination = getLocationName(
                  trip.destination_name,
                  trip.destination_city,
                );

                const duration = formatDuration(departure, arrival);

                return (
                  <article
                    key={trip.trip_id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-teal-300 hover:shadow-md sm:p-6"
                  >
                    <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12">
                      <div className="lg:col-span-3">
                        <div className="mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-40 lg:h-32">
                          <img
                            src={busImage}
                            alt={`${operator} bus`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <h3 className="mb-1 text-base font-extrabold text-[#17365d]">
                          {operator}
                        </h3>

                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <Snowflake size={14} className="text-teal-600" />
                          {busType}
                        </p>

                        {trip.bus_number && (
                          <p className="mt-2 text-xs text-slate-400">
                            Bus No. {trip.bus_number}
                          </p>
                        )}
                      </div>

                      <div className="border-y border-slate-200 py-5 lg:col-span-5 lg:border-y-0 lg:border-x lg:px-5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="whitespace-nowrap text-lg font-extrabold tracking-tight text-[#17365d] sm:text-xl">
                              {formatTime(departure)}
                            </p>

                            <p className="mt-1 max-w-[125px] break-words text-xs text-slate-500">
                              {origin}
                            </p>
                          </div>

                          <div className="min-w-0 flex-1 px-2 text-center">
                            <span className="mb-2 block whitespace-nowrap text-[10px] font-semibold text-slate-500">
                              <Clock size={11} className="mr-1 inline" />
                              {duration}
                            </span>

                            <div className="relative h-px w-full bg-slate-300">
                              <span className="absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full border-2 border-teal-600 bg-white" />
                              <span className="absolute -top-[3px] right-0 h-[7px] w-[7px] rounded-full border-2 border-teal-700 bg-white" />
                            </div>
                          </div>

                          <div className="min-w-0 text-right">
                            <p className="whitespace-nowrap text-lg font-extrabold tracking-tight text-[#17365d] sm:text-xl">
                              {formatTime(arrival)}
                            </p>

                            <p className="mt-1 max-w-[125px] break-words text-xs text-slate-500">
                              {destination}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Armchair size={14} className="text-teal-600" />
                            {seats} available seats
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <Snowflake size={14} className="text-teal-600" />
                            {busType}
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-4">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
                          <div>
                            <p className="mb-1 text-xs text-slate-500">
                              Starting from
                            </p>

                            <p className="text-2xl font-extrabold tracking-tight text-teal-700">
                              ₱
                              {fare.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>

                          {seats > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSelectTrip(trip)}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-600 bg-teal-600 px-5 py-3 text-xs font-bold text-white transition hover:border-teal-700 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100"
                            >
                              Select Trip
                              <ArrowRight size={15} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-5 py-3 text-xs font-bold text-slate-400"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
