import { useEffect, useState } from "react";
import * as QRCode from "qrcode";

import {
  getCustomerSeats,
  type CustomerSeatTrip,
} from "../../services/customerSeats";

interface PassengerForm {
  full_name: string;
  contact_number: string;
  email: string;
}

interface ReservationConfirmation {
  booking_reference: string;
  payment_reference: string;
  booking_ids: number[];
  seat_numbers: string[];
  seat_count: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  trip_id: number;
  passengers: PassengerForm[];
}

type ConfirmationTrip = CustomerSeatTrip & {
  origin?: string;
  destination?: string;
  origin_name?: string;
  destination_name?: string;
  origin_terminal?: string;
  destination_terminal?: string;
};

const CONFIRMATION_KEY = "3travelgo_reservation_confirmation";

function getConfirmation(): ReservationConfirmation | null {
  try {
    const saved = sessionStorage.getItem(CONFIRMATION_KEY);

    if (!saved) {
      return null;
    }

    return JSON.parse(saved) as ReservationConfirmation;
  } catch {
    return null;
  }
}

function getRouteValue(trip: ConfirmationTrip | null, keys: string[]): string {
  if (!trip) {
    return "Not specified";
  }

  const data = trip as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "Not specified";
}

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: string): string {
  const normalized = status.toLowerCase();

  if (["demo_paid", "paid", "completed", "success"].includes(normalized)) {
    return "Demo Paid";
  }

  if (["failed", "declined", "cancelled"].includes(normalized)) {
    return "Failed";
  }

  if (normalized === "processing") {
    return "Processing";
  }

  return "Pending";
}

