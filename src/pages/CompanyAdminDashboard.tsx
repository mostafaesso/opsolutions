import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCompanyBySlug, Company } from "@/lib/companies";
import { trainingCards } from "@/lib/trainingData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const TOTAL = trainingCards.length;

interface LearnerRow {
  id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  completed: number;
  avgScore: number | null;
}

const CompanyAdminDashboard = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login", { replace: true });
        return;
      }
      const userEmail = data.session.user.email?.toLowerCase();
      const { data: admin } = await supabase
        .from("company_admins" as any)
        .select("company_slug")
        .eq("email", userEmail)
        .maybeSingle();

      if (!admin || (admin as any).company_slug !== companySlug) {
        navigate("/login", { replace: true });
        return;
      }
      setAuthChecked(true);
    };
    check();
  }, [navigate, companySlug]);

  useEffect(() => {
    if (!authChecked || !companySlug) return;

    const load = async () => {
      const [comp, usersRes] = await Promise.all([
        fetchCompanyBySlug(companySlug),
        supabase.from("training_users").select("*").eq("company_slug", companySlug),
      ]);
      setCompany(comp);

      const users = usersRes.data || [];
      if (users.length === 0) {
        setLearners([]);
        setLoading(false);
        return;
      }

      const { data: completionsData } = await supabase
        .from("training_completions")
        .select("user_id, card_id, quiz_score" as any)
        .in(
          "user_id",
          users.map((u: any) => u.id),
        );

      const byUser: Record<string, { cards: Set<string>; scores: number[] }> = {};
      (completionsData || []).forEach((c: any) => {
        if (!byUser[c.user_id]) byUser[c.user_id] = { cards: new Set(), scores: [] };
        byUser[c.user_id].cards.add(c.card_id);
        if (typeof c.quiz_score === "number") byUser[c.user_id].scores.push(c.quiz_score);
      });

      setLearners(
        users.map((u: any) => {
          const agg = byUser[u.id] || { cards: new Set(), scores: [] };
          const avg =
            agg.scores.length > 0
              ? agg.scores.reduce((a: number, b: number) => a + b, 0) / agg.scores.length
              : null;
          return {
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            last_active_at: u.last_active_at,
            completed: agg.cards.size,
            avgScore: avg,
          };
        }),
      );
      setLoading(false);
    };

    load();
  }, [authChecked, companySlug]);

  const stats = useMemo(() => {
    const total = learners.length;
    const avgCompletion =
      total > 0
        ? (learners.reduce((s, l) => s + l.completed / TOTAL, 0) / total) * 100
        : 0;
    const scored = learners.filter((l) => l.avgScore !== null);
    const avgScore =
      scored.length > 0
        ? scored.reduce((s, l) => s + (l.avgScore || 0), 0) / scored.length
        : 0;
    const certs = learners.filter((l) => l.completed >= TOTAL).length;
    return { total, avgCompletion, avgScore, certs };
  }, [learners]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company?.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-9 object-contain" />
            )}
            <div>
              <h1 className="text-lg font-bold">{company?.name ?? companySlug}</h1>
              <p className="text-xs text-muted-foreground">Training Dashboard</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Learners" value={stats.total.toString()} />
          <StatCard label="Avg Completion" value={`${stats.avgCompletion.toFixed(0)}%`} />
          <StatCard label="Avg Quiz Score" value={`${stats.avgScore.toFixed(0)}%`} />
          <StatCard label="Certificates Earned" value={stats.certs.toString()} />
        </div>

        {/* Learners table */}
        <Card>
          <CardHeader>
            <CardTitle>Learners</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : learners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No learners yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {learners
                    .sort((a, b) => b.completed - a.completed)
                    .map((l) => {
                      const pct = Math.round((l.completed / TOTAL) * 100);
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{l.full_name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{l.email}</TableCell>
                          <TableCell>
                            {l.completed}/{TOTAL}
                          </TableCell>
                          <TableCell className="w-32">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {pct}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {l.avgScore !== null ? `${l.avgScore.toFixed(0)}%` : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.last_active_at
                              ? new Date(l.last_active_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardContent className="pt-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </CardContent>
  </Card>
);

export default CompanyAdminDashboard;