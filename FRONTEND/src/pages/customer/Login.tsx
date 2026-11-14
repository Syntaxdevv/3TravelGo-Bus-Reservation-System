import { useState, type FormEvent } from "react";
import {
  BusFront,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { customerLogin } from "../../services/customerAuth";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await customerLogin(email, password);
      window.location.href = "/customer/dashboard";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F7FD] bg-[radial-gradient(#B8C8DD_0.8px,transparent_0.8px)] bg-[size:20px_20px] px-5 py-10">
      <div className="w-full max-w-[560px]">
        <div className="mb-10 flex flex-col items-center text-center">
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

        <div className="rounded-2xl border border-slate-200/80 bg-white px-7 py-9 shadow-[0_12px_35px_rgba(15,23,42,0.07)] sm:px-11 sm:py-11">
          <div className="mb-8">
            <h2 className="text-[25px] font-bold tracking-tight text-[#102B4E]">
              LOGIN
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to your account to book and manage your trips.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Email address
              </label>

              <div className="flex h-[54px] items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
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
                htmlFor="password"
                className="mb-2 block text-[13px] font-semibold text-[#334155]"
              >
                Password
              </label>

              <div className="flex h-[54px] items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-[#1765E8] focus-within:ring-2 focus-within:ring-blue-100">
                <LockKeyhole size={18} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-[#1765E8] text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <a
                href="/customer/register"
                className="font-semibold text-[#1765E8] hover:underline"
              >
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
