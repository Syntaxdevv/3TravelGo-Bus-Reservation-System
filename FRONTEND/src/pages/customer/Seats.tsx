import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Armchair,
  Bus,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

import {
  getCustomerSeats,
  type CustomerSeat,
  type CustomerSeatTrip,
} from "../../services/customerSeats";

const MAX_SEATS = 5;

export default function Seats() {
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get("trip_id");

  const originId = params.get("origin_id") ?? "";
  const destinationId = params.get("destination_id") ?? "";
  const travelDateParam = params.get("travel_date") ?? "";

  const [trip, setTrip] = useState<CustomerSeatTrip | null>(null);
  const [seats, setSeats] = useState<CustomerSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSeats() {
      if (!tripId) {
        setError("Trip information is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getCustomerSeats(tripId);

        if (!isMounted) return;

        setTrip({
          ...response.trip,
          trip_id: Number(response.trip.trip_id),
          bus_id: Number(response.trip.bus_id),
          fare: Number(response.trip.fare),
          seat_capacity: Number(response.trip.seat_capacity),
        });

        setSeats(
          response.seats.map((seat) => ({
            ...seat,
            seat_id: Number(seat.seat_id),
            seat_number: String(seat.seat_number),
            status: seat.status,
          })),
        );
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load seat information.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSeats();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const selectedSeatNumbers = useMemo(() => {
    return seats
      .filter((seat) => selectedSeats.includes(Number(seat.seat_id)))
      .map((seat) => seat.seat_number);
  }, [seats, selectedSeats]);

  const fare = Number(trip?.fare ?? 0);
  const totalFare = fare * selectedSeats.length;

  function toggleSeat(seat: CustomerSeat) {
    if (seat.status === "booked") return;

    const seatId = Number(seat.seat_id);

    setSelectedSeats((previous) => {
      if (previous.includes(seatId)) {
        setSelectionMessage("");
        return previous.filter((id) => id !== seatId);
      }

      if (previous.length >= MAX_SEATS) {
        setSelectionMessage("You can only select up to 5 seats.");
        return previous;
      }

      setSelectionMessage("");
      return [...previous, seatId];
    });
  }

  function formatDate(date: string) {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    if (!time) return "--:--";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function continueBooking() {
    if (!trip || selectedSeats.length === 0) {
      setSelectionMessage("Please select at least one seat.");
      return;
    }

    const query = new URLSearchParams({
      trip_id: String(trip.trip_id),
      seat_ids: selectedSeats.join(","),
      seat_numbers: selectedSeatNumbers.join(","),
      origin_id: originId,
      destination_id: destinationId,
      travel_date: travelDateParam || trip.travel_date,
    });

    window.location.href = `/customer/passenger-information?${query.toString()}`;
  }

  const seatRows = useMemo(() => {
    const rows: CustomerSeat[][] = [];

    for (let index = 0; index < seats.length; index += 4) {
      rows.push(seats.slice(index, index + 4));
    }

    return rows;
  }, [seats]);

  function getSeatClass(seat: CustomerSeat) {
    const isSelected = selectedSeats.includes(Number(seat.seat_id));

    if (seat.status === "booked") {
      return "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed";
    }

    if (isSelected) {
      return "border-emerald-600 bg-emerald-600 text-white shadow-sm";
    }

    return "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center px-4 sm:px-6">
          <a
            href="/customer/dashboard"
            className="flex items-center gap-0 text-2xl font-extrabold tracking-tight text-[#17365d]"
          >
            3Travel<span className="text-[#009b9b]">Go</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            Booking details
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Select Your Seat
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Choose your preferred seat before continuing with your reservation.
          </p>

          {trip && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Bus size={16} className="text-emerald-600" />
                {trip.bus_number || "Bus"}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-emerald-600" />
                {formatDate(trip.travel_date)}
              </span>

              <span className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                {formatTime(trip.departure_time)}
                {" - "}
                {formatTime(trip.arrival_time)}
              </span>

              <span>{trip.bus_type}</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <RefreshCw size={30} className="animate-spin text-emerald-600" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading available seats...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">Unable to load seats</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && trip && (
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
            <section className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Choose Your Seat
                  </h2>

                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-slate-300 bg-white" />
                      Available
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-emerald-600 bg-emerald-600" />
                      Selected
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-slate-200 bg-slate-100" />
                      Booked
                    </div>
                  </div>
                </div>

                <div className="mx-auto max-w-[470px] rounded-t-[55px] rounded-b-3xl border border-slate-200 bg-slate-50 p-4 pt-8 sm:p-7 sm:pt-10">
                  <div className="mb-8 flex items-center justify-between border-b border-dashed border-slate-300 pb-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Bus size={17} />
                      Front
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400">
                      <Armchair size={20} />
                    </div>
                  </div>

                  {seats.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                      No seats found for this trip.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {seatRows.map((row, rowIndex) => (
                        <div
                          key={`row-${rowIndex}`}
                          className="grid grid-cols-[28px_repeat(2,minmax(0,1fr))_28px_repeat(2,minmax(0,1fr))] items-center gap-2 sm:gap-3"
                        >
                          <span className="text-center text-xs font-semibold text-slate-400">
                            {rowIndex + 1}
                          </span>

                          {row.slice(0, 2).map((seat) => (
                            <button
                              key={seat.seat_id}
                              type="button"
                              disabled={seat.status === "booked"}
                              onClick={() => toggleSeat(seat)}
                              className={`flex h-11 items-center justify-center rounded-lg border text-sm font-bold transition-all duration-150 sm:h-12 ${getSeatClass(seat)}`}
                              title={
                                seat.status === "booked"
                                  ? "Already booked"
                                  : `Select seat ${seat.seat_number}`
                              }
                            >
                              {seat.seat_number}
                            </button>
                          ))}

                          <div />

                          {row.slice(2, 4).map((seat) => (
                            <button
                              key={seat.seat_id}
                              type="button"
                              disabled={seat.status === "booked"}
                              onClick={() => toggleSeat(seat)}
                              className={`flex h-11 items-center justify-center rounded-lg border text-sm font-bold transition-all duration-150 sm:h-12 ${getSeatClass(seat)}`}
                              title={
                                seat.status === "booked"
                                  ? "Already booked"
                                  : `Select seat ${seat.seat_number}`
                              }
                            >
                              {seat.seat_number}
                            </button>
                          ))}

                          {row.length < 4 &&
                            Array.from({
                              length: 4 - row.length,
                            }).map((_, index) => (
                              <div key={`empty-${rowIndex}-${index}`} />
                            ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 border-t border-dashed border-slate-300 pt-5 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Back of the bus
                    </span>
                  </div>
                </div>

                {selectionMessage && (
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    {selectionMessage}
                  </div>
                )}

                <p className="mt-5 text-center text-xs text-slate-400">
                  You can select up to {MAX_SEATS} seats per booking.
                </p>
              </div>
            </section>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Booking Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review your selected seats
                </p>

                <div className="my-6 border-t border-slate-100" />

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Selected Seats
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {selectedSeats.length} / {MAX_SEATS}
                    </span>
                  </div>

                  {selectedSeatNumbers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeatNumbers.map((number) => (
                        <span
                          key={number}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                      <Armchair size={23} className="mx-auto text-slate-300" />
                      <p className="mt-2 text-xs text-slate-400">
                        No seats selected yet
                      </p>
                    </div>
                  )}
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Fare per passenger</span>

                    <span className="font-semibold text-slate-800">
                      ₱
                      {fare.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Passengers</span>

                    <span className="font-semibold text-slate-800">
                      {selectedSeats.length}
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total Fare</span>

                  <span className="text-2xl font-bold text-emerald-600">
                    ₱
                    {totalFare.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={continueBooking}
                  disabled={selectedSeats.length === 0}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Seat selection summary
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