export default function ReservationSuccess() {
  const [confirmation] = useState<ReservationConfirmation | null>(
    getConfirmation,
  );

  const [trip, setTrip] = useState<ConfirmationTrip | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTrip() {
      if (!confirmation?.trip_id) {
        return;
      }

      try {
        const result = await getCustomerSeats(String(confirmation.trip_id));

        if (active) {
          setTrip(result.trip as ConfirmationTrip);
        }
      } catch (error) {
        console.error("Unable to load reservation trip details:", error);
      }
    }

    loadTrip();

    return () => {
      active = false;
    };
  }, [confirmation]);

  const passengers = confirmation?.passengers ?? [];

  const passengerNames = passengers
    .map((passenger) => passenger.full_name)
    .filter(Boolean)
    .join(", ");

  const passengerEmails = passengers
    .map((passenger) => passenger.email)
    .filter(Boolean)
    .join(", ");

  const selectedSeats = confirmation?.seat_numbers ?? [];

  const seatCount = confirmation?.seat_count ?? selectedSeats.length;

  const bookingIds = confirmation?.booking_ids ?? [];

  const bookingId =
    bookingIds.length > 0 ? bookingIds.join(", ") : "Not generated";

  const referenceNumber =
    confirmation?.payment_reference ||
    confirmation?.booking_reference ||
    "Not generated";

  const paymentMethod = confirmation?.payment_method ?? "Not specified";

  const fare = Number(trip?.fare ?? 0);

  const totalAmount = Number(confirmation?.total_amount ?? fare * seatCount);

  const operator = trip?.operator_name || "Not specified";

  const origin = getRouteValue(trip, [
    "origin_name",
    "origin_terminal",
    "origin",
  ]);

  const destination = getRouteValue(trip, [
    "destination_name",
    "destination_terminal",
    "destination",
  ]);

  const travelDate = trip?.travel_date || "Not specified";

  const travelTime = trip?.departure_time || "Not specified";

  const status = formatStatus(
    confirmation?.payment_status ?? confirmation?.booking_status ?? "pending",
  );

  const handleDownloadQR = async () => {
    const bookingReference = confirmation?.booking_reference;

    if (!bookingReference) {
      alert("Booking reference is not available.");
      return;
    }

    try {
      const qrContent = `3TRAVELGO:${bookingReference}`;

      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: 500,
        margin: 3,
        errorCorrectionLevel: "H",
        color: {
          dark: "#102e56",
          light: "#FFFFFF",
        },
      });

      const link = document.createElement("a");

      link.href = qrDataUrl;
      link.download = `3TravelGo-QR-${bookingReference}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("QR Code generation failed:", error);
      alert("Unable to download QR Code. Please try again.");
    }
  };

  if (!confirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f6fc] px-5 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-[#e0eaf5] bg-white p-8 text-center shadow-[0_8px_28px_rgba(35,72,120,0.07)]">
          <h1 className="text-xl font-extrabold text-[#102e56]">
            Confirmation Not Found
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            We couldn't find your booking confirmation. Please book a trip to
            generate a new confirmation.
          </p>

          <a
            href="/customer/trips"
            className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            Browse Trips
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f6fc] font-sans text-[#183253]">
      <header className="sticky top-0 z-40 min-h-[72px] border-b border-slate-200 bg-white shadow-[0_3px_15px_rgba(23,59,94,0.025)] sm:min-h-[78px]">
        <div className="mx-auto flex min-h-[72px] max-w-[1200px] items-center px-5 sm:min-h-[78px] sm:px-8">
          <a
            href="/customer/dashboard"
            className="flex items-center gap-0 text-2xl font-extrabold tracking-tight text-[#17365d]"
          >
            3Travel<span className="text-[#009b9b]">Go</span>
          </a>
        </div>
      </header>

      <main className="confirmation-container mx-auto my-5 w-[calc(100%-24px)] max-w-[860px] rounded-2xl border border-[#e0eaf5] bg-white px-4 py-6 shadow-[0_8px_28px_rgba(35,72,120,0.07)] sm:my-8 sm:px-8 sm:py-8">
        <div className="success-icon mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-500 text-3xl font-bold text-white sm:h-16 sm:w-16 sm:text-4xl">
          ✓
        </div>

        <h1 className="text-center text-[23px] font-extrabold tracking-tight text-[#102e56] sm:text-[28px]">
          Booking Confirmed!
        </h1>

        <p className="mx-auto mb-6 mt-2 max-w-md text-center text-xs leading-relaxed text-slate-500 sm:mb-7 sm:text-sm">
          Your reservation has been successfully created.
        </p>

        <section className="receipt-card rounded-xl border border-[#e2ebf6] bg-white p-4 text-left shadow-[0_4px_18px_rgba(35,72,120,0.045)] sm:p-6">
          <div className="border-b border-slate-100 pb-5">
            <span className="text-xs font-medium text-slate-400">
              Booking ID
            </span>

            <p className="mt-1.5 break-words text-lg font-extrabold text-[#102e56] sm:text-xl">
              {bookingId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-6 pt-5 sm:gap-x-8">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Passenger</p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {passengerNames || "Passenger"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Route</p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {origin} → {destination}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Email</p>

              <p className="mt-2 break-all text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {passengerEmails || "Not provided"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Departure Time
              </p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {travelTime}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Travel Date</p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {travelDate}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Payment Method
              </p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-blue-600 sm:text-sm">
                {paymentMethod}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Bus Operator</p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {operator}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Selected Seats ({seatCount})
              </p>

              <p className="mt-2 break-words text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {selectedSeats.join(", ") || "Not specified"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Fare per Seat
              </p>

              <p className="mt-2 text-xs font-bold text-[#263e5d] sm:text-sm">
                {formatCurrency(fare)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Reference Number
              </p>

              <p className="mt-2 break-all text-xs font-bold leading-relaxed text-[#263e5d] sm:text-sm">
                {referenceNumber}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Number of Seats
              </p>

              <p className="mt-2 text-xs font-bold text-[#263e5d] sm:text-sm">
                {seatCount}
              </p>
            </div>

            <div className="relative min-w-0 pb-8 sm:pb-0">
              <p className="text-xs font-medium text-slate-400">Total Amount</p>

              <p className="mt-2 text-lg font-extrabold text-[#102e56] sm:text-[22px]">
                {formatCurrency(totalAmount)}
              </p>

              <span className="status-badge absolute bottom-0 left-0 rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-bold text-green-700 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:text-[11px]">
                {status}
              </span>
            </div>
          </div>
        </section>

        <div className="no-print mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
          <a
            href="/customer/trips"
            className="flex min-h-12 items-center justify-center rounded-lg bg-teal-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100"
          >
            Book Another Trip
          </a>

          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex min-h-12 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:border-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Download QR Code
          </button>
        </div>

        <p className="no-print mt-5 text-center text-xs leading-relaxed text-slate-400">
          Please keep your booking details for future reference.
        </p>
      </main>
    </div>
  );
}
