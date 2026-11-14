import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Clock,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  getCustomerSeats,
  type CustomerSeatTrip,
} from "../../services/customerSeats";

import { processCustomerPayment } from "../../services/customerPayment";

interface PassengerForm {
  full_name: string;
  contact_number: string;
  email: string;
}

interface BookingData {
  trip_id: string;
  seat_ids: string[];
  seat_numbers: string[];
  passengers: PassengerForm[];
}

type PaymentMethod = "PayPal" | "QR Ph" | "GCash";

const STORAGE_KEY = "3travelgo_passenger_information";
const CONFIRMATION_KEY = "3travelgo_reservation_confirmation";

function getBookingData(): BookingData | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    return JSON.parse(saved) as BookingData;
  } catch {
    return null;
  }
}

export default function Payment() {
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get("trip_id") ?? "";

  const [booking] = useState<BookingData | null>(getBookingData);
  const [trip, setTrip] = useState<CustomerSeatTrip | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PayPal");

  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrip() {
      if (!tripId) {
        setError("Trip information is missing.");
        setLoading(false);
        return;
      }

      try {
        const result = await getCustomerSeats(tripId);

        if (active) {
          setTrip(result.trip);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load booking information.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTrip();

    return () => {
      active = false;
    };
  }, [tripId]);

  const selectedSeatIds = booking?.seat_ids ?? [];
  const selectedSeatNumbers = booking?.seat_numbers ?? [];
  const seatCount = selectedSeatIds.length;

  const fare = Number(trip?.fare ?? 0);
  const totalAmount = fare * seatCount;

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setNotice("");

    if (!booking || !trip || seatCount === 0) {
      setError(
        "Booking information is incomplete. Please select your seats again.",
      );
      return;
    }

    if (Number(booking.trip_id) !== Number(tripId)) {
      setError("Trip information does not match your selected booking.");
      return;
    }

    if (
      seatCount > 5 ||
      selectedSeatIds.length !== selectedSeatNumbers.length ||
      !booking.passengers ||
      booking.passengers.length !== seatCount
    ) {
      setError(
        "Your passenger or seat information is incomplete. Please review your booking.",
      );
      return;
    }

    const validSeatIds = selectedSeatIds.every(
      (id) => Number.isInteger(Number(id)) && Number(id) > 0,
    );

    if (!validSeatIds) {
      setError("Invalid seat information. Please select your seats again.");
      return;
    }

    const validPassengers = booking.passengers.every(
      (passenger) =>
        passenger.full_name.trim() !== "" &&
        passenger.contact_number.trim() !== "" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email.trim()),
    );

    if (!validPassengers) {
      setError("Please check your passenger information before continuing.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await processCustomerPayment({
        trip_id: Number(tripId),
        seat_ids: selectedSeatIds.map(Number),
        passengers: booking.passengers,
        payment_method: paymentMethod,
      });

      sessionStorage.setItem(
        CONFIRMATION_KEY,
        JSON.stringify({
          ...result,
          trip_id: Number(tripId),
          passengers: booking.passengers,
        }),
      );

      sessionStorage.removeItem(STORAGE_KEY);
      setAccountNumber("");

      window.location.href = "/customer/reservation-success";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your reservation. Please try again.",
      );

      setSubmitting(false);
    }
  }

  const paymentOptions: {
    name: PaymentMethod;
    description: string;
    symbol: string;
    symbolClass: string;
  }[] = [
    {
      name: "PayPal",
      description: "Payment option through PayPal.",
      symbol: "P",
      symbolClass: "text-[#003087] italic text-xl",
    },
    {
      name: "QR Ph",
      description: "QR Ph payment option.",
      symbol: "QR\nPH",
      symbolClass: "text-[#173b5e] text-[11px] leading-tight",
    },
    {
      name: "GCash",
      description: "Payment option through GCash.",
      symbol: "G",
      symbolClass: "text-blue-600 text-lg",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700">
      <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-[1360px] items-center px-5 sm:px-8">
          <a
            href="/customer/dashboard"
            className="flex items-center gap-0 text-2xl font-extrabold tracking-tight text-[#17365d]"
          >
            3Travel<span className="text-[#009b9b]">Go</span>
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-[calc(100%-28px)] max-w-[1180px] grid-cols-1 items-start gap-6 py-7 sm:w-[calc(100%-48px)] sm:py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(23,59,94,0.05)] sm:p-8">
          <div className="mb-7">
            <h1 className="text-xl font-extrabold text-[#173b5e] sm:text-2xl">
              Booking Summary
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review your trip details before payment.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[180px] items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle className="animate-spin" size={20} />
              Loading booking information...
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="h-[82px] w-[110px] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-[90px] sm:w-[125px]">
                  <img
                    src="/images/victory liner.jpg"
                    alt="3TravelGo Bus"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-[#173b5e] sm:text-lg">
                    {trip?.operator_name || "Bus Operator"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {trip?.bus_type || "Bus Type"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Bus No. {trip?.bus_number || "Not available"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Trip #{trip?.trip_id ?? tripId}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="py-4">
                  <p className="mb-1.5 text-xs font-medium text-slate-500">
                    Travel Date
                  </p>

                  <p className="flex items-center gap-2 text-sm font-bold text-[#173b5e]">
                    <CalendarDays size={16} className="text-teal-600" />
                    {trip?.travel_date || "Not specified"}
                  </p>
                </div>

                <div className="py-4">
                  <p className="mb-1.5 text-xs font-medium text-slate-500">
                    Departure Time
                  </p>

                  <p className="flex items-center gap-2 text-sm font-bold text-[#173b5e]">
                    <Clock size={16} className="text-teal-600" />
                    {trip?.departure_time || "Not specified"}
                  </p>
                </div>

                <div className="py-4">
                  <p className="mb-1.5 text-xs font-medium text-slate-500">
                    Selected Seats ({seatCount})
                  </p>

                  <p className="break-words text-sm font-bold text-[#173b5e]">
                    {selectedSeatNumbers.length > 0
                      ? selectedSeatNumbers.join(", ")
                      : "No seats selected"}
                  </p>
                </div>

                <div className="py-4">
                  <p className="mb-1.5 text-xs font-medium text-slate-500">
                    Fare per Seat
                  </p>

                  <p className="text-sm font-bold text-[#173b5e]">
                    ₱
                    {fare.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="py-4">
                  <p className="mb-1.5 text-xs font-medium text-slate-500">
                    Number of Seats
                  </p>

                  <p className="text-sm font-bold text-[#173b5e]">
                    {seatCount}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
                <span className="text-sm font-extrabold text-[#173b5e]">
                  Total Amount
                </span>

                <span className="whitespace-nowrap text-2xl font-extrabold text-teal-600 sm:text-[27px]">
                  ₱
                  {totalAmount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(23,59,94,0.05)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-[#173b5e] sm:text-2xl">
              Payment Method
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose your preferred payment option.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              {notice}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit}>
            <div className="flex flex-col gap-3">
              {paymentOptions.map((option) => {
                const selected = paymentMethod === option.name;

                return (
                  <label
                    key={option.name}
                    className={`group flex min-h-[82px] cursor-pointer items-center gap-4 rounded-xl border px-4 py-4 transition ${
                      selected
                        ? "border-teal-600 bg-teal-50/60"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={option.name}
                      checked={selected}
                      disabled={submitting}
                      onChange={() => {
                        setPaymentMethod(option.name);
                        setNotice("");
                      }}
                      className="sr-only"
                    />

                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center whitespace-pre-line rounded-xl border border-slate-200 bg-white font-extrabold ${option.symbolClass}`}
                    >
                      {option.symbol}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#173b5e]">
                        {option.name}
                      </span>

                      <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                        {option.description}
                      </span>
                    </span>

                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-[10px] text-white ${
                        selected
                          ? "border-teal-600 bg-teal-600"
                          : "border-slate-300"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <h3 className="text-base font-extrabold text-[#173b5e]">
                Payment Details
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                This is a demonstration form. No actual payment will be
                collected. Do not enter real bank, PayPal, or e-wallet account
                details.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="account_number"
                  className="mb-2 block text-xs font-bold text-[#173b5e]"
                >
                  Demo Account Number (Optional)
                </label>

                <div className="relative">
                  <CreditCard
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    id="account_number"
                    value={accountNumber}
                    onChange={(event) => {
                      setAccountNumber(event.target.value);
                      setNotice("");
                    }}
                    placeholder="Enter dummy account number"
                    maxLength={50}
                    autoComplete="off"
                    disabled={submitting}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#173b5e] outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading || submitting || !trip || !booking || seatCount === 0
              }
              className="mt-6 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#173b5e] px-5 py-4 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Submitting Reservation...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Confirm Reservation
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
