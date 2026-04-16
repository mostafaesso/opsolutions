import { useState } from "react";
import { Mail, User } from "lucide-react";

interface Props {
  companyName: string;
  companyLogo: string;
  loading: boolean;
  onRegister: (email: string, name: string) => void;
}

const RegistrationGate = ({ companyName, companyLogo, loading, onRegister }: Props) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && name.trim()) onRegister(email.trim(), name.trim());
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={companyLogo} alt={companyName} className="h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Training</h1>
          <p className="text-muted-foreground text-sm">Enter your details to access the {companyName} HubSpot training portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mostafa Ali"
                required
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !email.trim() || !name.trim()}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Start Training"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationGate;
