import { useState, type FormEvent } from "react";
import { adminLogin, type AdminUser } from "../../services/adminAuth";

interface LoginProps {
  onLoginSuccess: (admin: AdminUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const admin = await adminLogin(email.trim(), password);

      onLoginSuccess(admin);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F2F6FC] px-5 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#d7e1ef 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative w-full max-w-[560px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-[66px] w-[66px] items-center justify-center rounded-xl bg-[#EF3340] text-[30px] text-white shadow-sm">
            <i className="fa-solid fa-bus-simple" />
          </div>

          <h1 className="mt-4 text-[30px] font-extrabold tracking-tight text-[#0B2545]">
            3Travel<span className="text-[#1765E8]">Go</span>
          </h1>

          <p className="mt-1 text-[10px] font-bold tracking-[2.2px] text-[#788BA8]">
            BUS RESERVATION MANAGEMENT SYSTEM
          </p>
        </div>

        <section className="rounded-2xl border border-[#E5ECF5] bg-white px-7 py-9 shadow-[0_12px_40px_rgba(11,37,69,0.07)] sm:px-11 sm:py-11">
          <div className="mb-8">
            <h2 className="text-[25px] font-extrabold tracking-wide text-[#0B2545]">
              LOGIN
            </h2>

            <p className="mt-2 text-sm text-[#788BA8]">
              Sign in to manage trips, reservations, and passengers.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <i className="fa-solid fa-circle-exclamation mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#26364B]"
              >
                Admin Email
              </label>

              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-[#9AAAC0]" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your admin email"
                  autoComplete="username"
                  required
                  className="h-[50px] w-full rounded-lg border border-[#E5ECF5] bg-[#FBFCFE] pl-11 pr-4 text-sm text-[#26364B] outline-none transition focus:border-[#1765E8] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#26364B]"
              >
                Password
              </label>

              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#9AAAC0]" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-[50px] w-full rounded-lg border border-[#E5ECF5] bg-[#FBFCFE] pl-11 pr-12 text-sm text-[#26364B] outline-none transition focus:border-[#1765E8] focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AAAC0] hover:text-[#1765E8]"
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-[51px] w-full items-center justify-center gap-3 rounded-lg bg-[#1765E8] text-sm font-bold text-white transition hover:bg-[#1056CC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}

              {!isSubmitting && <i className="fa-solid fa-arrow-right" />}
            </button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#EDF1F7] pt-5 text-xs text-[#788BA8]">
            <i className="fa-solid fa-shield-halved text-[#1765E8]" />
            Secure administrator access
          </div>
        </section>
      </div>
    </main>
  );
}
