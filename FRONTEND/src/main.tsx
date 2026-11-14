import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";

import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

import LandingPage from "./pages/customer/LandingPage";

import Dashboard from "./pages/admin/Dashboard";
import Reservations from "./pages/admin/Reservations";
import Trips from "./pages/admin/Trips";
import Passengers from "./pages/admin/Passengers";
import Login from "./pages/admin/Login";
import Payments from "./pages/admin/Payments";
import BusOperators from "./pages/admin/BusOperators";
import Terminals from "./pages/admin/Terminals";
import Seats from "./pages/admin/Seats";
import Reports from "./pages/admin/Reports";

import StaffDashboard from "./pages/staff/staffdashboard";
import StaffReservations from "./pages/staff/staffReservations";
import StaffTrips from "./pages/staff/staffTrips";
import StaffSeats from "./pages/staff/staffSeats";
import QRScanner from "./pages/staff/QRScanner";
import CheckinHistory from "./pages/staff/CheckinHistory";
import TripMonitoring from "./pages/staff/TripMonitoring";
import StaffPayments from "./pages/staff/StaffPayments";

import CustomerLogin from "./pages/customer/Login";
import CustomerRegister from "./pages/customer/Register";
import CustomerDashboard from "./pages/customer/LandingPage";
import BookTrip from "./pages/customer/BookTrip";
import CustomerTrips from "./pages/customer/Trips";
import CustomerSeats from "./pages/customer/Seats";
import PassengerInformation from "./pages/customer/PassengerInformation";
import Payment from "./pages/customer/Payment";
import ReservationSuccess from "./pages/customer/ReservationSuccess";

import {
  checkAdminSession,
  checkStaffSession,
  type AdminUser,
} from "./services/adminAuth";

import {
  checkCustomerSession,
  type CustomerUser,
} from "./services/customerAuth";

import "./css/app.css";

