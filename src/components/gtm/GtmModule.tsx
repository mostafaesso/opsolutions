import { useGtmIcp, useGtmLayers } from "@/hooks/useGtm";
import { GTM_LAYER_CONFIGS } from "@/lib/gtmConfig";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Layers, Target } from "lucide-react";

interface GtmModuleProps {
  companySlug: string;
  /** Only super-admin can edit. Everyone else is view-only. */
  canEdit: boolean;
}

const GtmModule = ({ companySlug, canEdit }: GtmModuleProps) => {
  return (
    <Tabs defaultValue="icp" className="space-y-6">
      <TabsList>
        <TabsTrigger value="icp">
          <Target className="w-4 h-4 mr-2" />
          ICP Definition
        </TabsTrigger>
        <TabsTrigger value="stack">
          <Layers className="w-4 h-4 mr-2" />
          Core GTM Stack
        </TabsTrigger>
      </TabsList>

      <TabsContent value="icp">
        <IcpEditor companySlug={companySlug} canEdit={canEdit} />
      </TabsContent>

      <TabsContent value="stack">
        <StackLayers companySlug={companySlug} canEdit={canEdit} />
      </TabsContent>
    </Tabs>
  );
};

// ─── ICP ────────────────────────────────────────────────

const IcpEditor = ({ companySlug, canEdit }: { companySlug: string; canEdit: boolean }) => {
  const { icp, loading, save } = useGtmIcp(companySlug);
  const [draft, setDraft] = useState(icp);
  const [jobTitlesText, setJobTitlesText] = useState("");

  useEffect(() => {
    setDraft(icp);
    setJobTitlesText((icp.job_titles ?? []).join(", "));
  }, [icp]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading ICP…</p>;

  const onSave = async () => {
    const titles = jobTitlesText.split(",").map((s) => s.trim()).filter(Boolean);
    await save({ ...draft, job_titles: titles });
  };

  const fields: { key: keyof typeof draft; label: string; placeholder: string; multi?: boolean }[] = [
    { key: "industry", label: "Industry", placeholder: "e.g. SaaS, Manufacturing" },
    { key: "company_size", label: "Company size", placeholder: "Employees / revenue" },
    { key: "geography", label: "Geography", placeholder: "e.g. GCC, EU, NA" },
    { key: "pain_points", label: "Pain points", placeholder: "What problems do they have?", multi: true },
    { key: "buying_triggers", label: "Buying triggers", placeholder: "What signals readiness?", multi: true },
    { key: "notes", label: "Notes / references", placeholder: "Anything else", multi: true },
  ];

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">Ideal Customer Profile</h3>
        <p className="text-xs text-muted-foreground">
          The shared definition of who this company sells to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.multi ? "md:col-span-2" : ""}>
            <Label className="text-xs font-semibold mb-1.5 block">{f.label}</Label>
            {f.multi ? (
              <Textarea
                value={(draft as any)[f.key] ?? ""}
                disabled={!canEdit}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as any)}
                placeholder={f.placeholder}
                className="min-h-[88px]"
              />
            ) : (
              <Input
                value={(draft as any)[f.key] ?? ""}
                disabled={!canEdit}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as any)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <Label className="text-xs font-semibold mb-1.5 block">Job titles targeted</Label>
          <Input
            value={jobTitlesText}
            disabled={!canEdit}
            onChange={(e) => setJobTitlesText(e.target.value)}
            placeholder="Comma-separated, e.g. CRO, Head of Sales, RevOps Lead"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Separate with commas</p>
        </div>
      </div>

      {canEdit ? (
        <div className="flex justify-end pt-2">
          <button
            onClick={onSave}
            className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Save ICP
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          View-only. Contact your Ops Solutions consultant to update the ICP.
        </p>
      )}
    </Card>
  );
};

// ─── Stack layers + summary ─────────────────────────────

