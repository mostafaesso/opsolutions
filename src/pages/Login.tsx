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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <img
            src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
            alt="Ops Solutions"
            className="h-12"
          />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <h1 className="text-2xl font-bold text-center">
              {resetMode ? "Reset Password" : "Login"}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {resetMode
                ? "Enter your email and we'll send a reset link"
                : "Sign in to access your training portal"}
            </p>
          </CardHeader>
          <CardContent>
            {resetMode ? (
              resetSent ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-foreground">
                    Reset link sent to <strong>{email}</strong>. Check your inbox.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => { setResetMode(false); setResetSent(false); }}>
                    Back to Sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={resetSubmitting}>
                    {resetSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setResetMode(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Sign in
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Company Domain</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="e.g. acme, techcorp, ops"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