function App() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [staff, setStaff] = useState<AdminUser | null>(null);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    async function verifySession() {
      let path = window.location.pathname;

      if (path === "/login") {
        window.history.replaceState({}, "", "/admin/login");
        path = "/admin/login";
        setCurrentPath(path);
      }

      if (path === "/") {
        setIsLoading(false);
        return;
      }

      if (path === "/customer/login" || path === "/customer/register") {
        setIsLoading(false);
        return;
      }

      try {
        if (path.startsWith("/customer")) {
          const currentCustomer = await checkCustomerSession();

          setCustomer(currentCustomer);

          if (!currentCustomer) {
            window.history.replaceState({}, "", "/customer/login");

            setCurrentPath("/customer/login");
          }

          return;
        }

        if (path.startsWith("/staff")) {
          const currentStaff = await checkStaffSession();

          setStaff(currentStaff);

          if (!currentStaff) {
            window.history.replaceState({}, "", "/admin/login");

            setCurrentPath("/admin/login");
          } else if (currentStaff.role !== "staff") {
            window.history.replaceState({}, "", "/admin/dashboard");

            setCurrentPath("/admin/dashboard");
          }

          return;
        }

        if (path.startsWith("/admin")) {
          const currentAdmin = await checkAdminSession();

          setAdmin(currentAdmin);

          if (!currentAdmin) {
            window.history.replaceState({}, "", "/admin/login");

            setCurrentPath("/admin/login");
          } else if (currentAdmin.role !== "admin") {
            window.history.replaceState({}, "", "/staff/dashboard");

            setCurrentPath("/staff/dashboard");
            setStaff(currentAdmin);
          } else if (path === "/admin/login") {
            window.history.replaceState({}, "", "/admin/dashboard");

            setCurrentPath("/admin/dashboard");
          }

          return;
        }

        window.history.replaceState({}, "", "/");
        setCurrentPath("/");
      } catch (error) {
        console.error("Session verification failed:", error);

        if (path.startsWith("/customer")) {
          setCustomer(null);

          window.history.replaceState({}, "", "/customer/login");

          setCurrentPath("/customer/login");
        } else if (path.startsWith("/admin") || path.startsWith("/staff")) {
          setAdmin(null);
          setStaff(null);

          window.history.replaceState({}, "", "/admin/login");

          setCurrentPath("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F6FC]">
        <p className="text-sm text-slate-500">Loading 3TravelGo...</p>
      </div>
    );
  }

  if (currentPath === "/") {
    return <LandingPage />;
  }

  if (currentPath === "/customer/login") {
    return <CustomerLogin />;
  }

  if (currentPath === "/customer/register") {
    return <CustomerRegister />;
  }

  if (currentPath.startsWith("/customer")) {
    if (!customer) {
      return <CustomerLogin />;
    }

    switch (currentPath) {
      case "/customer/dashboard":
        return <CustomerDashboard />;

      case "/customer/book-trip":
        return <BookTrip />;

      case "/customer/trips":
        return <CustomerTrips />;

      case "/customer/seats":
        return <CustomerSeats />;

      case "/customer/passenger-information":
        return <PassengerInformation customer={customer} />;

      case "/customer/payment":
        return <Payment />;

      case "/customer/reservation-success":
        return <ReservationSuccess />;

      default:
        window.history.replaceState({}, "", "/customer/dashboard");

        return <CustomerDashboard />;
    }
  }

  if (currentPath === "/admin/login") {
    return (
      <Login
        onLoginSuccess={(loggedInUser) => {
          if (loggedInUser.role === "admin") {
            setAdmin(loggedInUser);
            setStaff(null);

            window.history.replaceState({}, "", "/admin/dashboard");

            setCurrentPath("/admin/dashboard");
          } else if (loggedInUser.role === "staff") {
            setStaff(loggedInUser);
            setAdmin(null);

            window.history.replaceState({}, "", "/staff/dashboard");

            setCurrentPath("/staff/dashboard");
          }
        }}
      />
    );
  }

  if (currentPath.startsWith("/admin")) {
    if (!admin || admin.role !== "admin") {
      return (
        <Login
          onLoginSuccess={(loggedInUser) => {
            if (loggedInUser.role === "admin") {
              setAdmin(loggedInUser);
              setStaff(null);

              window.history.replaceState({}, "", "/admin/dashboard");

              setCurrentPath("/admin/dashboard");
            } else {
              setStaff(loggedInUser);
              setAdmin(null);

              window.history.replaceState({}, "", "/staff/dashboard");

              setCurrentPath("/staff/dashboard");
            }
          }}
        />
      );
    }

    const adminPages: Record<string, ReactNode> = {
      "/admin/dashboard": <Dashboard />,
      "/admin/reservations": <Reservations />,
      "/admin/trips": <Trips />,
      "/admin/passengers": <Passengers />,
      "/admin/payments": <Payments />,
      "/admin/operators": <BusOperators />,
      "/admin/terminals": <Terminals />,
      "/admin/seats": <Seats />,
      "/admin/reports": <Reports />,
    };

    const adminLabels: Record<string, string> = {
      "/admin/dashboard": "Dashboard",
      "/admin/reservations": "Reservations",
      "/admin/trips": "Trips",
      "/admin/passengers": "Passengers",
      "/admin/payments": "Payments",
      "/admin/operators": "Bus Operators",
      "/admin/terminals": "Terminals",
      "/admin/seats": "Seats",
      "/admin/reports": "Reports",
    };

    const activePage = adminLabels[currentPath] || "Dashboard";

    const pageContent = adminPages[currentPath] || (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-bold text-[#0B2545]">{activePage}</h1>

        <p className="mt-2 text-sm text-slate-500">
          This module is currently being developed.
        </p>
      </div>
    );

    return (
      <AdminLayout activePage={activePage} admin={admin}>
        {pageContent}
      </AdminLayout>
    );
  }

  if (currentPath.startsWith("/staff")) {
    if (!staff || staff.role !== "staff") {
      return (
        <Login
          onLoginSuccess={(loggedInUser) => {
            if (loggedInUser.role === "staff") {
              setStaff(loggedInUser);
              setAdmin(null);

              window.history.replaceState({}, "", "/staff/dashboard");

              setCurrentPath("/staff/dashboard");
            } else {
              setAdmin(loggedInUser);
              setStaff(null);

              window.history.replaceState({}, "", "/admin/dashboard");

              setCurrentPath("/admin/dashboard");
            }
          }}
        />
      );
    }

    const staffPages: Record<string, ReactNode> = {
      "/staff/dashboard": (
        <StaffDashboard key="staff-dashboard" staff={staff} />
      ),
      "/staff/reservations": <StaffReservations />,
      "/staff/trips": <StaffTrips />,
      "/staff/seats": <StaffSeats />,
      "/staff/qr-scanner": <QRScanner />,
      "/staff/check-in": (
        <div className="rounded-xl border border-[#E7ECF2] bg-white p-8">
          <h1 className="text-xl font-bold text-[#172B4D]">
            Passenger Check-in
          </h1>

          <p className="mt-2 text-sm text-[#718096]">
            Use the QR Code Scanner to verify passenger reservations.
          </p>
        </div>
      ),
      "/staff/check-in-history": <CheckinHistory />,
      "/staff/trip-monitoring": <TripMonitoring />,
      "/staff/payments": <StaffPayments />,
    };

    const staffLabels: Record<string, string> = {
      "/staff/dashboard": "Dashboard",
      "/staff/reservations": "Reservations",
      "/staff/trips": "Trip Schedules",
      "/staff/seats": "Seat Availability",
      "/staff/qr-scanner": "QR Code Scanner",
      "/staff/check-in": "Passenger Check-in",
      "/staff/check-in-history": "Check-in History",
      "/staff/trip-monitoring": "Trip Monitoring",
      "/staff/payments": "Payment Verification",
    };

    const activePage = staffLabels[currentPath] || "Dashboard";

    const pageContent = staffPages[currentPath] ?? (
      <div className="rounded-lg border border-[#E7ECF2] bg-white p-8">
        <h1 className="text-xl font-bold text-[#172B4D]">{activePage}</h1>

        <p className="mt-2 text-sm text-[#718096]">
          This module is currently being developed.
        </p>
      </div>
    );

    return (
      <StaffLayout staff={staff} activePage={activePage}>
        {pageContent}
      </StaffLayout>
    );
  }

  window.history.replaceState({}, "", "/");

  return <LandingPage />;
}

createRoot(document.getElementById("root")!).render(<App />);
