import { useState } from "react";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "ops2025admin";

const AdminPasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin-auth") === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "true");
      setAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">Admin Access</h1>
            <p className="text-sm text-muted-foreground">Enter the admin password to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full text-sm border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                error ? "border-destructive ring-2 ring-destructive/30" : "border-border"
              }`}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">Incorrect password</p>}
            <button
              type="submit"
              className="w-full text-sm font-semibold bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordGate;
