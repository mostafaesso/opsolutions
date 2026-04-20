import { useEffect, useState } from "react";
import { useIcpTemplates, useCompanyIcps, IcpTemplate, CompanyIcp } from "@/hooks/useIcpTemplates";
import { Company, updateCompanyInDb } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, Target, Library, Building2, Save, Wand2, Copy,
  Building, Users, Flame, ShieldAlert, CheckCircle2, FileDown, Sparkles, Gauge,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateIcpPdf } from "@/lib/icpPdf";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  companies: Company[];
}

type FieldDef = {
  key: keyof IcpTemplate;
  label: string;
  placeholder: string;
  multi?: boolean;
};

// Sections aligned with the "Building Your ICP" doc
const SECTIONS: { id: string; title: string; icon: any; description: string; fields: FieldDef[] }[] = [
  {
    id: "company",
    title: "Layer 1 · Company-Level",
    icon: Building,
    description: "Which companies are the best fit for your offer.",
    fields: [
      { key: "industry", label: "Industry / Vertical", placeholder: "SaaS, FinTech, HRTech, Logistics…" },
      { key: "company_size", label: "Company Size", placeholder: "10–500 employees, $1M–$20M revenue" },
      { key: "geography", label: "Location / Region", placeholder: "GCC, MENA, EU, US" },
      { key: "funding_stage", label: "Funding Stage", placeholder: "Seed, Series A/B, Bootstrapped" },
      { key: "hiring_activity", label: "Hiring Activity", placeholder: "Hiring SDRs, RevOps, expanding sales team" },
      { key: "tech_stack", label: "Tech Stack Signals", placeholder: "Uses HubSpot, Apollo, Salesforce…" },
      { key: "growth_signals", label: "Growth Signals", placeholder: "Recent funding, expansion, product launch", multi: true },
    ],
  },
  {
    id: "contact",
    title: "Layer 2 · Contact-Level",
    icon: Users,
    description: "Who inside these companies should receive your message.",
    fields: [
      { key: "departments", label: "Departments", placeholder: "Sales, Marketing, RevOps, Partnerships" },
      { key: "seniority", label: "Seniority", placeholder: "C-level, VP, Director, Head of…" },
      { key: "buying_role", label: "Role in Buying Process", placeholder: "Decision maker, champion, influencer" },
    ],
  },
  {
    id: "strategy",
    title: "Pain · Triggers · Goals",
    icon: Flame,
    description: "Shapes your cold-email problem statement and timing.",
    fields: [
      { key: "pain_points", label: "Pain Points", placeholder: "Unpredictable pipeline, low conversion, fragmented GTM…", multi: true },
      { key: "buying_triggers", label: "Buying Triggers", placeholder: "New funding, hiring SDRs, expansion, launch", multi: true },
      { key: "goals", label: "Their Goals", placeholder: "Predictable pipeline, faster sales cycles…", multi: true },
      { key: "decision_process", label: "Decision Process", placeholder: "Stakeholders, timeline, criteria", multi: true },
      { key: "budget_range", label: "Budget Range", placeholder: "$20k–$100k annual contract" },
    ],
  },
  {
    id: "exclusions",
    title: "Exclusions & Disqualifiers",
    icon: ShieldAlert,
    description: "Keeps data clean and campaigns focused.",
    fields: [
      { key: "exclusions", label: "Exclusions", placeholder: "B2C, Government, early-stage startups", multi: true },
      { key: "disqualifiers", label: "Red-flag Disqualifiers", placeholder: "Anything that immediately disqualifies a prospect", multi: true },
    ],
  },
  {
    id: "validation",
    title: "Validation",
    icon: CheckCircle2,
    description: "Audit clients, test TAM, and capture pilot results.",
    fields: [
      { key: "tam_estimate", label: "TAM Estimate", placeholder: "e.g. ~8,000 contacts in Apollo / Sales Nav" },
      { key: "validation_notes", label: "Validation Notes", placeholder: "Top 5 client patterns, pilot results, reply rate…", multi: true },
      { key: "notes", label: "Other Notes", placeholder: "Anything else worth capturing", multi: true },
    ],
  },
];

