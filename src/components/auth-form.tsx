import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";

type AuthView = "login" | "register";

export function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signIn, signUp } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (view === "login") {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err);
        } else {
          onSuccess?.();
        }
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setSubmitting(false);
          return;
        }
        const { error: err } = await signUp(email, password, displayName);
        if (err) {
          setError(err);
        } else {
          onSuccess?.();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[440px] mx-auto bg-card min-h-screen shadow-2xl shadow-foreground/5 flex flex-col border-x border-border">
        <header className="p-6 flex items-center gap-3 border-b border-border">
          <button
            onClick={onSuccess}
            className="size-9 rounded-lg grid place-items-center hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-tight">
              {view === "login" ? "Sign In" : "Create Account"}
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {view === "login" ? "Welcome back" : "Join O'Clock"}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
            {view === "register" && (
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Display name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-extrabold uppercase py-4 rounded-xl transition-all active:scale-[0.98] tracking-widest text-sm mt-2"
            >
              {submitting
                ? "Please wait..."
                : view === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setView(view === "login" ? "register" : "login");
                  setError(null);
                }}
                className="text-primary font-semibold hover:underline"
              >
                {view === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
