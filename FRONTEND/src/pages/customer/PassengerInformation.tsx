import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, User, Phone, Mail, Users } from "lucide-react";

import type { CustomerUser } from "../../services/customerAuth";

interface Props {
  customer: CustomerUser;
}

interface PassengerForm {
  full_name: string;
  contact_number: string;
  email: string;
}

export default function PassengerInformation({ customer }: Props) {
  const params = new URLSearchParams(window.location.search);

  const tripId = params.get("trip_id") ?? "";
  const seatIds = params.get("seat_ids") ?? "";
  const seatNumbers = params.get("seat_numbers") ?? "";

  const selectedSeatIds = useMemo(
    () => seatIds.split(",").filter(Boolean),
    [seatIds],
  );

  const selectedSeatNumbers = useMemo(
    () => seatNumbers.split(",").filter(Boolean),
    [seatNumbers],
  );

  const [passengers, setPassengers] = useState<PassengerForm[]>(() =>
    selectedSeatIds.map((_, index) => ({
      full_name: index === 0 ? customer.name : "",
      contact_number: index === 0 ? (customer.phone ?? "") : "",
      email: index === 0 ? customer.email : "",
    })),
  );

  const [error, setError] = useState("");

  function updatePassenger(
    index: number,
    field: keyof PassengerForm,
    value: string,
  ) {
    setPassengers((previous) =>
      previous.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [field]: value } : passenger,
      ),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!tripId || selectedSeatIds.length === 0) {
      setError(
        "Missing trip or seat information. Please select your seats again.",
      );
      return;
    }

    if (
      passengers.some(
        (passenger) =>
          !passenger.full_name.trim() ||
          !passenger.contact_number.trim() ||
          !passenger.email.trim(),
      )
    ) {
      setError("Please complete all passenger information.");
      return;
    }

    const invalidEmail = passengers.some(
      (passenger) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email),
    );

    if (invalidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    const bookingData = {
      trip_id: tripId,
      seat_ids: selectedSeatIds,
      seat_numbers: selectedSeatNumbers,
      passengers,
    };

    sessionStorage.setItem(
      "3travelgo_passenger_information",
      JSON.stringify(bookingData),
    );

    window.location.href = `/customer/payment?trip_id=${encodeURIComponent(tripId)}&seat_ids=${encodeURIComponent(seatIds)}&seat_numbers=${encodeURIComponent(seatNumbers)}`;
  }

  return (
    <div className="min-h-screen bg-[#f3f7fc] font-sans text-[#26364b] antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-[#e1e8f0] bg-white shadow-sm">
        <div className="mx-auto flex min-h-[70px] w-full max-w-6xl items-center px-5 sm:min-h-[76px] sm:px-6">
          <a
            href="/customer/dashboard"
            className="flex items-center gap-0 text-2xl font-extrabold tracking-tight text-[#17365d]"
          >
            3Travel<span className="text-[#009b9b]">Go</span>
          </a>
        </div>
      </header>

      <main className="mx-auto my-7 w-[calc(100%-28px)] max-w-[700px] rounded-[18px] border border-[#e1e8f0] bg-white px-5 py-8 shadow-[0_18px_45px_rgba(23,59,94,0.09)] sm:my-11 sm:rounded-[22px] sm:px-11 sm:py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#009b9b]/10 px-3 py-1.5 text-xs font-bold text-[#087f83]">
            <User size={14} />
            Passenger Details
          </div>

          <h1 className="mb-2 text-[26px] font-extrabold tracking-tight text-[#173b5e] sm:text-[32px]">
            Passenger Information
          </h1>

          <p className="text-sm leading-7 text-[#718198]">
            Please fill in the details of the passenger(s).
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#718198]">
            <Users size={16} className="text-[#009b9b]" />
            {selectedSeatIds.length} passenger(s) selected
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          {passengers.map((passenger, index) => (
            <div key={selectedSeatIds[index] ?? index} className="mb-8">
              <div className="mb-5 flex items-center justify-between border-b border-[#e1e8f0] pb-3">
                <h2 className="text-base font-bold text-[#173b5e]">
                  Passenger {index + 1}
                </h2>

                {selectedSeatNumbers[index] && (
                  <span className="rounded-full bg-[#009b9b]/10 px-3 py-1 text-xs font-bold text-[#087f83]">
                    Seat {selectedSeatNumbers[index]}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor={`full_name_${index}`}
                  className="mb-2 block text-sm font-bold text-[#173b5e]"
                >
                  Full Name
                  <span className="text-red-500"> *</span>
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa8b8]"
                  />

                  <input
                    id={`full_name_${index}`}
                    type="text"
                    value={passenger.full_name}
                    onChange={(event) =>
                      updatePassenger(index, "full_name", event.target.value)
                    }
                    readOnly={index === 0}
                    required
                    placeholder="Enter passenger name"
                    autoComplete="name"
                    className={`min-h-[52px] w-full rounded-xl border border-[#dce5ef] py-3.5 pl-11 pr-4 text-sm outline-none transition ${
                      index === 0
                        ? "cursor-not-allowed bg-slate-100 text-[#718198]"
                        : "bg-[#fbfdff] text-[#26364b] placeholder:text-[#9aa8b8] hover:border-[#b7c9d9] focus:border-[#009b9b] focus:bg-white focus:ring-4 focus:ring-[#009b9b]/10"
                    }`}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor={`contact_number_${index}`}
                  className="mb-2 block text-sm font-bold text-[#173b5e]"
                >
                  Contact Number
                  <span className="text-red-500"> *</span>
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa8b8]"
                  />

                  <input
                    id={`contact_number_${index}`}
                    type="tel"
                    value={passenger.contact_number}
                    onChange={(event) =>
                      updatePassenger(
                        index,
                        "contact_number",
                        event.target.value,
                      )
                    }
                    required
                    placeholder="0912 345 6789"
                    autoComplete="tel"
                    className="min-h-[52px] w-full rounded-xl border border-[#dce5ef] bg-[#fbfdff] py-3.5 pl-11 pr-4 text-sm text-[#26364b] outline-none transition placeholder:text-[#9aa8b8] hover:border-[#b7c9d9] focus:border-[#009b9b] focus:bg-white focus:ring-4 focus:ring-[#009b9b]/10"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor={`email_${index}`}
                  className="mb-2 block text-sm font-bold text-[#173b5e]"
                >
                  Email Address
                  <span className="text-red-500"> *</span>
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa8b8]"
                  />

                  <input
                    id={`email_${index}`}
                    type="email"
                    value={passenger.email}
                    onChange={(event) =>
                      updatePassenger(index, "email", event.target.value)
                    }
                    readOnly={index === 0}
                    required
                    placeholder="Enter email address"
                    autoComplete="email"
                    className={`min-h-[52px] w-full rounded-xl border border-[#dce5ef] py-3.5 pl-11 pr-4 text-sm outline-none transition ${
                      index === 0
                        ? "cursor-not-allowed bg-slate-100 text-[#718198]"
                        : "bg-[#fbfdff] text-[#26364b] placeholder:text-[#9aa8b8] hover:border-[#b7c9d9] focus:border-[#009b9b] focus:bg-white focus:ring-4 focus:ring-[#009b9b]/10"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mt-8 flex justify-end border-t border-[#e1e8f0] pt-6">
            <button
              type="submit"
              disabled={passengers.length === 0}
              className="inline-flex min-h-[49px] w-full items-center justify-center gap-2 rounded-xl border border-[#173b5e] bg-[#173b5e] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:border-[#087f83] hover:bg-[#087f83] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Proceed to Payment
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
