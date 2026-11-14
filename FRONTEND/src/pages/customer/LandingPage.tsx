import { Bus, ArrowRight } from "lucide-react";
import { customerLogout } from "../../services/customerAuth";

export default function CustomerDashboard() {
  async function handleLogout() {
    try {
      await customerLogout();
      window.location.href = "/customer/login";
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Unable to log out. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',sans-serif] text-[#26374a]">
      <header className="relative z-50 border-b border-slate-100 bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-[1360px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:flex-nowrap lg:px-12">
          <a
            href="/customer/dashboard"
            className="flex shrink-0 items-center gap-2 text-[21px] font-extrabold tracking-tight text-[#17365d] sm:text-[24px]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-700 text-white">
              <Bus size={19} />
            </span>

            <span>
              3Travel<span className="text-teal-700">Go</span>
            </span>
          </a>

          <nav className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:w-auto lg:flex-nowrap lg:gap-7">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-slate-600 sm:gap-x-7 sm:text-sm">
              <a
                href="#home"
                className="border-b-2 border-teal-700 pb-1 text-teal-700"
              >
                Home
              </a>

              <a
                href="#why-choose-us"
                className="pb-1 transition hover:text-teal-700"
              >
                Why Choose Us
              </a>

              <a href="#about" className="pb-1 transition hover:text-teal-700">
                About
              </a>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 shrink-0 items-center justify-center rounded bg-[#078b89] px-4 text-xs font-bold text-white transition hover:bg-[#066f70] sm:h-[42px] sm:min-w-[90px] sm:text-sm"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section
          id="home"
          className="relative flex min-h-[540px] items-center overflow-hidden bg-[#0c233e] sm:min-h-[620px] lg:min-h-[690px]"
        >
          <img
            src="https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Victory_Liner_529_%282024%29.jpg/1280px-Victory_Liner_529_%282024%29.jpg"
            alt="Victory Liner bus"
            className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0c233e]/95 via-[#0c233e]/80 to-[#0c233e]/30" />

          <div className="relative z-10 mx-auto w-full max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12">
            <div className="max-w-[650px]">
              <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[3px] text-[#42c4bd] sm:text-sm">
                <span className="h-[2px] w-8 bg-[#42c4bd]" />
                Your journey starts here
              </p>

              <h1 className="mb-6 font-['Barlow_Condensed',sans-serif] text-[48px] font-bold uppercase leading-[0.98] text-white sm:text-[65px] lg:text-[82px]">
                Travel Made
                <br />
                Easier <span className="text-[#42c4bd]">with 3TravelGo</span>
              </h1>

              <p className="mb-8 max-w-[520px] text-sm leading-[1.8] text-slate-200 sm:text-base">
                Book your bus tickets, check schedules, and explore different
                destinations in one place. Your next journey is just a few
                clicks away.
              </p>

              <a
                href="/customer/book-trip"
                className="inline-flex min-h-[52px] items-center justify-center gap-5 rounded border border-teal-700 bg-teal-700 px-7 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[#066e70] hover:bg-[#066e70]"
              >
                Book a Trip
                <ArrowRight size={19} />
              </a>
            </div>
          </div>
        </section>

        <section
          id="why-choose-us"
          className="scroll-mt-5 bg-[#f7f9fc] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-[85px]"
        >
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-stretch gap-10 rounded-sm px-2 py-5 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-8">
            <div className="flex min-w-0 flex-col justify-between">
              <h2 className="font-['Barlow_Condensed',sans-serif] text-[52px] font-bold uppercase leading-[0.95] tracking-tight text-[#17365d] sm:text-[68px] lg:text-[78px]">
                WHY TRAVEL
                <span className="block text-teal-700">WITH US</span>
              </h2>

              <div className="relative mt-9 h-[250px] w-full max-w-[500px] sm:h-[340px] lg:mt-auto lg:h-[370px]">
                <img
                  src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=85"
                  alt="Passenger bus"
                  loading="lazy"
                  className="absolute right-0 top-0 h-[57%] w-[55%] object-cover"
                />

                <img
                  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=85"
                  alt="Travel destination"
                  loading="lazy"
                  className="absolute bottom-0 left-0 h-[57%] w-[55%] object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              {[
                {
                  number: "01",
                  title: "Reliable Bus Travel",
                  description:
                    "Explore organized bus trips and available schedules for your next journey.",
                },
                {
                  number: "02",
                  title: "Easy Reservation",
                  description:
                    "Book your bus trips conveniently through our online reservation system.",
                },
                {
                  number: "03",
                  title: "Comfortable Journey",
                  description:
                    "Find available bus services that suit your preferred travel schedule.",
                },
                {
                  number: "04",
                  title: "Affordable Fares",
                  description:
                    "Check trip fares and choose an option that fits your travel budget.",
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="grid grid-cols-[48px_1fr] gap-3 border-b border-[#d8e0e9] py-6 first:pt-0 sm:grid-cols-[65px_1fr] sm:gap-5"
                >
                  <span className="font-['Barlow_Condensed',sans-serif] text-[36px] font-semibold leading-none text-teal-700 sm:text-[48px]">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="mb-2 font-['Barlow_Condensed',sans-serif] text-[25px] font-semibold uppercase leading-tight text-[#17365d] sm:text-[32px]">
                      {item.title}
                    </h3>

                    <p className="max-w-[300px] text-[13px] leading-[1.8] text-[#68788c] sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-5 overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20 lg:py-[90px]"
        >
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative isolate mx-auto aspect-[1.2/1] w-full max-w-[600px]">
              <div className="absolute -bottom-2 -left-2 -right-2 -top-2 -z-10 bg-[#e5f0ff]" />

              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85"
                alt="Passenger bus ready for a journey"
                loading="lazy"
                className="block h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-[2px] w-10 bg-blue-700" />

                <p className="text-xs font-bold tracking-[2px] text-teal-700">
                  ABOUT 3TRAVELGO
                </p>

                <span className="h-[2px] w-10 bg-blue-700" />
              </div>

              <h2 className="mb-6 text-[30px] font-extrabold leading-tight text-[#102c52] sm:text-[38px] lg:text-[46px]">
                A simpler way to
                <br />
                plan your <span className="text-blue-700">bus journey</span>
              </h2>

              <p className="mb-8 text-sm leading-[1.9] text-[#536783] sm:text-base">
                3TravelGo helps passengers explore bus routes, check trip
                schedules, and manage reservations in one place. Our goal is to
                make planning your next journey more convenient and organized.
              </p>

              <a
                href="/customer/book-trip"
                className="inline-flex items-center gap-5 rounded bg-[#10365f] px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                Explore Trips
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-5 py-7 text-center">
          <p className="text-sm font-semibold text-[#17365d]">
            ❤️ Created with by Sheik
          </p>
        </div>
      </footer>
    </div>
  );
}
