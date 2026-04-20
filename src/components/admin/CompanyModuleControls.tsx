import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useCompanyVideos } from "@/hooks/useCompanyVideos";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Settings2, Video, FileText, Bell } from "lucide-react";
import { useState } from "react";

interface CompanyModuleControlsProps {
  companySlug: string;
}

const CompanyModuleControls = ({ companySlug }: CompanyModuleControlsProps) => {
  const { settings, update } = useCompanySettings(companySlug);
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
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Module Visibility</h3>
        </div>
        <div className="space-y-3">
          <ToggleRow
            icon={<FileText className="w-4 h-4" />}
            label="Doc Training tab"
            description="Show the HubSpot journey stepper to employees"
            checked={settings.training_doc_enabled}
            onChange={(v) => update({ training_doc_enabled: v })}
          />
          <ToggleRow
            icon={<Video className="w-4 h-4" />}
            label="Video Training tab"
            description="Show the videos tab to employees"
            checked={settings.training_video_enabled}
            onChange={(v) => update({ training_video_enabled: v })}
          />
          <ToggleRow
            icon={<Bell className="w-4 h-4" />}
            label="CRM Updates visible to employees"
            description="When off, only managers/admins see the CRM Updates module"
            checked={settings.crm_updates_employee_visible}
            onChange={(v) => update({ crm_updates_employee_visible: v })}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Training Videos ({videos.length})</h3>
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
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 bg-background border border-border rounded-lg p-3">
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
    </div>
  );
};

const ToggleRow = ({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 bg-background border border-border rounded-lg px-4 py-3">
    <div className="flex items-start gap-3 min-w-0">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default CompanyModuleControls;
