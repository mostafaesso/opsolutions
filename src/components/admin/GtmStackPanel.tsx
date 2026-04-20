import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/lib/companies";
import { GTM_LAYER_CONFIGS } from "@/lib/gtmConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Layers, Rocket, TrendingUp, Sparkles, Save, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
}

type Phase = "pre_launch" | "launch" | "scale";

const PHASES: { key: Phase; label: string; description: string; icon: any }[] = [
  { key: "pre_launch", label: "Phase 1 · Pre-Launch", description: "ICP, data sources, and infrastructure setup", icon: Sparkles },
  { key: "launch", label: "Phase 2 · Launch", description: "Outreach execution, copy, validation", icon: Rocket },
  { key: "scale", label: "Phase 3 · Scale", description: "Optimisation, signals, expansion layers", icon: TrendingUp },
];

// Default phase mapping for the 8 GTM layers
const DEFAULT_PHASE_FOR_LAYER: Record<number, Phase> = {
  1: "pre_launch", // Data Sources
  2: "pre_launch", // Data Scraping
  8: "pre_launch", // Infrastructure
  3: "launch",     // Enrichment
  5: "launch",     // Copywriting
  6: "launch",     // Email Validation
  7: "launch",     // Outreach Execution
  4: "scale",      // Buying Signals
};

interface DbLayer {
  id?: string;
  company_slug: string;
  layer_number: number;
  tools_selected: string[];
  comments: string | null;
  calculator_data: Record<string, any>;
  is_complete: boolean;
  phase: Phase;
}

const GtmStackPanel = ({ companies }: Props) => {
  const [selected, setSelected] = useState<string>(companies[0]?.slug ?? "");
  const [phase, setPhase] = useState<Phase>("pre_launch");
  const [layers, setLayers] = useState<DbLayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [openLayer, setOpenLayer] = useState<number | null>(null);

  useEffect(() => {
    if (!selected && companies[0]) setSelected(companies[0].slug);
  }, [companies, selected]);

  const refresh = async () => {
    if (!selected) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("gtm_layers")
      .select("*")
      .eq("company_slug", selected)
      .order("layer_number");
    setLayers((data as DbLayer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const company = companies.find((c) => c.slug === selected);

  const layersForPhase = useMemo(() => {
    return GTM_LAYER_CONFIGS.filter((cfg) => {
      const existing = layers.find((l) => l.layer_number === cfg.number);
      const layerPhase = existing?.phase ?? DEFAULT_PHASE_FOR_LAYER[cfg.number] ?? "pre_launch";
      return layerPhase === phase;
    });
  }, [phase, layers]);

  const upsertLayer = async (layerNumber: number, patch: Partial<DbLayer>) => {
    if (!selected) return;
    const existing = layers.find((l) => l.layer_number === layerNumber);
    const merged: DbLayer = {
      company_slug: selected,
      layer_number: layerNumber,
      tools_selected: existing?.tools_selected ?? [],
      comments: existing?.comments ?? "",
      calculator_data: existing?.calculator_data ?? {},
      is_complete: existing?.is_complete ?? false,
      phase: existing?.phase ?? DEFAULT_PHASE_FOR_LAYER[layerNumber] ?? "pre_launch",
      ...patch,
    };
    setLayers((prev) => {
      const others = prev.filter((l) => l.layer_number !== layerNumber);
      return [...others, merged].sort((a, b) => a.layer_number - b.layer_number);
    });
    await (supabase as any)
      .from("gtm_layers")
      .upsert(
        {
          company_slug: selected,
          layer_number: layerNumber,
          tools_selected: merged.tools_selected,
          comments: merged.comments,
          calculator_data: merged.calculator_data,
          is_complete: merged.is_complete,
          phase: merged.phase,
        },
        { onConflict: "company_slug,layer_number" }
      );
  };

  const movePhase = async (layerNumber: number, newPhase: Phase) => {
    await upsertLayer(layerNumber, { phase: newPhase });
    toast({ title: `Layer ${layerNumber} moved to ${PHASES.find((p) => p.key === newPhase)?.label}` });
  };

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        Add a company first in the Companies section.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company picker */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</Label>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[260px] bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          Editing GTM stack for <strong>{company?.name}</strong> only.
        </span>
      </div>

      {/* Phase tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const active = phase === p.key;
          const count = layers.filter((l) => (l.phase ?? DEFAULT_PHASE_FOR_LAYER[l.layer_number]) === p.key).length;
          return (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={`text-left rounded-xl border p-4 transition-all ${
                active
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>{p.label}</p>
                <span className="ml-auto text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? "layer" : "layers"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
            </button>
          );
        })}
      </div>

      {/* Layers in phase */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : layersForPhase.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm">No layers in this phase yet.</p>
          <p className="text-xs">Use the phase dropdown on any layer to move it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {layersForPhase.map((cfg) => {
            const layer = layers.find((l) => l.layer_number === cfg.number);
            const isOpen = openLayer === cfg.number;
            const layerPhase = layer?.phase ?? DEFAULT_PHASE_FOR_LAYER[cfg.number] ?? "pre_launch";
            return (
              <div key={cfg.number} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenLayer(isOpen ? null : cfg.number)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {cfg.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{cfg.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{cfg.purpose}</p>
                  </div>
                  {layer?.is_complete && (
                    <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Complete</span>
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-border bg-muted/10 space-y-4">
                    {/* Phase mover */}
                    <div className="flex items-center gap-3">
                      <Label className="text-xs">Phase:</Label>
                      <Select value={layerPhase} onValueChange={(v) => movePhase(cfg.number, v as Phase)}>
                        <SelectTrigger className="w-[200px] bg-background h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PHASES.map((p) => (
                            <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tools */}
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools used</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {cfg.toolOptions.map((t) => {
                          const checked = (layer?.tools_selected ?? []).includes(t);
                          return (
                            <label key={t} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/40">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => {
                                  const tools = layer?.tools_selected ?? [];
                                  const next = checked ? tools.filter((x) => x !== t) : [...tools, t];
                                  upsertLayer(cfg.number, { tools_selected: next });
                                }}
                              />
                              <span className="text-foreground">{t}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Calculator */}
                    {cfg.calculator.length > 0 && (
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calculator</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {cfg.calculator.map((f) => (
                            <div key={f.key}>
                              <Label className="text-xs mb-1 block">
                                {f.label}{f.type === "percent" && " (%)"}
                              </Label>
                              <Input
                                type={f.type === "text" ? "text" : "number"}
                                value={layer?.calculator_data?.[f.key] ?? ""}
                                onChange={(e) =>
                                  upsertLayer(cfg.number, {
                                    calculator_data: { ...(layer?.calculator_data ?? {}), [f.key]: e.target.value },
                                  })
                                }
                                placeholder={f.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={layer?.comments ?? ""}
                        onChange={(e) => upsertLayer(cfg.number, { comments: e.target.value })}
                        placeholder="Context, decisions…"
                        className="mt-1 min-h-[70px]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={!!layer?.is_complete}
                          onCheckedChange={(v) => upsertLayer(cfg.number, { is_complete: !!v })}
                        />
                        <span className="text-foreground">Mark layer as complete</span>
                      </label>
                      <Button size="sm" variant="ghost" onClick={() => toast({ title: "Saved" })}>
                        <Save className="w-3.5 h-3.5 mr-1" /> Auto-saved
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GtmStackPanel;
