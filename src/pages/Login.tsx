import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, BarChart3, Building2, Lock, Mail, Sparkles, Target } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { role, companySlug } = await resolveUserRole(session.user);
      redirectByRole(role, companySlug);
    });
  }, []);

  const redirectByRole = (role: string | null, companySlug: string | null) => {
    if (role === "academy_admin") navigate("/super-admin", { replace: true });
    else if (role === "company_admin" && companySlug)
      navigate(`/admin/${companySlug}/dashboard`, { replace: true });
    else if (role === "employee" && companySlug) navigate(`/${companySlug}`, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const normalizedDomain = domain.trim().toLowerCase();

    if (normalizedDomain !== "ops") {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("slug")
        .eq("slug", normalizedDomain)
        .maybeSingle();

      if (companyError || !company) {
        setSubmitting(false);
        toast({
          title: "Domain not found",
          description: `No company found with domain "${normalizedDomain}". Please check and try again.`,
          variant: "destructive",
        });
        return;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setSubmitting(false);
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }

    const { role, companySlug } = await resolveUserRole(data.user);
    setSubmitting(false);

    if (!role) {
      await supabase.auth.signOut();
      toast({
        title: "Access denied",
        description: "Your account is not linked to any role. Contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    redirectByRole(role, companySlug);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Enter your email first", variant: "destructive" });
      return;
    }
    setResetSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between overflow-hidden bg-primary text-primary-foreground p-12">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary-foreground flex items-center justify-center ring-1 ring-primary-foreground/20 shadow-lg p-1.5">
            <img
              src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
              alt="Ops Solutions"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-bold text-lg tracking-tight">Ops Solutions</span>
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm px-3 py-1 text-xs font-medium ring-1 ring-primary-foreground/20 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              GTM Operating System
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              Where revenue teams build, learn, and execute.
            </h2>
            <p className="mt-5 text-base text-primary-foreground/70 leading-relaxed">
              Your unified portal for HubSpot training, GTM strategy, and pipeline performance — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Target, label: "AI-powered ICP builder grounded in your domain" },
              { icon: BarChart3, label: "Real-time pipeline & conversion benchmarks" },
              { icon: Building2, label: "Multi-tenant company portals out of the box" },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3 rounded-xl bg-primary-foreground/5 backdrop-blur-sm p-3 ring-1 ring-primary-foreground/10">
                <div className="shrink-0 h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm text-primary-foreground/85 leading-relaxed pt-1">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-primary-foreground/50">
          <span>© {new Date().getFullYear()} Ops Solutions</span>
          <span className="h-1 w-1 rounded-full bg-primary-foreground/30" />
          <a href="https://www.opsolutionss.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">
            opsolutionss.com
          </a>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
              alt="Ops Solutions"
              className="h-10"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {resetMode ? "Reset your password" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {resetMode
                ? "Enter your email and we'll send you a secure reset link."
                : "Sign in to access your training and GTM portal."}
            </p>
          </div>

          {resetMode ? (
            resetSent ? (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a reset link to <strong className="text-foreground">{email}</strong>.
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setResetMode(false); setResetSent(false); }}>
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 group" disabled={resetSubmitting}>
                  {resetSubmitting ? "Sending..." : (
                    <>Send reset link <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-foreground">Company domain</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="domain"
                    type="text"
                    placeholder="acme, techcorp, ops…"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    autoComplete="off"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 group shadow-sm" disabled={submitting}>
                {submitting ? "Signing in..." : (
                  <>Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Protected by enterprise-grade authentication
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
