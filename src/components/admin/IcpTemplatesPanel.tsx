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
  BookOpen, ExternalLink, Search, Database, Mail, Globe,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateIcpPdf } from "@/lib/icpPdf";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  companies: Company[];
  isOps?: boolean;
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

const IcpTemplatesPanel = ({ companies, isOps = false }: Props) => {
  const { templates, loading, create, update, remove } = useIcpTemplates();
  const [view, setView] = useState<"library" | "company" | "sources">("library");
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
        {isOps && (
          <button
            onClick={() => setView("sources")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "sources" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Recommended Sources
          </button>
        )}
      </div>

      {view === "sources" && isOps ? (
        <RecommendedSourcesView />
      ) : view === "library" ? (
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

// ─── Recommended Sources (OPS-only) ────────────────────────

const SOURCE_CATEGORIES = [
  {
    icon: Search,
    title: "Where to find target companies",
    color: "text-blue-600",
    bg: "bg-blue-50",
    sources: [
      { name: "Apollo.io", url: "https://apollo.io", desc: "Filter by industry, size, tech stack, geography. Best for GCC + MENA lists." },
      { name: "LinkedIn Sales Navigator", url: "https://linkedin.com/sales", desc: "Build company + people lists. Use boolean search for titles and regions." },
      { name: "Crunchbase", url: "https://crunchbase.com", desc: "Find funded companies, track funding rounds as buying triggers." },
      { name: "G2 Crowd", url: "https://g2.com", desc: "If client sells software — find companies using competitor tools (tech stack filter)." },
      { name: "Clutch.co", url: "https://clutch.co", desc: "B2B agencies and service firms. Good for finding IT/software companies in MENA." },
    ],
  },
  {
    icon: Database,
    title: "Where to enrich & validate contact data",
    color: "text-purple-600",
    bg: "bg-purple-50",
    sources: [
      { name: "Apollo Enrichment", url: "https://apollo.io", desc: "Enrich a list of domains to get emails, titles, LinkedIn URLs, phone numbers." },
      { name: "Hunter.io", url: "https://hunter.io", desc: "Find and verify emails by domain. Great for quick email pattern discovery." },
      { name: "Clearbit / Breeze", url: "https://clearbit.com", desc: "Enrich leads with firmographic data (revenue, size, tech stack) via API." },
      { name: "LinkedIn (manual)", url: "https://linkedin.com", desc: "Verify titles, tenure, and seniority. Cross-check job titles before reaching out." },
      { name: "ZoomInfo", url: "https://zoominfo.com", desc: "Enterprise-grade contact database. Most complete for US — limited for GCC." },
    ],
  },
  {
    icon: Globe,
    title: "How to scrape company context for ICP",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    sources: [
      { name: "Client's website /about & /services", url: "", desc: "Copy their About page and Services page into the AI context box. This is the most reliable input." },
      { name: "LinkedIn Company Page", url: "https://linkedin.com", desc: "Copy the 'About' section from their LinkedIn page — usually very concise and accurate." },
      { name: "G2 Profile page", url: "https://g2.com", desc: "If they sell software, their G2 page shows who reviews them — real buyer titles and industries." },
      { name: "Crunchbase profile", url: "https://crunchbase.com", desc: "Copy their description + 'Industries' tags. Good for geography and company stage." },
      { name: "Pitchbook / Tracxn", url: "https://tracxn.com", desc: "For MENA/GCC startups — find their investors, stage, and market description." },
    ],
  },
  {
    icon: Mail,
    title: "Industry-specific tips",
    color: "text-orange-600",
    bg: "bg-orange-50",
    sources: [
      { name: "HubSpot ecosystem clients", url: "https://ecosystem.hubspot.com", desc: "HubSpot Partner Directory → find companies using HubSpot. Filter by region." },
      { name: "Salesforce AppExchange", url: "https://appexchange.salesforce.com", desc: "Find companies in the Salesforce ecosystem. Good for RevOps / CRM buyers." },
      { name: "SaaStr / Product Hunt", url: "https://producthunt.com", desc: "For SaaS companies — find buyers who are early adopters of new tools." },
      { name: "GITEX / Step Conference", url: "https://gitex.com", desc: "MENA tech conference attendee lists — great source for GCC B2B prospects." },
      { name: "Bayt / LinkedIn Jobs (GCC)", url: "https://bayt.com", desc: "Check hiring activity in GCC. If they're hiring SDRs or RevOps — strong buying signal." },
    ],
  },
];

const RecommendedSourcesView = () => (
  <div className="space-y-5">
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
      <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800">OPS-only reference guide</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Use this to advise clients on where to find and enrich their ICP targets. When generating an AI ICP, copy relevant context from these sources into the "Company Context" box.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {SOURCE_CATEGORIES.map((cat) => (
        <div key={cat.title} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
              <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
          </div>
          <div className="space-y-2">
            {cat.sources.map((s) => (
              <div key={s.name} className="flex items-start gap-2.5 rounded-lg bg-muted/40 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {s.name} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">{s.name}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

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

  const domainOk = !!(companyDraft.customDomain || company?.customDomain);

  return (
    <div className="space-y-6">
      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-card">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative px-5 md:px-7 py-5 md:py-6 flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="shrink-0 h-14 w-14 rounded-2xl bg-card ring-1 ring-border shadow-sm flex items-center justify-center overflow-hidden">
              {companyDraft.logoUrl ? (
                <img
                  src={companyDraft.logoUrl}
                  alt={companyDraft.name}
                  className="h-full w-full object-contain p-1.5"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
                ICP Workspace
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                {company?.name ?? "Select a company"}
              </h2>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ${
                    domainOk
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 ring-amber-500/20"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${domainOk ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {domainOk ? "Domain set" : "Domain required"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Target className="w-3 h-3" />
                  {icps.length} ICP{icps.length === 1 ? "" : "s"} saved
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
            <Select value={selectedCompany} onValueChange={onSelectCompany}>
              <SelectTrigger className="w-full sm:w-[220px] bg-background h-10">
                <SelectValue placeholder="Switch company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCreateBlank} className="gap-1.5 h-10 flex-1">
                <Plus className="w-3.5 h-3.5" /> Blank
              </Button>
              <Select onValueChange={handleApplyTemplate}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background h-10">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Wand2 className="w-3.5 h-3.5" />
                    From template
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 && (
                    <div className="text-xs text-muted-foreground px-2 py-1.5">No templates yet</div>
                  )}
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column body: Sidebar (saved ICPs) + Main ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar — Saved ICPs */}
        <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Saved ICPs
            </h3>
            <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">{icps.length}</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : icps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-5 text-center">
              <Target className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">No ICPs yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Create one or generate with AI →</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {icps.map((icp) => {
                const isActive = activeId === icp.id;
                return (
                  <div
                    key={icp.id}
                    className={`group rounded-xl border transition-all ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <button
                      onClick={() => setActiveId(icp.id ?? null)}
                      className="w-full text-left p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 h-6 w-6 shrink-0 rounded-md flex items-center justify-center ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <Target className="w-3 h-3" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {icp.name || "Untitled ICP"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {icp.industry || "Any industry"} · {icp.geography || "Any geo"}
                          </p>
                          {icp.tier && (
                            <span className="inline-block mt-1.5 text-[9px] font-semibold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                              {icp.tier.replace(/Tier \d: /, "")}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5 px-2 pb-2 -mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownloadPdf(icp)}
                        disabled={exporting === icp.id}
                        className="text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-primary/10"
                        title="Download PDF"
                      >
                        <FileDown className="w-3 h-3" />
                        {exporting === icp.id ? "…" : "PDF"}
                      </button>
                      <button
                        onClick={() => handleDuplicate(icp)}
                        className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button
                        onClick={() => handleRemove(icp)}
                        className="text-[10px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-destructive/10 ml-auto"
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
        </aside>

        {/* Main column */}
        <div className="space-y-5 min-w-0">
          {/* Company info card */}
          {company && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 bg-muted/30 border-b border-border">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Company info</h3>
                <span className="text-[10px] text-muted-foreground ml-auto">Used to ground AI</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Company name</Label>
                    <Input
                      value={companyDraft.name}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, name: e.target.value })}
                      className="mt-1.5 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Logo URL</Label>
                    <Input
                      value={companyDraft.logoUrl}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, logoUrl: e.target.value })}
                      placeholder="https://…/logo.png"
                      className="mt-1.5 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                      Website / Domain <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={companyDraft.customDomain}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, customDomain: e.target.value })}
                      placeholder="acme.com"
                      className="mt-1.5 h-9"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSaveCompany} disabled={savingCompany} className="gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    {savingCompany ? "Saving…" : "Save company info"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI Generator — premium card */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
            <div className="relative p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground">AI ICP Generator</h3>
                    <span className="text-[10px] font-semibold bg-accent text-accent-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Domain-grounded
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Drafts a complete ICP for <strong className="text-foreground">{company?.name}</strong>, fully editable. Score the current ICP to see how it compares to a fresh AI draft.
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Company Context <span className="text-destructive">*</span>
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                  Paste the LinkedIn About, website description, or write what they sell, who they sell to, and which regions.
                </p>
                <Textarea
                  value={aiHint}
                  onChange={(e) => setAiHint(e.target.value)}
                  placeholder={`Example:\n"Ops Solutions provides B2B sales training and GTM consulting to growth-stage companies in the GCC region (Saudi Arabia, UAE, Kuwait, Qatar). Buyers are VP Sales, Revenue Operations leads, and Founders at companies with 20–300 employees."`}
                  className="bg-background min-h-[110px] text-sm resize-none"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleAiGenerateNew} disabled={aiBusy || !company} className="gap-2 shadow-sm">
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
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
                          stroke={aiScore.overall >= 70 ? "hsl(142 71% 45%)" : aiScore.overall >= 40 ? "hsl(38 92% 50%)" : "hsl(var(--destructive))"}
                          strokeDasharray={`${(aiScore.overall / 100) * 100.5} 100.5`}
                        />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                        aiScore.overall >= 70 ? "text-emerald-600" : aiScore.overall >= 40 ? "text-amber-600" : "text-destructive"
                      }`}>
                        {aiScore.overall}%
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Match score vs AI draft</p>
                      <p className="text-xs text-muted-foreground">
                        How closely your saved ICP overlaps with what AI suggests for {company?.name}.
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
          </div>

          {/* Editor for active ICP */}
          {draft ? (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 bg-muted/30 border-b border-border">
                <Target className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground truncate flex-1">
                  Editing: <span className="text-primary">{draft.name || "Untitled ICP"}</span>
                </h3>
                {draft.template_id && (
                  <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Copy className="w-2.5 h-2.5" />
                    From template
                  </span>
                )}
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <p className="text-xs text-muted-foreground -mt-1">
                  Each ICP is independent — edits only affect this one. You can keep multiple tiers/versions for <strong>{company?.name}</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">ICP Name</Label>
                    <Input
                      value={draft.name ?? ""}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="e.g. Tier 1 — HRTech CEOs in GCC"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</Label>
                    <Input
                      value={draft.description ?? ""}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="Short summary of who this ICP is and why."
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <TierAndModeRow
                  tier={draft.tier}
                  personalization={draft.personalization_level}
                  onChange={(p) => setDraft({ ...draft, ...p })}
                />

                <SectionFields draft={draft} setDraft={setDraft} />
              </div>

              {/* Sticky save bar */}
              <div className="sticky bottom-0 flex items-center justify-end gap-2 px-5 py-3 bg-card/95 backdrop-blur-sm border-t border-border">
                <Button variant="outline" onClick={() => handleDownloadPdf(draft)} disabled={exporting === draft.id} className="gap-2">
                  <FileDown className="w-4 h-4" />
                  {exporting === draft.id ? "Generating…" : "Branded PDF"}
                </Button>
                <Button onClick={handleSave} className="gap-2 shadow-sm">
                  <Save className="w-4 h-4" /> Save ICP
                </Button>
              </div>
            </div>
          ) : (
            !loading && icps.length > 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <Target className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select an ICP from the left to edit it.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default IcpTemplatesPanel;
