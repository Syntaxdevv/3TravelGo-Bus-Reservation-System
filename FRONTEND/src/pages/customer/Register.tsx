import { useState, type FormEvent } from "react";
import {
  BusFront,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { customerRegister } from "../../services/customerAuth";

export default function CustomerRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await customerRegister(
        fullName.trim(),
        email.trim(),
        phone.trim(),
        password,
        passwordConfirm,
      );

      window.location.href = "/customer/login";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F7FD] bg-[radial-gradient(#B8C8DD_0.8px,transparent_0.8px)] bg-[size:20px_20px] px-5 py-10">
      <div className="w-full max-w-[560px]">
        <div className="mb-9 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F52F43] text-white shadow-sm">
            <BusFront size={34} strokeWidth={2.4} />
          </div>

          <h1 className="text-[27px] font-extrabold tracking-tight text-[#102B4E]">
            3Travel<span className="text-[#1765E8]">Go</span>
          </h1>

          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Bus Reservation Management System
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white px-7 py-9 shadow-[0_12px_35px_rgba(15,23,42,0.07)] sm:px-11 sm:py-10">
          <div className="mb-7">
            <h2 className="text-[25px] font-bold tracking-tight text-[#102B4E]">
              CREATE ACCOUNT
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create your account to start booking trips with 3TravelGo.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Full Name
              </label>

              <div className="flex h-[52px] items-center rounded-xl border border-slate-200 px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
                <UserRound size={18} className="shrink-0 text-slate-400" />

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Email Address
              </label>

              <div className="flex h-[52px] items-center rounded-xl border border-slate-200 px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
                <Mail size={18} className="shrink-0 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Phone Number
              </label>

              <div className="flex h-[52px] items-center rounded-xl border border-slate-200 px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
                <Phone size={18} className="shrink-0 text-slate-400" />

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                  className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Password
              </label>

              <div className="flex h-[52px] items-center rounded-xl border border-slate-200 px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
                <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Password must contain at least 8 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Confirm Password
              </label>

              <div className="flex h-[52px] items-center rounded-xl border border-slate-200 px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
                <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                <input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  aria-label={
                    showPasswordConfirm ? "Hide password" : "Show password"
                  }
                  className="shrink-0 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordConfirm ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-[#1765E8] text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <a
                href="/customer/login"
                className="font-semibold text-[#1765E8] hover:underline"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