const TIER_OPTIONS = [
  { value: "Tier 1: Dream ICPs", desc: "High-value strategic accounts — sniper mode" },
  { value: "Tier 2: Mid ICPs", desc: "Scalable, proven segment — balanced personalization" },
  { value: "Tier 3: Test ICPs", desc: "Experimental verticals — shotgun mode" },
];

const PERSONALIZATION_OPTIONS = ["Sniper (highly personalized)", "Balanced", "Shotgun (automated)"];

const IcpTemplatesPanel = ({ companies }: Props) => {
  const { templates, loading, create, update, remove } = useIcpTemplates();
  const [view, setView] = useState<"library" | "company">("library");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>(companies[0]?.slug ?? "");

  useEffect(() => {
    if (!selectedCompany && companies[0]) setSelectedCompany(companies[0].slug);
  }, [companies, selectedCompany]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl p-1 w-fit">
        <button
          onClick={() => setView("library")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Library className="w-4 h-4" /> Template Library
        </button>
        <button
          onClick={() => setView("company")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "company" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-4 h-4" /> Per-Company Editor
        </button>
      </div>

      {view === "library" ? (
        <LibraryView
          templates={templates}
          loading={loading}
          editingId={editingId}
          setEditingId={setEditingId}
          onCreate={async (input) => {
            const tpl = await create(input);
            toast({ title: "Template created" });
            setEditingId(tpl.id);
          }}
          onUpdate={async (id, patch) => {
            await update(id, patch);
            toast({ title: "Template saved" });
          }}
          onRemove={async (id) => {
            await remove(id);
            toast({ title: "Template deleted" });
            if (editingId === id) setEditingId(null);
          }}
        />
      ) : (
        <CompanyView
          companies={companies}
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          templates={templates}
        />
      )}
    </div>
  );
};

// ─── Shared editor body ─────────────────────────────────────

const TierAndModeRow = ({
  tier, personalization, onChange,
}: {
  tier: string | null;
  personalization: string | null;
  onChange: (patch: { tier?: string | null; personalization_level?: string | null }) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label className="text-xs">Tier</Label>
      <Select value={tier ?? ""} onValueChange={(v) => onChange({ tier: v || null })}>
        <SelectTrigger className="mt-1"><SelectValue placeholder="Pick a tier (Dream / Mid / Test)" /></SelectTrigger>
        <SelectContent>
          {TIER_OPTIONS.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              <div className="flex flex-col">
                <span className="font-medium">{t.value}</span>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label className="text-xs">Personalization Level</Label>
      <Select value={personalization ?? ""} onValueChange={(v) => onChange({ personalization_level: v || null })}>
        <SelectTrigger className="mt-1"><SelectValue placeholder="Sniper / Balanced / Shotgun" /></SelectTrigger>
        <SelectContent>
          {PERSONALIZATION_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const SectionFields = ({
  draft, setDraft,
}: {
  draft: any;
  setDraft: (d: any) => void;
}) => (
  <div className="space-y-6">
    {SECTIONS.map((section) => {
      const Icon = section.icon;
      return (
        <div key={section.id} className="rounded-xl border border-border bg-muted/20 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{section.title}</h4>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.id === "contact" && (
              <div className="md:col-span-2">
                <Label className="text-xs">Decision-maker Titles (comma-separated)</Label>
                <Input
                  value={(draft.job_titles ?? []).join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      job_titles: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="CEO, CMO, VP Sales, Founder, Head of Partnerships"
                  className="mt-1"
                />
              </div>
            )}
            {section.fields.map((f) => (
              <div key={String(f.key)} className={f.multi ? "md:col-span-2" : ""}>
                <Label className="text-xs">{f.label}</Label>
                {f.multi ? (
                  <Textarea
                    value={(draft as any)[f.key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="mt-1 min-h-[72px]"
                  />
                ) : (
                  <Input
                    value={(draft as any)[f.key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── LIBRARY ─────────────────────────────────────

const LibraryView = ({
  templates, loading, editingId, setEditingId, onCreate, onUpdate, onRemove,
}: {
  templates: IcpTemplate[];
  loading: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onCreate: (input: Partial<IcpTemplate> & { name: string }) => Promise<void>;
  onUpdate: (id: string, patch: Partial<IcpTemplate>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) => {
  const [newName, setNewName] = useState("");
  const editing = templates.find((t) => t.id === editingId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <Label className="text-xs">New template name</Label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. HRTech SaaS — GCC" />
          <Button
            size="sm"
            onClick={async () => {
              if (!newName.trim()) return;
              await onCreate({ name: newName.trim() });
              setNewName("");
            }}
            className="w-full text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Create template
          </Button>
        </div>

        {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
        {!loading && templates.length === 0 && (
          <p className="text-xs text-muted-foreground px-1">No templates yet. Create your first one above.</p>
        )}

        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setEditingId(t.id)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                editingId === t.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.tier ? `${t.tier} · ` : ""}{t.industry || "No industry"} · {t.geography || "Any geo"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {!editing ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <Library className="w-10 h-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">Select a template to edit</p>
              <p className="text-xs">Or create a new one to get started.</p>
            </div>
          </div>
        ) : (
          <TemplateEditor
            template={editing}
            onSave={(patch) => onUpdate(editing.id, patch)}
            onRemove={() => onRemove(editing.id)}
          />
        )}
      </div>
    </div>
  );
};

const TemplateEditor = ({
  template, onSave, onRemove,
}: {
  template: IcpTemplate;
  onSave: (patch: Partial<IcpTemplate>) => Promise<void>;
  onRemove: () => Promise<void>;
}) => {
  const [draft, setDraft] = useState<IcpTemplate>(template);

  useEffect(() => setDraft(template), [template]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Label className="text-xs">Template name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="mt-1 text-base font-semibold"
          />
        </div>
        <button
          onClick={async () => {
            if (!confirm(`Delete template "${template.name}"?`)) return;
            await onRemove();
          }}
          className="text-muted-foreground hover:text-destructive transition-colors mt-6"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <Label className="text-xs">Description</Label>
        <Textarea
          value={draft.description ?? ""}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="When to use this template"
          className="mt-1"
        />
      </div>

      <TierAndModeRow
        tier={draft.tier}
        personalization={draft.personalization_level}
        onChange={(p) => setDraft({ ...draft, ...p })}
      />

      <SectionFields draft={draft} setDraft={setDraft} />

      <div className="flex justify-end pt-2">
        <Button onClick={() => onSave(draft)}>
          <Save className="w-4 h-4 mr-2" /> Save template
        </Button>
      </div>
    </div>
  );
};

// ─── PER-COMPANY VIEW ────────────────────────────────────

const CompanyView = ({
  companies, selectedCompany, onSelectCompany, templates, onCompaniesChanged,
}: {
  companies: Company[];
  selectedCompany: string;
  onSelectCompany: (slug: string) => void;
  templates: IcpTemplate[];
  onCompaniesChanged?: () => void;
}) => {
  const company = companies.find((c) => c.slug === selectedCompany);
  const { icps, loading, create, save, remove, createFromTemplate, duplicate } = useCompanyIcps(selectedCompany);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CompanyIcp | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiScore, setAiScore] = useState<{ overall: number; fields: Record<string, number> } | null>(null);

  // Editable company info (logo, domain, name)
  const [companyDraft, setCompanyDraft] = useState<{ name: string; logoUrl: string; customDomain: string }>({
    name: "", logoUrl: "", customDomain: "",
  });
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    if (company) {
      setCompanyDraft({
        name: company.name ?? "",
        logoUrl: company.logoUrl ?? "",
        customDomain: company.customDomain ?? "",
      });
    }
  }, [company?.slug, company?.name, company?.logoUrl, company?.customDomain]);


  // Auto-select first ICP when list loads / company changes
  useEffect(() => {
    if (icps.length === 0) {
      setActiveId(null);
      setDraft(null);
      return;
    }
    if (!activeId || !icps.find((i) => i.id === activeId)) {
      setActiveId(icps[0].id ?? null);
    }
  }, [icps, activeId]);

  // Sync draft with active ICP
  useEffect(() => {
    const active = icps.find((i) => i.id === activeId) ?? null;
    setDraft(active);
  }, [activeId, icps]);

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        Add a company first in the Companies section.
      </div>
    );
  }

  const handleSave = async () => {
    if (!draft) return;
    await save(draft);
    toast({ title: `ICP saved for ${company?.name}` });
  };

  const handleCreateBlank = async () => {
    const created = await create({ name: "New ICP", tier: "Tier 1: Dream ICPs" });
    if (created?.id) setActiveId(created.id);
    toast({ title: "New ICP created" });
  };

  const handleApplyTemplate = async (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    const created = await createFromTemplate(tpl);
    if (created?.id) setActiveId(created.id);
    toast({ title: `Created new ICP from "${tpl.name}"` });
  };

  const handleDuplicate = async (icp: CompanyIcp) => {
    const created = await duplicate(icp);
    if (created?.id) setActiveId(created.id);
    toast({ title: "ICP duplicated" });
  };

  const handleRemove = async (icp: CompanyIcp) => {
    if (!icp.id) return;
    if (!confirm(`Delete ICP "${icp.name ?? "Untitled"}"? This cannot be undone.`)) return;
    await remove(icp.id);
    toast({ title: "ICP deleted" });
  };

  const handleDownloadPdf = async (icp: CompanyIcp) => {
    if (!company || !icp?.id) return;
    setExporting(icp.id);
    try {
      await generateIcpPdf(company, icp);
      toast({ title: "PDF generated", description: `ICP-${company.name}.pdf is downloading.` });
    } catch (e: any) {
      toast({ title: "Could not generate PDF", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const handleSaveCompany = async () => {
    if (!company) return;
    if (!companyDraft.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSavingCompany(true);
    try {
      await updateCompanyInDb(
        {
          ...company,
          name: companyDraft.name.trim(),
          logoUrl: companyDraft.logoUrl.trim(),
          customDomain: companyDraft.customDomain.trim() || null,
        },
        company.slug,
      );
      toast({ title: "Company info saved" });
      onCompaniesChanged?.();
    } catch (e: any) {
      toast({ title: "Could not save company", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setSavingCompany(false);
    }
  };

  const callGenerateIcp = async (compareTo: CompanyIcp | null) => {
    if (!company) return null;
    const domain = (companyDraft.customDomain || company.customDomain || "").trim();
    if (!domain) {
      toast({
        title: "Company domain is required",
        description: "Add the company's website domain above (e.g. acme.com) before generating an ICP. Domain content is what makes the AI accurate.",
        variant: "destructive",
      });
      return null;
    }
    const { data, error } = await supabase.functions.invoke("generate-icp", {
      body: {
        company: {
          name: companyDraft.name || company.name,
          slug: company.slug,
          customDomain: domain,
        },
        hint: aiHint,
        compareTo: compareTo ? { ...compareTo, job_titles: compareTo.job_titles ?? [] } : null,
      },
    });
    if (error) {
      toast({ title: "AI generation failed", description: error.message, variant: "destructive" });
      return null;
    }
    if ((data as any)?.error) {
      toast({ title: "AI generation failed", description: (data as any).error, variant: "destructive" });
      return null;
    }
    return data as { draft: any; score: { overall: number; fields: Record<string, number> } | null; siteFetched?: boolean };
  };

  const handleAiGenerateNew = async () => {
    if (!company) return;
    setAiBusy(true);
    setAiScore(null);
    try {
      const result = await callGenerateIcp(null);
      if (!result) return;
      const created = await create({
        ...result.draft,
        name: result.draft.name || `AI · ${company.name}`,
      });
      if (created?.id) setActiveId(created.id);
      toast({
        title: "AI ICP generated",
        description: result.siteFetched === false
          ? "Note: site couldn't be fetched — review carefully."
          : "Edit any field to refine it.",
      });
    } finally {
      setAiBusy(false);
    }
  };

  const handleAiScoreCurrent = async () => {
    if (!draft) return;
    setAiBusy(true);
    setAiScore(null);
    try {
      const result = await callGenerateIcp(draft);
      if (!result) return;
      setAiScore(result.score);
      toast({
        title: `Match score: ${result.score?.overall ?? 0}%`,
        description: "Compares your saved ICP to a fresh AI draft.",
      });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</Label>
        </div>
        <Select value={selectedCompany} onValueChange={onSelectCompany}>
          <SelectTrigger className="w-[260px] bg-background"><SelectValue placeholder="Pick a company" /></SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCreateBlank} className="gap-2">
            <Plus className="w-3.5 h-3.5" /> New blank ICP
          </Button>
          <Select onValueChange={handleApplyTemplate}>
            <SelectTrigger className="w-[240px] bg-background">
              <SelectValue placeholder="New ICP from template…" />
            </SelectTrigger>
            <SelectContent>
              {templates.length === 0 && (
                <div className="text-xs text-muted-foreground px-2 py-1.5">No templates yet</div>
              )}
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5" />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Generator */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">AI ICP Generator</h3>
            <p className="text-xs text-muted-foreground">
              Drafts a complete ICP for <strong>{company?.name}</strong>. Fully editable after generation. You can also score how closely your saved ICP matches a fresh AI draft.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
          <Input
            value={aiHint}
            onChange={(e) => setAiHint(e.target.value)}
            placeholder="Optional: extra context (e.g. 'they sell HR software to SMBs in GCC')"
            className="bg-background"
          />
          <Button onClick={handleAiGenerateNew} disabled={aiBusy || !company} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {aiBusy ? "Generating…" : "Generate new ICP"}
          </Button>
          <Button
            onClick={handleAiScoreCurrent}
            disabled={aiBusy || !draft}
            variant="outline"
            className="gap-2"
            title="Generate a fresh AI ICP and compare it to the currently selected ICP"
          >
            <Gauge className="w-4 h-4" />
            Score current ICP
          </Button>
        </div>

        {aiScore && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${
                  aiScore.overall >= 70
                    ? "bg-emerald-500/15 text-emerald-600"
                    : aiScore.overall >= 40
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {aiScore.overall}%
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Match score vs AI draft</p>
                <p className="text-xs text-muted-foreground">
                  How closely your saved ICP overlaps with what AI would suggest for {company?.name}.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(aiScore.fields).map(([k, v]) => (
                <div key={k} className="rounded-md border border-border bg-muted/30 px-2.5 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{k.replace(/_/g, " ")}</p>
                  <p
                    className={`text-sm font-semibold ${
                      v >= 70 ? "text-emerald-600" : v >= 40 ? "text-amber-600" : "text-destructive"
                    }`}
                  >
                    {v}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Saved ICPs list */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Saved ICPs for {company?.name} <span className="text-muted-foreground font-normal">({icps.length})</span>
          </h3>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground px-1">Loading…</p>
        ) : icps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No ICPs saved yet for this company.</p>
            <p className="text-xs mt-1">Create one from scratch or apply a template above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {icps.map((icp) => {
              const isActive = activeId === icp.id;
              return (
                <div
                  key={icp.id}
                  className={`rounded-xl border p-3 transition-all ${
                    isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <button onClick={() => setActiveId(icp.id ?? null)} className="text-left w-full">
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {icp.name || "Untitled ICP"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {icp.tier ? `${icp.tier} · ` : ""}{icp.industry || "No industry"} · {icp.geography || "Any geo"}
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleDownloadPdf(icp)}
                      disabled={exporting === icp.id}
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                      title="Download PDF"
                    >
                      <FileDown className="w-3 h-3" />
                      {exporting === icp.id ? "…" : "PDF"}
                    </button>
                    <button
                      onClick={() => handleDuplicate(icp)}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button
                      onClick={() => handleRemove(icp)}
                      className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 px-1.5 py-0.5 rounded ml-auto"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor for active ICP */}
      {draft ? (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">Editing: {draft.name || "Untitled ICP"}</h3>
            {draft.template_id && (
              <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
                <Copy className="w-2.5 h-2.5 inline mr-1" />
                From template
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground -mt-3">
            Each ICP is independent — edits only affect this one. You can keep multiple tiers/versions for <strong>{company?.name}</strong>.
          </p>

          <div>
            <Label className="text-xs">ICP Name</Label>
            <Input
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Tier 1 — HRTech CEOs in GCC"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Short summary of who this ICP is and why."
              className="mt-1"
            />
          </div>

          <TierAndModeRow
            tier={draft.tier}
            personalization={draft.personalization_level}
            onChange={(p) => setDraft({ ...draft, ...p })}
          />

          <SectionFields draft={draft} setDraft={setDraft} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleDownloadPdf(draft)} disabled={exporting === draft.id} className="gap-2">
              <FileDown className="w-4 h-4" />
              {exporting === draft.id ? "Generating…" : "Download branded PDF"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save ICP
            </Button>
          </div>
        </div>
      ) : (
        !loading && icps.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Select an ICP above to edit it.</p>
        )
      )}
    </div>
  );
};

export default IcpTemplatesPanel;