const StackLayers = ({ companySlug, canEdit }: { companySlug: string; canEdit: boolean }) => {
  const { layers, loading, upsertLayer } = useGtmLayers(companySlug);
  const [openLayer, setOpenLayer] = useState<number | null>(1);

  const summary = useMemo(() => {
    const totals = {
      sourced: 0,
      enriched: 0,
      validated: 0,
      contacted: 0,
      replied: 0,
      meetings: 0,
    };
    layers.forEach((l) => {
      const cfg = GTM_LAYER_CONFIGS.find((c) => c.number === l.layer_number);
      cfg?.calculator.forEach((field) => {
        if (field.flowStage) {
          const val = Number(l.calculator_data?.[field.key]) || 0;
          (totals as any)[field.flowStage] += val;
        }
      });
    });
    return totals;
  }, [layers]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading layers…</p>;

  const flow: { key: keyof typeof summary; label: string }[] = [
    { key: "sourced", label: "Sourced" },
    { key: "enriched", label: "Enriched" },
    { key: "validated", label: "Validated" },
    { key: "contacted", label: "Contacted" },
    { key: "replied", label: "Replied" },
    { key: "meetings", label: "Meetings" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary flow */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">GTM Funnel Summary</h3>
          <span className="text-[11px] text-muted-foreground">Aggregated from layer inputs</span>
        </div>
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {flow.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 shrink-0">
              <div className="rounded-lg border border-border bg-background px-4 py-3 min-w-[110px] text-center">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {summary[s.key].toLocaleString()}
                </p>
              </div>
              {i < flow.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Layers stepper */}
      <ol className="relative border-l-2 border-border ml-3 space-y-4">
        {GTM_LAYER_CONFIGS.map((cfg) => {
          const layer = layers.find((l) => l.layer_number === cfg.number);
          const isComplete = !!layer?.is_complete;
          const isOpen = openLayer === cfg.number;
          return (
            <li key={cfg.number} className="ml-6">
              <span
                className={`absolute -left-[15px] flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-background text-xs font-bold ${
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-foreground"
                }`}
              >
                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : cfg.number}
              </span>

              <Card className="overflow-hidden">
                <button
                  onClick={() => setOpenLayer(isOpen ? null : cfg.number)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      Layer {cfg.number}: {cfg.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cfg.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isComplete && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                        Complete
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{isOpen ? "Hide" : "Edit"}</span>
                  </div>
                </button>

                {isOpen && (
                  <LayerEditor
                    cfg={cfg}
                    layer={layer}
                    canEdit={canEdit}
                    onChange={(patch) => upsertLayer(cfg.number, patch)}
                  />
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const LayerEditor = ({
  cfg,
  layer,
  canEdit,
  onChange,
}: {
  cfg: (typeof GTM_LAYER_CONFIGS)[number];
  layer: any;
  canEdit: boolean;
  onChange: (patch: any) => void;
}) => {
  const tools: string[] = layer?.tools_selected ?? [];
  const calc: Record<string, any> = layer?.calculator_data ?? {};
  const otherTool: string =
    tools.find((t) => !cfg.toolOptions.includes(t)) ?? "";

  const toggleTool = (t: string) => {
    if (!canEdit) return;
    const next = tools.includes(t) ? tools.filter((x) => x !== t) : [...tools, t];
    onChange({ tools_selected: next });
  };

  const setOtherTool = (val: string) => {
    if (!canEdit) return;
    const cleaned = tools.filter((t) => cfg.toolOptions.includes(t));
    onChange({ tools_selected: val.trim() ? [...cleaned, val.trim()] : cleaned });
  };

  const setCalc = (key: string, val: string) => {
    if (!canEdit) return;
    onChange({ calculator_data: { ...calc, [key]: val } });
  };

  return (
    <div className="px-5 pb-5 space-y-5 border-t border-border bg-muted/10 pt-5">
      {/* Tools */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Tools used
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cfg.toolOptions.map((t) => (
            <label
              key={t}
              className={`flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/40 transition-colors ${
                !canEdit ? "cursor-not-allowed opacity-80" : ""
              }`}
            >
              <Checkbox
                checked={tools.includes(t)}
                onCheckedChange={() => toggleTool(t)}
                disabled={!canEdit}
              />
              <span className="text-foreground">{t}</span>
            </label>
          ))}
        </div>
        <Input
          value={otherTool}
          disabled={!canEdit}
          onChange={(e) => setOtherTool(e.target.value)}
          placeholder="Other tool (free text)"
          className="mt-2 text-sm"
        />
      </div>

      {/* Calculator */}
      {cfg.calculator.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Calculator
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cfg.calculator.map((f) => (
              <div key={f.key}>
                <Label className="text-xs mb-1 block">
                  {f.label}
                  {f.type === "percent" && " (%)"}
                </Label>
                <Input
                  type={f.type === "text" ? "text" : "number"}
                  value={calc[f.key] ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => setCalc(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">Notes / comments</Label>
        <Textarea
          value={layer?.comments ?? ""}
          disabled={!canEdit}
          onChange={(e) => onChange({ comments: e.target.value })}
          placeholder="Context, decisions, gotchas…"
          className="min-h-[80px]"
        />
      </div>

      {canEdit && (
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={!!layer?.is_complete}
              onCheckedChange={(v) => onChange({ is_complete: !!v })}
            />
            <span className="text-foreground">Mark layer as complete</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default GtmModule;
