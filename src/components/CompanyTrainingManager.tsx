import { useState } from "react";
import { trainingCards } from "@/lib/trainingData";
import { useTrainingOverrides } from "@/hooks/useTrainingOverrides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, ChevronDown, ChevronRight, EyeOff, Video, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  companySlug: string;
  companyName: string;
  open: boolean;
  onClose: () => void;
}

export const CompanyTrainingManager = ({ companySlug, companyName, open, onClose }: Props) => {
  const { overrides, loading, error, getOverride, upsertOverride } = useTrainingOverrides(companySlug);
  const { toast } = useToast();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { notes: string; videoUrl: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const getDraft = (moduleId: string) => {
    if (drafts[moduleId]) return drafts[moduleId];
    const override = getOverride(moduleId);
    return { notes: override?.custom_notes || "", videoUrl: override?.custom_video_url || "" };
  };

  const handleToggleHide = async (moduleId: string) => {
    const override = getOverride(moduleId);
    try {
      await upsertOverride(moduleId, { is_hidden: !override?.is_hidden });
      toast({ title: override?.is_hidden ? "Module shown" : "Module hidden" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleSaveNotes = async (moduleId: string) => {
    const draft = getDraft(moduleId);
    setSaving(moduleId);
    try {
      await upsertOverride(moduleId, {
        custom_notes: draft.notes.trim() || undefined,
        custom_video_url: draft.videoUrl.trim() || undefined,
      });
      toast({ title: "Saved", description: "Training notes updated for this company." });
      setDrafts((d) => ({ ...d, [moduleId]: undefined as any }));
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const hiddenCount = overrides.filter((o) => o.is_hidden).length;
  const customisedCount = overrides.filter((o) => o.custom_notes || o.custom_video_url).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Training Materials — {companyName}
          </DialogTitle>
          <div className="flex gap-3 text-xs text-muted-foreground pt-1">
            <span>{trainingCards.length} modules total</span>
            {hiddenCount > 0 && <span className="text-orange-600">{hiddenCount} hidden</span>}
            {customisedCount > 0 && <span className="text-blue-600">{customisedCount} customised</span>}
          </div>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-2 mt-2">
          {trainingCards.map((card) => {
            const override = getOverride(card.id);
            const isHidden = override?.is_hidden ?? false;
            const hasNotes = !!(override?.custom_notes);
            const hasVideo = !!(override?.custom_video_url);
            const isExpanded = expandedModule === card.id;
            const draft = getDraft(card.id);

            return (
              <div
                key={card.id}
                className={`border rounded-lg ${isHidden ? "opacity-50 border-dashed" : ""}`}
              >
                {/* Module header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedModule(isExpanded ? null : card.id)}
                >
                  <span className="text-xs font-mono text-muted-foreground w-6">{card.number}</span>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{card.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{card.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasNotes && <Badge variant="secondary" className="text-xs gap-1"><StickyNote className="h-3 w-3" />Notes</Badge>}
                    {hasVideo && <Badge variant="secondary" className="text-xs gap-1"><Video className="h-3 w-3" />Video</Badge>}
                    {isHidden && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 gap-1"><EyeOff className="h-3 w-3" />Hidden</Badge>}
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </div>

                {/* Expanded edit panel */}
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-4 bg-muted/10">
                    {/* Hide toggle */}
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={!isHidden}
                        onCheckedChange={() => handleToggleHide(card.id)}
                        disabled={loading}
                      />
                      <Label className="text-sm">
                        {isHidden ? "Module hidden for this company" : "Module visible to learners"}
                      </Label>
                    </div>

                    {/* Company-specific notes */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Company-specific notes</Label>
                      <Textarea
                        placeholder="Add notes tailored for this company — e.g. their specific process, stage names, or team context. Learners see this alongside the default content."
                        rows={3}
                        value={draft.notes}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [card.id]: { ...getDraft(card.id), notes: e.target.value },
                          }))
                        }
                      />
                    </div>

                    {/* Custom video URL */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Custom video URL (optional)</Label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={draft.videoUrl}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [card.id]: { ...getDraft(card.id), videoUrl: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSaveNotes(card.id)}
                      disabled={saving === card.id}
                    >
                      {saving === card.id ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
