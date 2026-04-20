import { useState } from "react";
import { useTrainingModules, useCompanyAssignments, TrainingModule } from "@/hooks/useTrainingModules";
import { Company } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GraduationCap, Building2, Library, Save, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
}

const TrainingsPanel = ({ companies }: Props) => {
  const { modules, loading, create, update, remove } = useTrainingModules();
  const [view, setView] = useState<"library" | "company">("library");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>(companies[0]?.slug ?? "");
  const [newTitle, setNewTitle] = useState("");

  const editing = modules.find((m) => m.id === selectedModule);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl p-1 w-fit">
        <button
          onClick={() => setView("library")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Library className="w-4 h-4" /> Module Library
        </button>
        <button
          onClick={() => setView("company")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "company" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-4 h-4" /> Per-Company Assignments
        </button>
      </div>

      {view === "library" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <Label className="text-xs">New module title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Lead Routing 101" />
              <Button
                size="sm"
                onClick={async () => {
                  if (!newTitle.trim()) return;
                  await create({ title: newTitle.trim() });
                  setNewTitle("");
                  toast({ title: "Module created" });
                }}
                className="w-full text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Create module
              </Button>
            </div>

            {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!loading && modules.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">No modules yet. Create one above.</p>
            )}

            <div className="space-y-2">
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModule(m.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    selectedModule === m.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.category || "Uncategorized"}</p>
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
                <p className="text-sm font-medium">Select a module to edit</p>
              </div>
            ) : (
              <ModuleEditor
                module={editing}
                onSave={async (patch) => { await update(editing.id, patch); toast({ title: "Saved" }); }}
                onRemove={async () => {
                  if (!confirm(`Delete module "${editing.title}"?`)) return;
                  await remove(editing.id);
                  setSelectedModule(null);
                  toast({ title: "Module deleted" });
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <CompanyAssignmentsView
          companies={companies}
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          modules={modules}
        />
      )}
    </div>
  );
};

const ModuleEditor = ({
  module,
  onSave,
  onRemove,
}: {
  module: TrainingModule;
  onSave: (patch: Partial<TrainingModule>) => Promise<void>;
  onRemove: () => Promise<void>;
}) => {
  const [draft, setDraft] = useState(module);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Label className="text-xs">Title</Label>
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 text-base font-semibold" />
        </div>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive mt-6">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div>
        <Label className="text-xs">Category</Label>
        <Input value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="e.g. CRM Basics" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What this module teaches" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Default video URL</Label>
        <Input value={draft.default_video_url ?? ""} onChange={(e) => setDraft({ ...draft, default_video_url: e.target.value })} placeholder="https://youtube.com/…" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Default notes</Label>
        <Textarea value={draft.default_notes ?? ""} onChange={(e) => setDraft({ ...draft, default_notes: e.target.value })} placeholder="Default content companies inherit" className="mt-1 min-h-[120px]" />
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={() => onSave(draft)}>
          <Save className="w-4 h-4 mr-2" /> Save module
        </Button>
      </div>
    </div>
  );
};

const CompanyAssignmentsView = ({
  companies,
  selectedCompany,
  onSelectCompany,
  modules,
}: {
  companies: Company[];
  selectedCompany: string;
  onSelectCompany: (slug: string) => void;
  modules: TrainingModule[];
}) => {
  const { assignments, assign, updateAssignment, unassign } = useCompanyAssignments(selectedCompany);
  const company = companies.find((c) => c.slug === selectedCompany);

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        Add a company first.
      </div>
    );
  }

  const unassigned = modules.filter((m) => !assignments.some((a) => a.module_id === m.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border rounded-xl p-4">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedCompany} onValueChange={onSelectCompany}>
          <SelectTrigger className="w-[260px] bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            {companies.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {unassigned.length > 0 && (
          <Select onValueChange={(id) => assign(id).then(() => toast({ title: "Module assigned" }))}>
            <SelectTrigger className="w-[260px] bg-background ml-auto">
              <SelectValue placeholder="+ Assign module from library…" />
            </SelectTrigger>
            <SelectContent>
              {unassigned.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2"><Wand2 className="w-3.5 h-3.5" />{m.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm">No modules assigned to {company?.name} yet.</p>
            <p className="text-xs">Use the dropdown above to assign one.</p>
          </div>
        ) : (
          assignments.map((a) => {
            const mod = modules.find((m) => m.id === a.module_id);
            if (!mod) return null;
            return (
              <AssignmentCard
                key={a.id}
                assignment={a}
                module={mod}
                companyName={company?.name ?? ""}
                onUpdate={async (patch) => { await updateAssignment(a.id, patch); toast({ title: "Saved" }); }}
                onRemove={async () => {
                  if (!confirm(`Unassign "${mod.title}" from ${company?.name}?`)) return;
                  await unassign(a.id);
                  toast({ title: "Unassigned" });
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

const AssignmentCard = ({
  assignment,
  module,
  companyName,
  onUpdate,
  onRemove,
}: {
  assignment: any;
  module: TrainingModule;
  companyName: string;
  onUpdate: (patch: any) => Promise<void>;
  onRemove: () => Promise<void>;
}) => {
  const [draft, setDraft] = useState(assignment);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{draft.custom_title || module.title}</p>
          <p className="text-xs text-muted-foreground">From library · {module.category || "Uncategorized"}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs">
            <Switch
              checked={draft.is_visible}
              onCheckedChange={(v) => { setDraft({ ...draft, is_visible: v }); onUpdate({ is_visible: v }); }}
            />
            <span className="text-foreground">Visible</span>
          </label>
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Custom title (optional)</Label>
          <Input value={draft.custom_title ?? ""} onChange={(e) => setDraft({ ...draft, custom_title: e.target.value })} placeholder={module.title} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Custom video URL (optional)</Label>
          <Input value={draft.custom_video_url ?? ""} onChange={(e) => setDraft({ ...draft, custom_video_url: e.target.value })} placeholder={module.default_video_url ?? "https://…"} className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Custom description (optional)</Label>
          <Textarea value={draft.custom_description ?? ""} onChange={(e) => setDraft({ ...draft, custom_description: e.target.value })} placeholder={module.description ?? ""} className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Custom notes for {companyName}</Label>
          <Textarea value={draft.custom_notes ?? ""} onChange={(e) => setDraft({ ...draft, custom_notes: e.target.value })} placeholder={module.default_notes ?? "Company-specific instructions…"} className="mt-1 min-h-[100px]" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => onUpdate({
          custom_title: draft.custom_title,
          custom_video_url: draft.custom_video_url,
          custom_description: draft.custom_description,
          custom_notes: draft.custom_notes,
        })}>
          <Save className="w-3.5 h-3.5 mr-1" /> Save overrides
        </Button>
      </div>
    </div>
  );
};

export default TrainingsPanel;
