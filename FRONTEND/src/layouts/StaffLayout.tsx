
import { useState, type ReactNode } from "react";
import {
    BusFront,
    ChartNoAxesCombined,
    Ticket,
    Route,
    Armchair,
    QrCode,
    CreditCard,
    LogOut,
    Menu,
    X,
    User,
    History,
} from "lucide-react";
import { staffLogout, type AdminUser } from "../services/adminAuth";

interface StaffLayoutProps {
    staff: AdminUser;
    activePage: string;
    children: ReactNode;
}

const navigation = [
    {
        label: "Dashboard",
        path: "/staff/dashboard",
        icon: ChartNoAxesCombined,
    },
    {
        label: "Reservations",
        path: "/staff/reservations",
        icon: Ticket,
    },
    {
        label: "Trip Schedules",
        path: "/staff/trips",
        icon: Route,
    },
    {
        label: "Seat Availability",
        path: "/staff/seats",
        icon: Armchair,
    },
    {
        label: "QR Code Scanner",
        path: "/staff/qr-scanner",
        icon: QrCode,
    },
    {
        label: "Check-in History",
        path: "/staff/check-in-history",
        icon: History,
    },
    {
        label: "Trip Monitoring",
        path: "/staff/trip-monitoring",
        icon: BusFront,
    },
    {
        label: "Payment Verification",
        path: "/staff/payments",
        icon: CreditCard,
    },
];

export default function StaffLayout({
    staff,
    activePage,
    children,
}: StaffLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await staffLogout();
            window.location.replace("/admin/login");
        } catch (error) {
            setLoggingOut(false);
            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to logout. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['DM_Sans'] text-[#26364B]">
            <header className="fixed left-0 right-0 top-0 z-[1000] flex h-[74px] items-center justify-between border-b border-[#E7ECF2] bg-white px-[15px] sm:px-[30px] lg:left-[265px]">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle navigation"
                    className="flex h-[39px] w-[39px] items-center justify-center rounded-lg border border-[#E7ECF2] bg-white text-[#172B4D] lg:hidden"
                >
                    {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
                </button>

                <div className="ml-auto flex items-center gap-[10px] sm:gap-[23px]">
                    <div className="hidden h-[34px] w-px bg-[#E7ECF2] sm:block" />

                    <div className="flex items-center gap-[11px]">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FFF1E9] text-[#EA580C]">
                            <User size={18} />
                        </div>

                        <div className="hidden sm:block">
                            <p className="text-[13px] font-bold text-[#172B4D]">
                                {staff.name}
                            </p>
                            <p className="mt-[3px] text-[11px] text-[#718096]">
                                Staff Portal
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={closeSidebar}
                    className="fixed inset-x-0 bottom-0 top-[74px] z-[1050] bg-slate-900/35 lg:hidden"
                />
            )}

            <aside
                className={`fixed bottom-0 left-0 top-0 z-[1100] flex w-[265px] flex-col border-r border-white/10 bg-[#172B4D] px-4 pb-5 pt-[25px] transition-transform duration-200 max-lg:top-[74px] max-lg:bottom-0 max-lg:pt-5 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "max-lg:-translate-x-full"
                }`}
            >
                <a
                    href="/staff/dashboard"
                    onClick={closeSidebar}
                    className="mb-[22px] flex items-center gap-3 border-b border-white/10 px-[10px] pb-[25px]"
                >
                    <div className="grid h-[43px] w-[43px] shrink-0 place-items-center rounded-[11px] bg-[#EA580C] text-white">
                        <BusFront size={21} />
                    </div>

                    <div>
                        <h1 className="text-[21px] font-extrabold tracking-[-0.5px] text-white">
                            3TravelGo{" "}
                            <span className="text-[#FB923C]">Staff</span>
                        </h1>
                        <p className="mt-[3px] text-[9px] font-semibold tracking-[1px] text-[#91A4BF]">
                            RESERVATION SYSTEM
                        </p>
                    </div>
                </a>

                <nav className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = activePage === item.label;

                        return (
                            <a
                                key={item.path}
                                href={item.path}
                                onClick={closeSidebar}
                                className={`mb-[5px] flex min-h-[46px] items-center gap-[13px] rounded-[7px] px-[14px] text-[13px] transition-colors ${
                                    active
                                        ? "bg-[#EA580C] font-bold text-white"
                                        : "font-medium text-[#CBD5E1] hover:bg-[#223B60] hover:text-white"
                                }`}
                            >
                                <Icon size={17} className="shrink-0" />
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                <div className="mb-[15px] mt-4 h-px bg-white/10" />

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex min-h-[46px] items-center gap-[13px] rounded-[7px] px-[14px] text-left text-[13px] font-medium text-[#CBD5E1] transition-colors hover:bg-[#223B60] hover:text-white disabled:opacity-50"
                >
                    <LogOut size={17} />
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            </aside>

            <main className="min-h-screen bg-[#F8FAFC] px-[14px] pb-5 pt-[88px] sm:px-[22px] sm:pb-[25px] sm:pt-[100px] lg:ml-[265px] lg:px-[34px] lg:pb-[35px] lg:pt-[104px]">
                {children}
            </main>
        </div>
    );
}
