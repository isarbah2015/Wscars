import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (email === "admin@westcars.gh" && password === "admin2024") {
      onLogin();
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#0EB5CA] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">W</span>
            </div>
            <div className="text-left">
              <p className="text-xl font-black text-foreground tracking-widest">WESTCARS</p>
              <p className="text-xs text-muted-foreground -mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Sign in with your admin credentials</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-card-border shadow-sm p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@westcars.gh"
                required
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0EB5CA] hover:bg-[#0098AA] text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-center text-muted-foreground pt-1">
            Hint: admin@westcars.gh / admin2024
          </p>
        </form>
      </div>
    </div>
  );
}
