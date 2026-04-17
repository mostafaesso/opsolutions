import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
            <h1 className="text-2xl font-bold text-center">Academy Login</h1>
            <p className="text-sm text-muted-foreground text-center">
              Sign in to access your training portal
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="password">Password</Label>
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
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Access levels
          </p>
          <div className="space-y-1.5 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              <span>Academy Admin — full platform access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span>Company Admin — your company's employees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span>Employee — your training modules</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;