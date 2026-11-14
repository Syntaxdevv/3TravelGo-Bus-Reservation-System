import { useState, type ReactNode } from "react";
import { adminLogout, type AdminUser } from "../services/adminAuth";

interface AdminLayoutProps {
  children: ReactNode;
  activePage?: string;
  admin: AdminUser;
}

const navigation = [
  { label: "Dashboard", icon: "fa-house", href: "/admin/dashboard" },
  { label: "Reservations", icon: "fa-ticket", href: "/admin/reservations" },
  { label: "Trips", icon: "fa-route", href: "/admin/trips" },
  { label: "Passengers", icon: "fa-users", href: "/admin/passengers" },
  { label: "Payments", icon: "fa-credit-card", href: "/admin/payments" },
  { label: "Bus Operators", icon: "fa-bus", href: "/admin/operators" },
  { label: "Terminals", icon: "fa-location-dot", href: "/admin/terminals" },
  { label: "Seats", icon: "fa-chair", href: "/admin/seats" },
  { label: "Reports", icon: "fa-chart-column", href: "/admin/reports" },
];

export default function AdminLayout({
  children,
  activePage = "Dashboard",
  admin,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await adminLogout();

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again.",
      );

      setIsLoggingOut(false);
    }
  }

  const adminInitial = admin.name?.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#F1F5FB] font-sans text-[#26364B]">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[298px] flex-col bg-[#0B2545] text-white transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[74px] shrink-0 items-center gap-3 border-b border-white/10 px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EF3340] shadow-sm">
            <i className="fa-solid fa-bus text-[23px] text-white" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[23px] font-extrabold tracking-tight">
              3Travel<span className="text-[#EF3340]">Go</span>
            </span>
            <span className="text-xs font-medium text-white">Admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-[17px] py-7">
          {navigation.map((item) => {
            const isActive = activePage === item.label;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`mb-1 flex min-h-[49px] items-center gap-4 rounded-[10px] px-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#1765E8] text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <i
                  className={`fa-solid ${item.icon} w-[20px] text-center text-lg`}
                />
                <span>{item.label}</span>
              </a>
            );
          })}

          <div className="my-6 border-t border-white/10" />
        </nav>

        <div className="shrink-0 px-[17px] pb-[10px]">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-[49px] w-full items-center gap-4 rounded-[10px] bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="fa-solid fa-right-from-bracket w-[20px] text-center text-lg" />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-[298px]">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#E7EDF5] bg-white px-5 sm:px-8">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="text-xl text-[#142D4E] lg:hidden"
          >
            <i className="fa-solid fa-bars" />
          </button>

          <div className="ml-auto flex items-center gap-5">
            <div className="h-9 border-l border-[#E7EDF5]" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EF3340] text-sm font-bold text-white">
                {adminInitial}
              </div>

              <div>
                <p className="text-sm font-bold text-[#142D4E]">{admin.name}</p>

                <p className="mt-0.5 text-xs text-[#8795AA]">{admin.email}</p>
              </div>

              <i className="fa-solid fa-chevron-down ml-2 text-xs text-[#8795AA]" />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-74px)] px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
