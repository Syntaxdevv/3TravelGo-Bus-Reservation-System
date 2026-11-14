import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bus,
  ArrowRight,
  Search,
  MapPin,
  CalendarDays,
  ChevronDown,
  Info,
} from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getCustomerTerminals,
  type CustomerTerminal,
} from "../../services/customerTerminals";

const today = (() => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
})();

const popularRoutes = [
  {
    destination: "Naga",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=85",
    alt: "Scenic destination near Naga",
  },
  {
    destination: "Iriga",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85",
    alt: "Historic architecture",
  },
  {
    destination: "Legazpi",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=85",
    alt: "Scenic travel destination",
  },
  {
    destination: "Albay",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
    alt: "Mountain landscape",
  },
  {
    destination: "Sorsogon",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85",
    alt: "Coastal scenery",
  },
  {
    destination: "Batangas",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=85",
    alt: "Nature destination",
  },
];

const faqs = [
  {
    question: "How do I book a bus ticket?",
    answer:
      "Enter your departure location, destination, and travel date. Click Search Trips, choose an available trip, and follow the booking steps.",
  },
  {
    question: "How can I select my seat?",
    answer:
      "If seat selection is available for your chosen trip, you can select your preferred seat before confirming your reservation.",
  },
  {
    question: "How do I know if my booking is confirmed?",
    answer:
      "Check your booking details or reservation history to see the current status of your reservation.",
  },
  {
    question: "Can I cancel my reservation?",
    answer:
      "Cancellation depends on the policies implemented by 3TravelGo. Check your reservation details or contact the administrator for assistance.",
  },
  {
    question: "Where can I see my booking details?",
    answer:
      "Visit your booking history or reservations page to review your trip details and booking status.",
  },
];

const destinations = [
  {
    name: "Manila",
    coords: [14.5995, 120.9842] as L.LatLngTuple,
    description: "A major bus departure hub.",
  },
  {
    name: "Naga",
    coords: [13.6218, 123.1948] as L.LatLngTuple,
    description: "Explore bus trips to Naga City.",
  },
  {
    name: "Iriga",
    coords: [13.4324, 123.4115] as L.LatLngTuple,
    description: "Explore bus trips to Iriga City.",
  },
  {
    name: "Legazpi",
    coords: [13.1391, 123.7438] as L.LatLngTuple,
    description: "Explore bus trips to Legazpi City.",
  },
  {
    name: "Sorsogon",
    coords: [12.9739, 124.005] as L.LatLngTuple,
    description: "Explore bus trips to Sorsogon City.",
  },
];

