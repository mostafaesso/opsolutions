import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, Save, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { AddCompanyModal } from "@/components/AddCompanyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchCompanies,
  removeCompanyFromDb,
  setCompanyActive,
  updateCompanyInDb,
  Company,
} from "@/lib/companies";
import { trainingCards } from "@/lib/trainingData";
import { useToast } from "@/hooks/use-toast";

const TOTAL_MODULES = trainingCards.length;

interface LearnerRow {
  id: string;
  full_name: string;
  email: string;
  company_slug: string;
  last_active_at: string | null;
  completed: number;
  avgScore: number | null;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin, loading: authLoading } = useSuperAdmin();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ slug: string; customDomain: string; domain: string }>({
    slug: "",
    customDomain: "",
    domain: "",
  });
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"progress" | "score">("progress");

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) navigate("/login", { replace: true });
  }, [authLoading, isSuperAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    const [comps, usersRes, completionsRes] = await Promise.all([
      fetchCompanies(),
      supabase.from("training_users").select("*"),
      supabase.from("training_completions").select("user_id, card_id, quiz_score" as any),
    ]);

    setCompanies(comps);

    const completions = (completionsRes.data || []) as any[];
    const byUser: Record<string, { cards: Set<string>; scores: number[] }> = {};
    completions.forEach((c) => {
      if (!byUser[c.user_id]) byUser[c.user_id] = { cards: new Set(), scores: [] };
      byUser[c.user_id].cards.add(c.card_id);
      if (typeof c.quiz_score === "number") byUser[c.user_id].scores.push(c.quiz_score);
    });

    const rows: LearnerRow[] = (usersRes.data || []).map((u: any) => {
      const agg = byUser[u.id] || { cards: new Set(), scores: [] };
      const avg =
        agg.scores.length > 0 ? agg.scores.reduce((a, b) => a + b, 0) / agg.scores.length : null;
      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        company_slug: u.company_slug,
        last_active_at: u.last_active_at,
        completed: agg.cards.size,
        avgScore: avg,
      };
    });
    setLearners(rows);
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) loadData();
  }, [isSuperAdmin]);

  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const totalLearners = learners.length;
    const avgCompletion =
      totalLearners > 0
        ? learners.reduce((s, l) => s + l.completed / TOTAL_MODULES, 0) / totalLearners * 100
        : 0;
    const scored = learners.filter((l) => l.avgScore !== null);
    const avgScore =
      scored.length > 0 ? scored.reduce((s, l) => s + (l.avgScore || 0), 0) / scored.length : 0;
    return { totalCompanies, totalLearners, avgCompletion, avgScore };
  }, [companies, learners]);

  const learnersByCompany = useMemo(() => {
    const map: Record<string, LearnerRow[]> = {};
    learners.forEach((l) => {
      if (!map[l.company_slug]) map[l.company_slug] = [];
      map[l.company_slug].push(l);
    });
    return map;
  }, [learners]);

  const filteredLearners = useMemo(() => {
    let rows = [...learners];
    if (filterCompany !== "all") rows = rows.filter((r) => r.company_slug === filterCompany);
    if (sortBy === "progress") rows.sort((a, b) => b.completed - a.completed);
    else rows.sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1));
    return rows;
  }, [learners, filterCompany, sortBy]);

  const handleToggleActive = async (slug: string, next: boolean) => {
    try {
      await setCompanyActive(slug, next);
      setCompanies((prev) => prev.map((c) => (c.slug === slug ? { ...c, isActive: next } : c)));
      toast({ title: next ? "Company activated" : "Company deactivated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const startEdit = (c: Company) => {
    setEditingSlug(c.slug);
    setEditDraft({ slug: c.slug, customDomain: c.customDomain || "", domain: (c as any).domain || "" });
  };

  const saveEdit = async (original: Company) => {
    try {
      await updateCompanyInDb(
        {
          ...original,
          slug: editDraft.slug.trim(),
          customDomain: editDraft.customDomain.trim() || null,
          domain: editDraft.domain.trim() || null,
        },
        original.slug,
      );
      setEditingSlug(null);
      await loadData();
      toast({ title: "Company updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await removeCompanyFromDb(slug);
      setCompanies((prev) => prev.filter((c) => c.slug !== slug));
      toast({ title: "Company deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  if (authLoading || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const companyName = (slug: string) => companies.find((c) => c.slug === slug)?.name || slug;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Super Admin</h1>
            <p className="text-xs text-muted-foreground">Platform control panel</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Companies" value={stats.totalCompanies.toString()} />
          <StatCard label="Total Learners" value={stats.totalLearners.toString()} />
          <StatCard label="Avg Completion" value={`${stats.avgCompletion.toFixed(0)}%`} />
          <StatCard label="Avg Quiz Score" value={`${stats.avgScore.toFixed(0)}%`} />
        </div>

        {/* Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Companies</CardTitle>
            <AddCompanyModal onCompanyAdded={loadData} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : companies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No companies yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Custom Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Learners</TableHead>
                    <TableHead>Avg Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => {
                    const ls = learnersByCompany[c.slug] || [];
                    const avg =
                      ls.length > 0
                        ? (ls.reduce((s, l) => s + l.completed / TOTAL_MODULES, 0) / ls.length) * 100
                        : 0;
                    const editing = editingSlug === c.slug;
                    return (
                      <TableRow key={c.slug}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          {editing ? (
                            <Input
                              value={editDraft.slug}
                              onChange={(e) =>
                                setEditDraft((d) => ({ ...d, slug: e.target.value }))
                              }
                              className="h-8 w-32"
                            />
                          ) : (
                            <code className="text-xs">/{c.slug}</code>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing ? (
                            <Input
                              value={editDraft.domain}
                              onChange={(e) =>
                                setEditDraft((d) => ({ ...d, domain: e.target.value }))
                              }
                              placeholder="company.com"
                              className="h-8 w-32"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {(c as any).domain || "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing ? (
                            <Input
                              value={editDraft.customDomain}
                              onChange={(e) =>
                                setEditDraft((d) => ({ ...d, customDomain: e.target.value }))
                              }
                              placeholder="academy.acme.com"
                              className="h-8 w-40"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {c.customDomain || "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={c.isActive !== false}
                              onCheckedChange={(v) => handleToggleActive(c.slug, v)}
                            />
                            <span className="text-xs">
                              {c.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{ls.length}</TableCell>
                        <TableCell>{avg.toFixed(0)}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editing ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => saveEdit(c)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingSlug(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {c.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the company and its media.
                                    Learner records remain. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(c.slug)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Learners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle>All Learners</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Sort by progress</SelectItem>
                  <SelectItem value="score">Sort by score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filteredLearners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No learners yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLearners.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.full_name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{l.email}</TableCell>
                      <TableCell>{companyName(l.company_slug)}</TableCell>
                      <TableCell>
                        {l.completed}/{TOTAL_MODULES}
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
                  ))}
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

export default SuperAdminDashboard;