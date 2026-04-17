import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchCompanyBySlug } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const EmployeeRegister = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!companySlug) return;
    fetchCompanyBySlug(companySlug).then((c) => {
      if (!c) navigate("/login", { replace: true });
      else setCompanyName(c.name);
    });
  }, [companySlug, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companySlug) return;
    setSubmitting(true);

    // Use detected company if available, otherwise use URL slug
    const assignedCompanySlug = detectedCompany || companySlug;

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (signUpError) {
      setSubmitting(false);
      toast({
        title: "Registration failed",
        description: signUpError.message,
        variant: "destructive",
      });
      return;
    }

    await supabase.from("training_users").upsert(
      {
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        company_slug: assignedCompanySlug,
      },
      { onConflict: "email,company_slug" }
    );

    setSubmitting(false);
    toast({ title: "Account created!", description: "Welcome to the training portal." });
    navigate(`/${assignedCompanySlug}`, { replace: true });
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
            <h1 className="text-2xl font-bold text-center">Create Account</h1>
            {companyName && (
              <p className="text-sm text-muted-foreground text-center">
                Joining <strong>{companyName}</strong> training portal
              </p>
            )}
            {detectedCompany && detectedCompany !== companySlug && (
              <p className="text-xs text-blue-600 text-center mt-2">
                ✓ Your email domain matched a company — you'll be auto-assigned to your team.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeRegister;