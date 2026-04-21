import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/lib/companies";
import { GTM_LAYER_CONFIGS, TOOL_PLANS, BillingType, ToolPlan } from "@/lib/gtmConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Layers, Rocket, TrendingUp, Sparkles, Save, ChevronDown, ChevronRight, DollarSign, Users, Zap } from "lucide-react";
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

const DEFAULT_PHASE_FOR_LAYER: Record<number, Phase> = {
  1: "pre_launch",
  2: "pre_launch",
  8: "pre_launch",
  3: "launch",
  5: "launch",
  6: "launch",
  7: "launch",
  4: "scale",
};

const BILLING_LABEL: Record<BillingType, string> = {
  monthly: "/mo",
  annual: "/yr",
  one_time: " one-time",
  per_user_month: "/user/mo",
  free: "Free",
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

// ── Budget helpers ─────────────────────────────────────────────────────────

function getMonthlyPrice(plan: ToolPlan): number {
  if (plan.billing === "free" || plan.billing === "one_time") return 0;
  if (plan.billing === "annual") return plan.price / 12;
  return plan.price;
}

interface BudgetItem {
  tool: string;
  planName: string;
  monthly: number;
  oneTime: number;
  units: number;
  unitLabel: string;
}

function computeBudget(layers: DbLayer[]) {
  let recurringMonthly = 0;
  let oneTimeCost = 0;
  let totalContacts = 0;
  const selected: BudgetItem[] = [];

  for (const layer of layers) {
    const planMap: Record<string, string> = layer.calculator_data?.tool_plans ?? {};
    for (const tool of layer.tools_selected) {
      const plans = TOOL_PLANS[tool];
      if (!plans) continue;
      const planName = planMap[tool];
      const plan = plans.find((p) => p.name === planName) ?? null;
      if (!plan) continue;
      const monthly = getMonthlyPrice(plan);
      const ot = plan.billing === "one_time" ? plan.price : 0;
      recurringMonthly += monthly;
      oneTimeCost += ot;
      totalContacts += plan.units_per_month ?? 0;
      selected.push({ tool, planName: plan.name, monthly, oneTime: ot, units: plan.units_per_month, unitLabel: plan.unit_label });
    }
  }

  return {
    recurringMonthly,
    oneTimeCost,
    totalMonthly: recurringMonthly,
    totalAnnual: recurringMonthly * 12 + oneTimeCost,
    totalContacts,
    selected,
  };
}

// ── Plan picker for a single tool ─────────────────────────────────────────

const ToolPlanPicker = ({
  tool,
  selectedPlan,
  onChange,
}: {
  tool: string;
  selectedPlan: string | null;
  onChange: (plan: string) => void;
}) => {
  const plans = TOOL_PLANS[tool];
  if (!plans) return null;

  const active = plans.find((p) => p.name === selectedPlan) ?? null;

  return (
    <div className="mt-2 ml-6 p-3 rounded-lg bg-muted/60 border border-border space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Plan</Label>
        <Select value={selectedPlan ?? ""} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-xs bg-background flex-1">
            <SelectValue placeholder="Select plan…" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                <span className="flex items-center gap-2">
                  <span>{p.name}</span>
                  {p.popular && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Popular</span>}
                  <span className="text-muted-foreground ml-auto">
                    {p.billing === "free" ? "Free" : `$${p.price}${BILLING_LABEL[p.billing]}`}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {active && (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            <DollarSign className="w-2.5 h-2.5" />
            {active.billing === "free"
              ? "Free"
              : `$${active.price}${BILLING_LABEL[active.billing]}`}
          </span>
          {active.units_per_month > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Users className="w-2.5 h-2.5" />
              {active.units_per_month.toLocaleString()} {active.unit_label}
            </span>
          )}
          {active.note && (
            <span className="text-[11px] text-muted-foreground italic">{active.note}</span>
          )}
        </div>
      )}
    </div>
  );
};

