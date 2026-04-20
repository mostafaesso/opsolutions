import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Building2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
}

interface Update {
  id: string;
  company_slug: string;
  title: string;
  content: string;
  visibility: string;
  created_at: string;
  created_by: string;
}

const CrmUpdatesPanel = ({ companies }: Props) => {
  const [selected, setSelected] = useState<string>(companies[0]?.slug ?? "");
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"all" | "managers" | "admins">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!selected && companies[0]) setSelected(companies[0].slug);
  }, [companies, selected]);

  const refresh = async () => {
    if (!selected) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("updates")
      .select("*")
      .eq("company_slug", selected)
      .order("created_at", { ascending: false });
    setUpdates((data as Update[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const company = companies.find((c) => c.slug === selected);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !selected) return;
    await (supabase as any).from("updates").insert({
      company_slug: selected,
      title: title.trim(),
      content: content.trim(),
      visibility,
      created_by: "admin@opsolutions",
    });
    setTitle(""); setContent(""); setVisibility("all");
    toast({ title: `Update posted to ${company?.name}` });
    refresh();
  };

  const handleUpdate = async (id: string, patch: Partial<Update>) => {
    await (supabase as any)
      .from("updates")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    toast({ title: "Update saved" });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    await (supabase as any).from("updates").delete().eq("id", id);
    toast({ title: "Update deleted" });
    refresh();
  };

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        Add a company first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border rounded-xl p-4">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[260px] bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            {companies.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground">
          Updates posted here are scoped to <strong>{company?.name}</strong>.
        </span>
      </div>

      {/* Composer */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Post an update for {company?.name}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Update title" />
          <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="managers">Managers only</SelectItem>
              <SelectItem value="admins">Admins only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's new?" className="min-h-[120px]" />
        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Post update
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Updates ({updates.length})</h3>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : updates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm">No updates for {company?.name} yet.</p>
          </div>
        ) : (
          updates.map((u) => (
            <UpdateCard
              key={u.id}
              update={u}
              isEditing={editingId === u.id}
              onStartEdit={() => setEditingId(u.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={(patch) => handleUpdate(u.id, patch).then(() => setEditingId(null))}
              onDelete={() => handleDelete(u.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const UpdateCard = ({
  update,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  update: Update;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: Partial<Update>) => Promise<void>;
  onDelete: () => Promise<void>;
}) => {
  const [draft, setDraft] = useState(update);
  useEffect(() => setDraft(update), [update]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="font-semibold" />
          ) : (
            <p className="text-base font-semibold text-foreground">{update.title}</p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            {new Date(update.created_at).toLocaleString()} · {update.visibility}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isEditing && (
            <Button size="sm" variant="ghost" onClick={onStartEdit} className="text-xs">Edit</Button>
          )}
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <>
          <Textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} className="min-h-[100px]" />
          <Select value={draft.visibility} onValueChange={(v) => setDraft({ ...draft, visibility: v })}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="managers">Managers only</SelectItem>
              <SelectItem value="admins">Admins only</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
            <Button size="sm" onClick={() => onSave({ title: draft.title, content: draft.content, visibility: draft.visibility })}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{update.content}</p>
      )}
    </div>
  );
};

export default CrmUpdatesPanel;
