import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  User,
  XCircle,
  Armchair,
  BusFront,
} from "lucide-react";

interface Reservation {
  booking_reference: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  origin_name: string;
  destination_name: string;
  operator_name: string;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  bus_type: string;
  booking_status: string;
  checked_in: boolean;
  seat_numbers: string[];
  booking_ids: string[];
  can_check_in: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export default function StaffQRScanner() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedRef = useRef(false);

  const [reference, setReference] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const lookupReservation = async (bookingReference: string) => {
    if (!bookingReference.trim()) {
      setError("Please enter a booking reference.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setReservation(null);

    try {
      const response = await fetch(
        `/api/staff/check-in/${encodeURIComponent(bookingReference.trim())}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result: ApiResponse<Reservation> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Reservation not found.");
      }

      setReservation(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve reservation.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "staff-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        rememberLastUsedCamera: true,
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (scannedRef.current) return;

        scannedRef.current = true;

        const bookingReference = decodedText.trim().replace(/^3TRAVELGO:/i, "");

        setReference(bookingReference);
        lookupReservation(bookingReference);
      },
      () => {},
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  const handleManualSearch = () => {
    scannedRef.current = true;
    lookupReservation(reference);
  };

  const handleCheckIn = async () => {
    if (!reservation || !reservation.can_check_in) return;

    setCheckingIn(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/staff/check-in", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          booking_reference: reservation.booking_reference,
        }),
      });

      const result: ApiResponse<{
        booking_reference: string;
        checked_in_count: number;
        checked_in_at: string;
      }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Check-in failed.");
      }

      await lookupReservation(reservation.booking_reference);

      setSuccessMessage(result.message || "Passenger checked in successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete check-in.",
      );
    } finally {
      setCheckingIn(false);
    }
  };

  const resetScanner = () => {
    scannedRef.current = false;
    setReference("");
    setReservation(null);
    setError("");
    setSuccessMessage("");
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-amber-100 text-amber-700";

      case "cancelled":
      case "canceled":
      case "invalid":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "Not specified";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">QR Code Scanner</h1>

          <p className="mt-1 text-sm text-slate-500">
            Scan and verify passenger reservations before check-in.
          </p>
        </div>

        <button
          type="button"
          onClick={resetScanner}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          New Scan
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <Camera size={21} />
            </div>

            <div>
              <h2 className="font-bold text-[#172B4D]">Scan Passenger QR</h2>

              <p className="text-xs text-slate-500">
                Position the QR code inside the camera frame.
              </p>
            </div>
          </div>

          <div
            id="staff-qr-reader"
            className="w-full overflow-hidden rounded-lg border border-slate-200"
          />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-medium text-slate-400">
              OR ENTER MANUALLY
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Booking Reference
            </label>

            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualSearch();
                }
              }}
              placeholder="Enter booking reference"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={handleManualSearch}
              disabled={loading || !reference.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#172B4D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#233F68] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={17} />
              {loading ? "Searching..." : "Find Reservation"}
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Camera access is required to scan passenger QR codes. You can also
            enter the booking reference manually.
          </p>
        </section>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#172B4D]">Reservation Details</h2>

              <p className="mt-1 text-xs text-slate-500">
                Passenger and trip verification
              </p>
            </div>

            <BusFront className="text-slate-400" size={23} />
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-slate-400">
              <RefreshCw className="mb-3 animate-spin" size={25} />
              <p className="text-sm">Loading reservation...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg bg-red-50 p-5 text-center">
              <XCircle className="mb-3 text-red-500" size={35} />
              <p className="font-bold text-red-700">Reservation Not Found</p>
              <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
          ) : !reservation ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <Camera className="mb-3 text-slate-300" size={38} />

              <p className="font-semibold text-slate-600">
                Waiting for QR Scan
              </p>

              <p className="mt-2 max-w-xs text-sm text-slate-400">
                Scan a passenger QR code or enter a booking reference to display
                reservation details.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Booking Reference</p>

                  <p className="mt-1 break-all text-sm font-bold text-[#172B4D]">
                    {reservation.booking_reference}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                    reservation.booking_status,
                  )}`}
                >
                  {reservation.booking_status || "Unknown"}
                </span>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Passenger Information
                </h3>

                <div className="flex items-start gap-3">
                  <User size={18} className="mt-0.5 text-slate-400" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {reservation.passenger_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {reservation.passenger_email}
                    </p>

                    <p className="text-xs text-slate-500">
                      {reservation.passenger_phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Trip Information
                </h3>

                <div className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-orange-500"
                    />

                    <div>
                      <p className="font-bold text-[#172B4D]">
                        {reservation.origin_name}
                      </p>

                      <p className="my-1 text-xs text-slate-400">to</p>

                      <p className="font-bold text-[#172B4D]">
                        {reservation.destination_name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Travel Date</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDate(reservation.travel_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Operator</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {reservation.operator_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Departure</p>

                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Clock size={14} />
                        {formatTime(reservation.departure_time)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Arrival</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatTime(reservation.arrival_time)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Bus Type</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {reservation.bus_type}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Seat Number</p>

                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Armchair size={15} />
                        {reservation.seat_numbers.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 size={18} className="shrink-0" />
                  {successMessage}
                </div>
              )}

              {reservation.checked_in ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 font-bold text-green-700">
                    <CheckCircle2 size={20} />
                    Already Checked In
                  </div>

                  <p className="mt-1 text-xs text-green-600">
                    This reservation has already been checked in.
                  </p>
                </div>
              ) : reservation.can_check_in ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EA580C] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={18} />

                  {checkingIn
                    ? "Processing Check-in..."
                    : "Confirm Passenger Check-in"}
                </button>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  This reservation is not eligible for check-in.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