// ── Budget summary card ────────────────────────────────────────────────────

const BudgetSummary = ({ layers }: { layers: DbLayer[] }) => {
  const { recurringMonthly, oneTimeCost, totalAnnual, totalContacts, selected } = useMemo(
    () => computeBudget(layers),
    [layers],
  );
  if (selected.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Stack Budget Estimate</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">based on selected plans</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Monthly (recurring)</p>
          <p className="text-lg font-bold text-foreground">${recurringMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">One-time costs</p>
          <p className="text-lg font-bold text-foreground">${oneTimeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Annual total</p>
          <p className="text-lg font-bold text-foreground">${totalAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Leads/mo capacity</p>
          <p className="text-lg font-bold text-emerald-600">{totalContacts.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {selected.map((s) => (
          <div key={`${s.tool}-${s.planName}`} className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground w-36 truncate">{s.tool}</span>
            <span className="text-muted-foreground">{s.planName}</span>
            <span className="ml-auto font-semibold text-foreground">
              {s.oneTime > 0
                ? `$${s.oneTime.toLocaleString()} one-time`
                : s.monthly === 0
                ? "Free"
                : `$${s.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
            </span>
            {s.units > 0 && (
              <span className="text-emerald-600 w-28 text-right">{s.units.toLocaleString()} {s.unitLabel.split("/")[0]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Conversion funnel ──────────────────────────────────────────────────────

const INDUSTRIES = [
  { label: "SaaS / Tech",                    replyMult: 1.3, closeMult: 1.0 },
  { label: "E-commerce / Retail",             replyMult: 0.9, closeMult: 0.8 },
  { label: "Financial Services",              replyMult: 0.8, closeMult: 1.2 },
  { label: "Healthcare",                      replyMult: 0.6, closeMult: 0.9 },
  { label: "Manufacturing",                   replyMult: 0.7, closeMult: 1.1 },
  { label: "Real Estate",                     replyMult: 1.0, closeMult: 1.0 },
  { label: "Consulting / Professional Svcs",  replyMult: 1.2, closeMult: 1.3 },
  { label: "Education",                       replyMult: 0.7, closeMult: 0.8 },
  { label: "Logistics / Supply Chain",        replyMult: 0.85, closeMult: 1.0 },
];

const REGIONS = [
  { label: "GCC / MENA",      replyMult: 0.8,  closeMult: 1.3 },
  { label: "US / Canada",     replyMult: 1.0,  closeMult: 1.0 },
  { label: "Europe",          replyMult: 0.85, closeMult: 0.9 },
  { label: "Southeast Asia",  replyMult: 0.9,  closeMult: 0.95 },
  { label: "LATAM",           replyMult: 1.1,  closeMult: 0.85 },
  { label: "Australia / NZ",  replyMult: 0.95, closeMult: 1.0 },
  { label: "India",           replyMult: 1.0,  closeMult: 0.85 },
];

interface FunnelStage { label: string; value: number; color: string }

const ConversionFunnel = ({ defaultLeads }: { defaultLeads: number }) => {
  const [leads, setLeads] = useState<string>("");
  const [industryIdx, setIndustryIdx] = useState(0);
  const [regionIdx, setRegionIdx] = useState(0);

  const leadsNum = parseInt(leads || String(defaultLeads), 10) || 0;
  const ind = INDUSTRIES[industryIdx];
  const reg = REGIONS[regionIdx];

  const stages: FunnelStage[] = useMemo(() => {
    const emailsSent   = leadsNum;
    const opened       = Math.round(emailsSent * 0.45);
    const replied      = Math.round(emailsSent * 0.03 * ind.replyMult * reg.replyMult);
    const interested   = Math.round(replied * 0.35);
    const demos        = Math.round(interested * 0.60);
    const closed       = Math.round(demos * 0.20 * ind.closeMult * reg.closeMult);
    return [
      { label: "Leads sourced",    value: leadsNum,    color: "bg-slate-500" },
      { label: "Emails sent",      value: emailsSent,  color: "bg-blue-500" },
      { label: "Opened",           value: opened,      color: "bg-violet-500" },
      { label: "Replied",          value: replied,     color: "bg-amber-500" },
      { label: "Interested",       value: interested,  color: "bg-orange-500" },
      { label: "Demos booked",     value: demos,       color: "bg-emerald-500" },
      { label: "Deals closed",     value: closed,      color: "bg-green-600" },
    ];
  }, [leadsNum, industryIdx, regionIdx]);

  const maxVal = stages[0]?.value || 1;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Conversion Rate Forecast</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1 min-w-[120px]">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Leads / month</Label>
          <Input
            type="number"
            placeholder={defaultLeads > 0 ? String(defaultLeads) : "e.g. 5000"}
            value={leads}
            onChange={(e) => setLeads(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Industry</Label>
          <Select value={String(industryIdx)} onValueChange={(v) => setIndustryIdx(Number(v))}>
            <SelectTrigger className="h-8 text-sm bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((item, i) => (
                <SelectItem key={item.label} value={String(i)}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Region</Label>
          <Select value={String(regionIdx)} onValueChange={(v) => setRegionIdx(Number(v))}>
            <SelectTrigger className="h-8 text-sm bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGIONS.map((item, i) => (
                <SelectItem key={item.label} value={String(i)}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {leadsNum > 0 && (
        <div className="space-y-1.5 pt-1">
          {stages.map((stage, i) => {
            const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
            const convRate = i > 0 && stages[i - 1].value > 0
              ? ((stage.value / stages[i - 1].value) * 100).toFixed(1) + "%"
              : null;
            return (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-28 shrink-0 text-right">{stage.label}</span>
                <div className="flex-1 rounded-full bg-muted h-5 overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-16 text-right">
                  {stage.value.toLocaleString()}
                </span>
                {convRate && (
                  <span className="text-[10px] text-muted-foreground w-12">{convRate}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main panel ─────────────────────────────────────────────────────────────

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

  const totalLeadsCapacity = useMemo(() => computeBudget(layers).totalContacts, [layers]);

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

  const setToolPlan = (layerNumber: number, layer: DbLayer | undefined, tool: string, planName: string) => {
    const calc = layer?.calculator_data ?? {};
    upsertLayer(layerNumber, {
      calculator_data: { ...calc, tool_plans: { ...(calc.tool_plans ?? {}), [tool]: planName } },
    });
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

      {/* Budget summary + conversion funnel (all layers, all phases) */}
      <BudgetSummary layers={layers} />
      <ConversionFunnel defaultLeads={totalLeadsCapacity} />

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
            const toolPlans: Record<string, string> = layer?.calculator_data?.tool_plans ?? {};

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

                    {/* Tools + plan picker */}
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools used</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {cfg.toolOptions.map((t) => {
                          const checked = (layer?.tools_selected ?? []).includes(t);
                          const hasPlans = !!TOOL_PLANS[t];
                          return (
                            <div key={t}>
                              <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/40">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => {
                                    const tools = layer?.tools_selected ?? [];
                                    const next = checked ? tools.filter((x) => x !== t) : [...tools, t];
                                    upsertLayer(cfg.number, { tools_selected: next });
                                  }}
                                />
                                <span className="text-foreground flex-1">{t}</span>
                                {hasPlans && checked && toolPlans[t] && (
                                  <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{toolPlans[t]}</span>
                                )}
                              </label>
                              {checked && hasPlans && (
                                <ToolPlanPicker
                                  tool={t}
                                  selectedPlan={toolPlans[t] ?? null}
                                  onChange={(plan) => setToolPlan(cfg.number, layer, t, plan)}
                                />
                              )}
                            </div>
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

                    {/* Notes */}
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
