import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, Save, X, Pencil, UserPlus, ChevronDown, ChevronRight, BookOpen, Settings2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { startImpersonation, ImpersonateRole } from "@/lib/impersonation";
import { AddCompanyModal } from "@/components/AddCompanyModal";
import { CompanyTrainingManager } from "@/components/CompanyTrainingManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [editDraft, setEditDraft] = useState<{ slug: string; customDomain: string }>({
    slug: "",
    customDomain: "",
  });
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"progress" | "score">("progress");
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [trainingManagerSlug, setTrainingManagerSlug] = useState<string | null>(null);
  const [addLearnerOpen, setAddLearnerOpen] = useState(false);
  const [addLearnerForm, setAddLearnerForm] = useState({ full_name: "", email: "", company_slug: "" });
  const [addLearnerSubmitting, setAddLearnerSubmitting] = useState(false);

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
    setEditDraft({ slug: c.slug, customDomain: c.customDomain || "" });
  };

  const saveEdit = async (original: Company) => {
    try {
      await updateCompanyInDb(
        {
          ...original,
          slug: editDraft.slug.trim(),
          customDomain: editDraft.customDomain.trim() || null,
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

  const openAddLearnerForCompany = (slug: string) => {
    setAddLearnerForm({ full_name: "", email: "", company_slug: slug });
    setAddLearnerOpen(true);
  };

  const handleDeleteLearner = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the platform? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from("training_users").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Learner removed", description: `${name} has been deleted.` });
      loadData();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const handleAddLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLearnerSubmitting(true);
    try {
      const { error } = await supabase.from("training_users").upsert(
        {
          email: addLearnerForm.email.trim().toLowerCase(),
          full_name: addLearnerForm.full_name.trim(),
          company_slug: addLearnerForm.company_slug,
        },
        { onConflict: "email,company_slug" },
      );
      if (error) throw error;
      toast({ title: "Learner added", description: `${addLearnerForm.full_name} added to ${addLearnerForm.company_slug}` });
      setAddLearnerOpen(false);
      setAddLearnerForm({ full_name: "", email: "", company_slug: "" });
      loadData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to add learner", variant: "destructive" });
    } finally {
      setAddLearnerSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const handleViewAs = (slug: string, name: string, role: ImpersonateRole) => {
    startImpersonation({ companySlug: slug, companyName: name, role });
    if (role === "admin") navigate(`/admin/${slug}/dashboard`);
    else navigate(`/${slug}`);
  };

  const handleManage = (slug: string) => {
    // Open the rich AdminPanel with this company pre-selected
    sessionStorage.setItem("admin-panel-selected-company", slug);
    navigate("/admin");
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
                    const isExpanded = expandedCompany === c.slug;
                    return (
                      <React.Fragment key={c.slug}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => setExpandedCompany(isExpanded ? null : c.slug)}
                      >
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
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {isExpanded
                              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            }
                            {ls.length}
                          </div>
                        </TableCell>
                        <TableCell>{avg.toFixed(0)}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={(e) => { e.stopPropagation(); setTrainingManagerSlug(c.slug); }}
                              title="Manage training material for this company"
                            >
                              <BookOpen className="h-4 w-4" />
                              Training
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => openAddLearnerForCompany(c.slug)}
                              title="Add learner to this company"
                            >
                              <UserPlus className="h-4 w-4" />
                              Add Learner
                            </Button>
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
                      {isExpanded && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell colSpan={7} className="p-0">
                            <div className="px-6 py-3">
                              {ls.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-1">No learners yet.</p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-muted-foreground border-b">
                                      <th className="text-left pb-1 font-medium w-40">Name</th>
                                      <th className="text-left pb-1 font-medium">Email</th>
                                      <th className="text-left pb-1 font-medium w-24">Modules</th>
                                      <th className="text-left pb-1 font-medium w-20">Score</th>
                                      <th className="w-8"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ls.map((l) => (
                                      <tr key={l.id} className="border-b last:border-0">
                                        <td className="py-1.5 font-medium pr-4">{l.full_name}</td>
                                        <td className="py-1.5 text-muted-foreground pr-4">{l.email}</td>
                                        <td className="py-1.5">{l.completed}/{TOTAL_MODULES}</td>
                                        <td className="py-1.5">{l.avgScore !== null ? `${l.avgScore.toFixed(0)}%` : "—"}</td>
                                        <td className="py-1.5">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteLearner(l.id, l.full_name); }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 gap-1 h-7 text-xs"
                                onClick={(e) => { e.stopPropagation(); openAddLearnerForCompany(c.slug); }}
                              >
                                <UserPlus className="h-3 w-3" /> Add Learner
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </React.Fragment>
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
              <Dialog open={addLearnerOpen} onOpenChange={setAddLearnerOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Learner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Learner</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddLearner} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="al-company">Company *</Label>
                      {addLearnerForm.company_slug ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={companies.find((c) => c.slug === addLearnerForm.company_slug)?.name || addLearnerForm.company_slug}
                            readOnly
                            className="bg-muted"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddLearnerForm((f) => ({ ...f, company_slug: "" }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <select
                          id="al-company"
                          required
                          value={addLearnerForm.company_slug}
                          onChange={(e) => setAddLearnerForm((f) => ({ ...f, company_slug: e.target.value }))}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="">Select a company</option>
                          {companies.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="al-name">Full Name *</Label>
                      <Input
                        id="al-name"
                        placeholder="Jane Smith"
                        value={addLearnerForm.full_name}
                        onChange={(e) => setAddLearnerForm((f) => ({ ...f, full_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="al-email">Email *</Label>
                      <Input
                        id="al-email"
                        type="email"
                        placeholder="jane@company.com"
                        value={addLearnerForm.email}
                        onChange={(e) => setAddLearnerForm((f) => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The learner can log in at /register/{addLearnerForm.company_slug || "<company>"} with their email.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" type="button" onClick={() => setAddLearnerOpen(false)} disabled={addLearnerSubmitting}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addLearnerSubmitting}>
                        {addLearnerSubmitting ? "Adding..." : "Add Learner"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                    <TableHead className="w-10"></TableHead>
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
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                          onClick={() => handleDeleteLearner(l.id, l.full_name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Per-company training manager */}
      {trainingManagerSlug && (
        <CompanyTrainingManager
          companySlug={trainingManagerSlug}
          companyName={companyName(trainingManagerSlug)}
          open={!!trainingManagerSlug}
          onClose={() => setTrainingManagerSlug(null)}
        />
      )}
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