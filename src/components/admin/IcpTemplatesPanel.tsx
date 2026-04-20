import { useEffect, useState } from "react";
import { useIcpTemplates, useCompanyIcps, IcpTemplate, CompanyIcp } from "@/hooks/useIcpTemplates";
import { Company } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, Target, Library, Building2, Save, Wand2, Copy,
  Building, Users, Flame, ShieldAlert, CheckCircle2, FileDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateIcpPdf } from "@/lib/icpPdf";

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
  companies, selectedCompany, onSelectCompany, templates,
}: {
  companies: Company[];
  selectedCompany: string;
  onSelectCompany: (slug: string) => void;
  templates: IcpTemplate[];
}) => {
  const company = companies.find((c) => c.slug === selectedCompany);
  const { icp, loading, save, applyTemplate } = useCompanyIcp(selectedCompany);
  const [draft, setDraft] = useState(icp);
  const [exporting, setExporting] = useState(false);

  useEffect(() => setDraft(icp), [icp]);

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

  const handleApplyTemplate = async (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    if (!confirm(`Apply template "${tpl.name}" to ${company?.name}? Existing values will be replaced (you can still edit afterwards).`)) return;
    await applyTemplate(tpl);
    toast({ title: `Applied "${tpl.name}" to ${company?.name}` });
  };

  const handleDownloadPdf = async () => {
    if (!company || !draft) return;
    setExporting(true);
    try {
      await generateIcpPdf(company, draft);
      toast({ title: "PDF generated", description: `ICP-${company.name}.pdf is downloading.` });
    } catch (e: any) {
      toast({ title: "Could not generate PDF", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
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
          <Label className="text-xs text-muted-foreground">Apply template:</Label>
          <Select onValueChange={handleApplyTemplate}>
            <SelectTrigger className="w-[240px] bg-background">
              <SelectValue placeholder="Start from a template…" />
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

          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={exporting || !draft}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            {exporting ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {loading || !draft ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">ICP for {company?.name}</h3>
            {draft.template_id && (
              <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
                <Copy className="w-2.5 h-2.5 inline mr-1" />
                From template
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground -mt-3">
            Edit freely — changes only affect <strong>{company?.name}</strong> and never modify the master template or other companies.
          </p>

          <div>
            <Label className="text-xs">ICP Name</Label>
            <Input
              value={draft.name ?? ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Primary ICP — HRTech CEOs in GCC"
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
            <Button variant="outline" onClick={handleDownloadPdf} disabled={exporting} className="gap-2">
              <FileDown className="w-4 h-4" />
              {exporting ? "Generating…" : "Download branded PDF"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save for {company?.name}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IcpTemplatesPanel;