export default function Book() {
  const [terminals, setTerminals] = useState<CustomerTerminal[]>([]);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [travelDate, setTravelDate] = useState("");

  const [terminalsLoading, setTerminalsLoading] = useState(true);
  const [terminalsError, setTerminalsError] = useState("");
  const [error, setError] = useState("");

  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    async function loadTerminals() {
      try {
        setTerminalsLoading(true);
        setTerminalsError("");

        const result = await getCustomerTerminals();
        setTerminals(result);
      } catch (err) {
        setTerminalsError(
          err instanceof Error ? err.message : "Unable to load terminals.",
        );
      } finally {
        setTerminalsLoading(false);
      }
    }

    void loadTerminals();
  }, []);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([12.5, 122], 5);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    destinations.forEach((destination) => {
      L.circleMarker(destination.coords, {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: "#009b9b",
        fillOpacity: 1,
      }).addTo(map).bindPopup(`
                    <div style="font-family: Arial, sans-serif; padding: 3px;">
                        <strong style="color: #173b5e; font-size: 14px;">
                            ${destination.name}
                        </strong>
                        <p style="margin: 5px 0 0; color: #64748b; font-size: 12px;">
                            ${destination.description}
                        </p>
                    </div>
                `);
    });

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  function goToTrips(departureId: string, arrivalId: string, date: string) {
    const params = new URLSearchParams({
      origin_id: departureId,
      destination_id: arrivalId,
      travel_date: date,
    });

    window.location.href = `/customer/trips?${params.toString()}`;
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!originId || !destinationId || !travelDate) {
      setError("Please complete all travel information.");
      return;
    }

    if (originId === destinationId) {
      setError("Departure and destination terminals cannot be the same.");
      return;
    }

    if (travelDate < today) {
      setError("Please select today or a future travel date.");
      return;
    }

    goToTrips(originId, destinationId, travelDate);
  }

  function handlePopularRoute(destinationName: string) {
    const manilaTerminal = terminals.find((terminal) => {
      const name = terminal.terminal_name.toLowerCase();
      const city = terminal.city.toLowerCase();

      return name.includes("manila") || city.includes("manila");
    });

    const destinationTerminal = terminals.find((terminal) => {
      const name = terminal.terminal_name.toLowerCase();
      const city = terminal.city.toLowerCase();
      const target = destinationName.toLowerCase();

      return name.includes(target) || city.includes(target);
    });

    if (!manilaTerminal || !destinationTerminal) {
      setError(
        `The Manila to ${destinationName} route is currently unavailable.`,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    goToTrips(
      manilaTerminal.terminal_id,
      destinationTerminal.terminal_id,
      today,
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] font-['Inter',sans-serif] text-slate-800 antialiased">
      <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/customer/dashboard"
            className="flex items-center gap-0 text-2xl font-extrabold tracking-tight text-[#17365d]"
          >
            3Travel<span className="text-[#009b9b]">Go</span>
          </a>
        </div>
      </header>

      <section className="relative h-[285px] overflow-hidden bg-[#173b5e] sm:h-[300px]">
        <img
          src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1800&q=85"
          alt="Bus travel"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#123653]/85" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-white">
            <Bus size={14} />
            YOUR JOURNEY STARTS HERE
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find Your Next Journey
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Search bus routes, explore schedules, and plan your trip with
            3TravelGo. Your next destination starts here.
          </p>
        </div>
      </section>

      <section
        className="relative z-10 mx-auto -mt-7 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Search bus trips"
      >
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(23,59,94,0.10)] sm:p-7"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#009b9b]/10 text-[#009b9b]">
              <Search size={19} />
            </div>

            <div>
              <h2 className="font-bold text-[#173b5e]">Search Bus Trips</h2>

              <p className="text-xs text-slate-500">
                Enter your trip details below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#173b5e]">
                Departure From
              </label>

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#009b9b]"
                />

                <select
                  value={originId}
                  onChange={(e) => {
                    setOriginId(e.target.value);

                    if (e.target.value === destinationId) {
                      setDestinationId("");
                    }
                  }}
                  disabled={terminalsLoading || terminals.length === 0}
                  required
                  className="h-[50px] w-full rounded-xl border border-slate-200 bg-[#fbfdff] pl-11 pr-4 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#009b9b] focus:ring-4 focus:ring-[#009b9b]/10 disabled:bg-slate-100"
                >
                  <option value="">
                    {terminalsLoading
                      ? "Loading terminals..."
                      : "Select departure terminal"}
                  </option>

                  {terminals.map((terminal) => (
                    <option
                      key={terminal.terminal_id}
                      value={terminal.terminal_id}
                    >
                      {terminal.terminal_name} - {terminal.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#173b5e]">
                Going To
              </label>

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#009b9b]"
                />

                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  disabled={terminalsLoading || terminals.length === 0}
                  required
                  className="h-[50px] w-full rounded-xl border border-slate-200 bg-[#fbfdff] pl-11 pr-4 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#009b9b] focus:ring-4 focus:ring-[#009b9b]/10 disabled:bg-slate-100"
                >
                  <option value="">
                    {terminalsLoading
                      ? "Loading terminals..."
                      : "Select destination terminal"}
                  </option>

                  {terminals.map((terminal) => (
                    <option
                      key={terminal.terminal_id}
                      value={terminal.terminal_id}
                      disabled={terminal.terminal_id === originId}
                    >
                      {terminal.terminal_name} - {terminal.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#173b5e]">
                Travel Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#009b9b]"
                />

                <input
                  type="date"
                  min={today}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                  className="h-[50px] w-full rounded-xl border border-slate-200 bg-[#fbfdff] pl-11 pr-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#009b9b] focus:ring-4 focus:ring-[#009b9b]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={terminalsLoading || terminals.length === 0}
              className="flex h-[50px] items-center justify-center gap-3 rounded-xl bg-[#087f83] px-7 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#066d70] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={17} />
              Search Trips
              <ArrowRight size={14} />
            </button>
          </div>

          {terminalsError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{terminalsError}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-semibold text-red-700 underline"
              >
                Reload page
              </button>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-14">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#009b9b]">
                Explore destinations
              </span>

              <h2 className="text-2xl font-extrabold tracking-tight text-[#173b5e] sm:text-3xl">
                Explore Bus Routes
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Explore the Philippines and discover our featured bus
                destinations.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#009b9b]" />
              Popular destinations
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#173b5e]">
                <MapPin size={17} className="text-[#009b9b]" />
                Philippines Destination Map
              </div>

              <span className="text-xs text-slate-400">
                Select a marker to explore
              </span>
            </div>

            <div
              ref={mapElementRef}
              className="h-[350px] w-full bg-slate-100 sm:h-[450px]"
              role="application"
              aria-label="Interactive map of Philippine bus destinations"
            />

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <Info size={13} className="mr-1 inline text-[#009b9b]" />
                Teal markers indicate featured destinations.
              </span>

              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#087f83] hover:underline"
              >
                © OpenStreetMap contributors
              </a>
            </div>
          </div>
        </section>

        <section className="mb-14" id="popular-routes">
          <div className="mb-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#009b9b]">
              Plan your next trip
            </span>

            <h2 className="text-2xl font-extrabold tracking-tight text-[#173b5e] sm:text-3xl">
              Popular Routes with 3TravelGo
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Explore some of the destinations available for your next journey.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularRoutes.map((route) => (
              <button
                key={route.destination}
                type="button"
                onClick={() => handlePopularRoute(route.destination)}
                className="group relative min-h-[250px] overflow-hidden rounded-2xl bg-slate-300 text-left shadow-sm"
              >
                <img
                  src={route.image}
                  alt={route.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#102b50]/95 via-[#102b50]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/75">
                    Popular destination
                  </span>

                  <h3 className="text-xl font-extrabold text-white">Manila</h3>

                  <p className="mt-1 text-sm text-white/85">
                    to {route.destination}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white transition group-hover:gap-3">
                    BOOK NOW
                    <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-6 text-center">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#009b9b]">
              Need help?
            </span>

            <h2 className="text-2xl font-extrabold tracking-tight text-[#173b5e] sm:text-3xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find answers to common questions about 3TravelGo reservations.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#173b5e]">
                  {faq.question}

                  <ChevronDown
                    size={16}
                    className="shrink-0 text-[#009b9b] transition group-open:rotate-180"
                  />
                </summary>

                <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-500">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
