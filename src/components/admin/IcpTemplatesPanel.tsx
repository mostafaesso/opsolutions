import { useEffect, useState } from "react";
import { useIcpTemplates, useCompanyIcp, IcpTemplate } from "@/hooks/useIcpTemplates";
import { Company } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Target, Library, Building2, Save, Wand2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
}

const FIELDS: { key: keyof IcpTemplate; label: string; placeholder: string; multi?: boolean }[] = [
  { key: "industry", label: "Industry / Vertical", placeholder: "e.g. B2B SaaS, Manufacturing, Real Estate" },
  { key: "company_size", label: "Company Size", placeholder: "e.g. 50–500 employees, $5M–$50M ARR" },
  { key: "geography", label: "Geography", placeholder: "e.g. GCC, EU, North America" },
  { key: "budget_range", label: "Budget Range", placeholder: "e.g. $20k–$100k annual contract" },
  { key: "goals", label: "Their Goals", placeholder: "What outcomes they want", multi: true },
  { key: "pain_points", label: "Pain Points", placeholder: "Problems they need solved", multi: true },
  { key: "buying_triggers", label: "Buying Triggers", placeholder: "Events that signal readiness", multi: true },
  { key: "decision_process", label: "Decision Process", placeholder: "How they buy — stakeholders, timeline, criteria", multi: true },
  { key: "disqualifiers", label: "Disqualifiers", placeholder: "Red flags that disqualify a prospect", multi: true },
  { key: "notes", label: "Notes", placeholder: "Anything else worth capturing", multi: true },
];

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
      {/* View switch */}
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

// ─── LIBRARY ─────────────────────────────────────────────

const LibraryView = ({
  templates,
  loading,
  editingId,
  setEditingId,
  onCreate,
  onUpdate,
  onRemove,
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
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Mid-market SaaS RevOps"
          />
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
                    {t.industry || "No industry"} · {t.geography || "Any geo"}
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
  template,
  onSave,
  onRemove,
}: {
  template: IcpTemplate;
  onSave: (patch: Partial<IcpTemplate>) => Promise<void>;
  onRemove: () => Promise<void>;
}) => {
  const [draft, setDraft] = useState<IcpTemplate>(template);
  const [titlesText, setTitlesText] = useState((template.job_titles ?? []).join(", "));

  useEffect(() => {
    setDraft(template);
    setTitlesText((template.job_titles ?? []).join(", "));
  }, [template]);

  const handleSave = async () => {
    const titles = titlesText.split(",").map((s) => s.trim()).filter(Boolean);
    await onSave({ ...draft, job_titles: titles });
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={String(f.key)} className={f.multi ? "md:col-span-2" : ""}>
            <Label className="text-xs">{f.label}</Label>
            {f.multi ? (
              <Textarea
                value={(draft as any)[f.key] ?? ""}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as any)}
                placeholder={f.placeholder}
                className="mt-1 min-h-[80px]"
              />
            ) : (
              <Input
                value={(draft as any)[f.key] ?? ""}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as any)}
                placeholder={f.placeholder}
                className="mt-1"
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <Label className="text-xs">Job titles targeted (comma-separated)</Label>
          <Input
            value={titlesText}
            onChange={(e) => setTitlesText(e.target.value)}
            placeholder="CRO, Head of Sales, RevOps Lead"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save template
        </Button>
      </div>
    </div>
  );
};

// ─── PER-COMPANY VIEW ────────────────────────────────────

const CompanyView = ({
  companies,
  selectedCompany,
  onSelectCompany,
  templates,
}: {
  companies: Company[];
  selectedCompany: string;
  onSelectCompany: (slug: string) => void;
  templates: IcpTemplate[];
}) => {
  const company = companies.find((c) => c.slug === selectedCompany);
  const { icp, loading, save, applyTemplate } = useCompanyIcp(selectedCompany);
  const [draft, setDraft] = useState(icp);
  const [titlesText, setTitlesText] = useState("");

  useEffect(() => {
    setDraft(icp);
    setTitlesText((icp?.job_titles ?? []).join(", "));
  }, [icp]);

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        Add a company first in the Companies section.
      </div>
    );
  }

  const handleSave = async () => {
    if (!draft) return;
    const titles = titlesText.split(",").map((s) => s.trim()).filter(Boolean);
    await save({ ...draft, job_titles: titles });
    toast({ title: `ICP saved for ${company?.name}` });
  };

  const handleApplyTemplate = async (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    if (!confirm(`Apply template "${tpl.name}" to ${company?.name}? Existing values will be replaced (you can still edit afterwards).`)) return;
    await applyTemplate(tpl);
    toast({ title: `Applied "${tpl.name}" to ${company?.name}` });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</Label>
        </div>
        <Select value={selectedCompany} onValueChange={onSelectCompany}>
          <SelectTrigger className="w-[260px] bg-background">
            <SelectValue placeholder="Pick a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
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
        </div>
      </div>

      {loading || !draft ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              ICP for {company?.name}
            </h3>
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
              placeholder="e.g. Primary ICP"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={String(f.key)} className={f.multi ? "md:col-span-2" : ""}>
                <Label className="text-xs">{f.label}</Label>
                {f.multi ? (
                  <Textarea
                    value={(draft as any)[f.key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as any)}
                    placeholder={f.placeholder}
                    className="mt-1 min-h-[80px]"
                  />
                ) : (
                  <Input
                    value={(draft as any)[f.key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as any)}
                    placeholder={f.placeholder}
                    className="mt-1"
                  />
                )}
              </div>
            ))}

            <div className="md:col-span-2">
              <Label className="text-xs">Job titles targeted (comma-separated)</Label>
              <Input
                value={titlesText}
                onChange={(e) => setTitlesText(e.target.value)}
                placeholder="CRO, Head of Sales, RevOps Lead"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
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
