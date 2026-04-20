import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Plus, Trash2, Video, FileText, Bell, Layers } from "lucide-react";
import { Company, updateCompanyInDb } from "@/lib/companies";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useCompanyVideos } from "@/hooks/useCompanyVideos";
import { toast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
  onCompaniesChanged: () => void;
}

const ModulesTable = ({ companies, onCompaniesChanged }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_120px_120px_120px_60px] items-center bg-muted/40 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Company</div>
        <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Doc</div>
        <div className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" />Video</div>
        <div className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" />CRM</div>
        <div className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />GTM</div>
        <div className="text-right">Videos</div>
      </div>

      {companies.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          No companies yet. Add one in the Companies section.
        </div>
      )}

      {companies.map((c) => (
        <ModuleRow
          key={c.slug}
          company={c}
          expanded={expanded === c.slug}
          onToggleExpand={() => setExpanded(expanded === c.slug ? null : c.slug)}
          onCompanyUpdated={onCompaniesChanged}
        />
      ))}
    </div>
  );
};

const ModuleRow = ({
  company,
  expanded,
  onToggleExpand,
  onCompanyUpdated,
}: {
  company: Company;
  expanded: boolean;
  onToggleExpand: () => void;
  onCompanyUpdated: () => void;
}) => {
  const { settings, update } = useCompanySettings(company.slug);
  const { videos } = useCompanyVideos(company.slug);

  const setGtm = async (v: boolean) => {
    await updateCompanyInDb({ ...company, gtmEnabled: v });
    toast({ title: v ? `GTM assigned to ${company.name}` : `GTM removed from ${company.name}` });
    onCompanyUpdated();
  };

  return (
    <div className="border-b border-border last:border-0">
      <div className="grid grid-cols-[1fr_120px_120px_120px_120px_60px] items-center px-5 py-4 hover:bg-muted/20 transition-colors">
        {/* Company */}
        <button onClick={onToggleExpand} className="flex items-center gap-3 text-left min-w-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <img src={company.logoUrl} alt={company.name} className="h-8 w-8 object-contain rounded shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{company.name}</p>
            <p className="text-xs text-muted-foreground truncate">/{company.slug}</p>
          </div>
        </button>

        {/* Toggles */}
        <div>
          <Switch
            checked={settings.training_doc_enabled}
            onCheckedChange={(v) => update({ training_doc_enabled: v })}
          />
        </div>
        <div>
          <Switch
            checked={settings.training_video_enabled}
            onCheckedChange={(v) => update({ training_video_enabled: v })}
          />
        </div>
        <div>
          <Switch
            checked={settings.crm_updates_employee_visible}
            onCheckedChange={(v) => update({ crm_updates_employee_visible: v })}
          />
        </div>
        <div>
          <Switch checked={!!company.gtmEnabled} onCheckedChange={setGtm} />
        </div>

        {/* Video count */}
        <div className="text-right">
          <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-muted text-xs font-medium text-foreground">
            {videos.length}
          </span>
        </div>
      </div>

      {expanded && <VideosManager companySlug={company.slug} />}
    </div>
  );
};

const VideosManager = ({ companySlug }: { companySlug: string }) => {
  const { videos, add, remove } = useCompanyVideos(companySlug);
  const [vTitle, setVTitle] = useState("");
  const [vUrl, setVUrl] = useState("");
  const [vDesc, setVDesc] = useState("");

  const handleAdd = async () => {
    if (!vTitle.trim() || !vUrl.trim()) return;
    await add({ title: vTitle.trim(), url: vUrl.trim(), description: vDesc.trim() || undefined });
    setVTitle("");
    setVUrl("");
    setVDesc("");
    toast({ title: "Video added" });
  };

  return (
    <div className="bg-muted/30 border-t border-border px-5 py-5 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">Training Videos ({videos.length})</h4>
      </div>

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                <p className="text-xs text-muted-foreground truncate">{v.url}</p>
              </div>
              <button
                onClick={() => remove(v.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                aria-label="Delete video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-background border border-border rounded-lg p-3 space-y-2">
        <Label className="text-xs">Add a video (YouTube, Loom, Vimeo)</Label>
        <Input
          value={vTitle}
          onChange={(e) => setVTitle(e.target.value)}
          placeholder="Video title"
        />
        <Input
          value={vUrl}
          onChange={(e) => setVUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <Textarea
          value={vDesc}
          onChange={(e) => setVDesc(e.target.value)}
          placeholder="Short description (optional)"
          className="min-h-[60px]"
        />
        <Button size="sm" onClick={handleAdd} className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add video
        </Button>
      </div>
    </div>
  );
};

export default ModulesTable;
