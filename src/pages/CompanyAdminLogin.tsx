import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CompanyAdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If already signed in as a company admin, redirect
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const userEmail = data.session.user.email?.toLowerCase();
      const { data: admin } = await supabase
        .from("company_admins" as any)
        .select("company_slug")
        .eq("email", userEmail)
        .maybeSingle();
      if (admin) navigate(`/admin/${(admin as any).company_slug}/dashboard`, { replace: true });
    });
  }, [navigate]);

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

    const userEmail = data.user?.email?.toLowerCase();
    const { data: admin } = await supabase
      .from("company_admins" as any)
      .select("company_slug")
      .eq("email", userEmail)
      .maybeSingle();

    setSubmitting(false);

    if (!admin) {
      await supabase.auth.signOut();
      toast({
        title: "Access denied",
        description: "This account is not linked to any company admin profile.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/admin/${(admin as any).company_slug}/dashboard`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <img
              src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
              alt="Ops Solutions"
              className="h-10"
            />
          </div>
          <CardTitle className="text-center">Company Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to view your company's training progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
    </div>
  );
};

export default CompanyAdminLogin;
