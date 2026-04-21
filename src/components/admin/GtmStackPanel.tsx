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
import {
  Layers, Rocket, TrendingUp, Sparkles, Save,
  ChevronDown, ChevronRight, DollarSign, Users, Zap,
  BarChart3, BookOpen, CheckCircle2, Circle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
}

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = "pre_launch" | "launch" | "scale";
type MainTab = "stack" | "forecast" | "approaches";

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

interface BudgetItem {
  tool: string;
  planName: string;
  monthly: number;
  oneTime: number;
  units: number;
  unitLabel: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PHASES: { key: Phase; label: string; description: string; icon: any }[] = [
  { key: "pre_launch", label: "Pre-Launch",  description: "ICP, data sources, infrastructure", icon: Sparkles },
  { key: "launch",     label: "Launch",      description: "Outreach, copy, validation",        icon: Rocket },
  { key: "scale",      label: "Scale",       description: "Signals, optimisation, expansion",  icon: TrendingUp },
];

const DEFAULT_PHASE_FOR_LAYER: Record<number, Phase> = {
  1: "pre_launch", 2: "pre_launch", 8: "pre_launch",
  3: "launch",     5: "launch",     6: "launch",     7: "launch",
  4: "scale",
};

const BILLING_LABEL: Record<BillingType, string> = {
  monthly: "/mo",
  annual: "/yr",
  one_time: " one-time",
  per_user_month: "/user/mo",
  free: "Free",
};

const MAIN_TABS: { key: MainTab; label: string; icon: any }[] = [
  { key: "stack",      label: "GTM Stack",      icon: Layers },
  { key: "forecast",   label: "Lead Forecast",  icon: BarChart3 },
  { key: "approaches", label: "GTM Approaches", icon: BookOpen },
];

// ── Budget helpers ─────────────────────────────────────────────────────────

function getMonthlyPrice(plan: ToolPlan): number {
  if (plan.billing === "free" || plan.billing === "one_time") return 0;
  if (plan.billing === "annual") return plan.price / 12;
  return plan.price;
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
    totalAnnual: recurringMonthly * 12 + oneTimeCost,
    totalContacts,
    selected,
  };
}

// ── ToolPlanPicker ─────────────────────────────────────────────────────────

const ToolPlanPicker = ({
  tool, selectedPlan, onChange,
}: { tool: string; selectedPlan: string | null; onChange: (plan: string) => void }) => {
  const plans = TOOL_PLANS[tool];
  if (!plans) return null;
  const active = plans.find((p) => p.name === selectedPlan) ?? null;

  return (
    <div className="mt-1.5 ml-7 p-3 rounded-lg bg-muted/50 border border-border/60 space-y-2">
      <Select value={selectedPlan ?? ""} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-xs bg-background">
          <SelectValue placeholder="Select plan…" />
        </SelectTrigger>
        <SelectContent>
          {plans.map((p) => (
            <SelectItem key={p.name} value={p.name}>
              <span className="flex items-center gap-2">
                <span>{p.name}</span>
                {p.popular && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Popular</span>}
                <span className="text-muted-foreground ml-auto text-[11px]">
                  {p.billing === "free" ? "Free" : `$${p.price}${BILLING_LABEL[p.billing]}`}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active && (
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            <DollarSign className="w-2.5 h-2.5" />
            {active.billing === "free" ? "Free" : `$${active.price}${BILLING_LABEL[active.billing]}`}
          </span>
          {active.units_per_month > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Users className="w-2.5 h-2.5" />
              {active.units_per_month.toLocaleString()} {active.unit_label}
            </span>
          )}
          {active.note && <span className="text-[11px] text-muted-foreground italic">{active.note}</span>}
        </div>
      )}
    </div>
  );
};

// ── BudgetSummary ──────────────────────────────────────────────────────────

const BudgetSummary = ({ layers }: { layers: DbLayer[] }) => {
  const { recurringMonthly, oneTimeCost, totalAnnual, totalContacts, selected } = useMemo(
    () => computeBudget(layers), [layers],
  );
  if (selected.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Stack Budget Estimate</h3>
          <p className="text-[11px] text-muted-foreground">Based on selected plans across all phases</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Monthly (recurring)", value: `$${recurringMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: "/month", color: "text-foreground" },
          { label: "One-time setup",      value: `$${oneTimeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,      sub: "one-time", color: "text-foreground" },
          { label: "Annual total",        value: `$${totalAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,      sub: "/year",    color: "text-foreground" },
          { label: "Leads capacity",      value: totalContacts.toLocaleString(),                                                 sub: "leads/mo", color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-background border border-border p-3">
            <p className="text-[11px] text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] text-[11px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/40 px-4 py-2">
          <span>Tool</span><span>Plan</span><span className="text-right pr-8">Cost</span><span className="text-right">Capacity</span>
        </div>
        <div className="divide-y divide-border/40">
          {selected.map((s) => (
            <div key={`${s.tool}-${s.planName}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-2.5 text-xs hover:bg-muted/20 transition-colors">
              <span className="font-medium text-foreground">{s.tool}</span>
              <span className="text-muted-foreground text-[11px] mr-6">{s.planName}</span>
              <span className="font-semibold text-foreground text-right mr-8">
                {s.oneTime > 0 ? `$${s.oneTime.toLocaleString()} once` : s.monthly === 0 ? "Free" : `$${s.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
              </span>
              <span className="text-emerald-600 text-right text-[11px]">
                {s.units > 0 ? `${s.units.toLocaleString()} ${s.unitLabel.split("/")[0]}` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Lead Forecast (Conversion Funnel) ──────────────────────────────────────

const INDUSTRIES = [
  { label: "SaaS / Tech",                   replyMult: 1.3,  closeMult: 1.0 },
  { label: "E-commerce / Retail",            replyMult: 0.9,  closeMult: 0.8 },
  { label: "Financial Services",             replyMult: 0.8,  closeMult: 1.2 },
  { label: "Healthcare",                     replyMult: 0.6,  closeMult: 0.9 },
  { label: "Manufacturing",                  replyMult: 0.7,  closeMult: 1.1 },
  { label: "Real Estate",                    replyMult: 1.0,  closeMult: 1.0 },
  { label: "Consulting / Professional Svcs", replyMult: 1.2,  closeMult: 1.3 },
  { label: "Education",                      replyMult: 0.7,  closeMult: 0.8 },
  { label: "Logistics / Supply Chain",       replyMult: 0.85, closeMult: 1.0 },
];

const REGIONS = [
  { label: "GCC / MENA",     replyMult: 0.8,  closeMult: 1.3  },
  { label: "US / Canada",    replyMult: 1.0,  closeMult: 1.0  },
  { label: "Europe",         replyMult: 0.85, closeMult: 0.9  },
  { label: "Southeast Asia", replyMult: 0.9,  closeMult: 0.95 },
  { label: "LATAM",          replyMult: 1.1,  closeMult: 0.85 },
  { label: "Australia / NZ", replyMult: 0.95, closeMult: 1.0  },
  { label: "India",          replyMult: 1.0,  closeMult: 0.85 },
];

interface FunnelStage { label: string; value: number; pct: string; barColor: string; labelColor: string }

const LeadForecastTab = ({ defaultLeads }: { defaultLeads: number }) => {
  const [leads, setLeads] = useState("");
  const [industryIdx, setIndustryIdx] = useState(0);
  const [regionIdx, setRegionIdx] = useState(0);

  const leadsNum = parseInt(leads || String(defaultLeads), 10) || 0;
  const ind = INDUSTRIES[industryIdx];
  const reg = REGIONS[regionIdx];

  const stages: FunnelStage[] = useMemo(() => {
    if (leadsNum === 0) return [];
    const sent      = leadsNum;
    const opened    = Math.round(sent * 0.45);
    const replied   = Math.round(sent * 0.03 * ind.replyMult * reg.replyMult);
    const interested = Math.round(replied * 0.35);
    const demos     = Math.round(interested * 0.60);
    const closed    = Math.round(demos * 0.20 * ind.closeMult * reg.closeMult);
    const rows = [
      { label: "Leads sourced",  value: sent,       barColor: "bg-slate-400",   labelColor: "text-slate-600" },
      { label: "Emails sent",    value: sent,       barColor: "bg-blue-400",    labelColor: "text-blue-600" },
      { label: "Opened",         value: opened,     barColor: "bg-violet-400",  labelColor: "text-violet-600" },
      { label: "Replied",        value: replied,    barColor: "bg-amber-400",   labelColor: "text-amber-600" },
      { label: "Interested",     value: interested, barColor: "bg-orange-400",  labelColor: "text-orange-600" },
      { label: "Demos booked",   value: demos,      barColor: "bg-emerald-500", labelColor: "text-emerald-600" },
      { label: "Deals closed",   value: closed,     barColor: "bg-green-600",   labelColor: "text-green-700" },
    ];
    return rows.map((r, i) => ({
      ...r,
      pct: i === 0 ? "100%" : rows[i - 1].value > 0 ? ((r.value / rows[i - 1].value) * 100).toFixed(1) + "%" : "—",
    }));
  }, [leadsNum, industryIdx, regionIdx]);

  const maxVal = stages[0]?.value || 1;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Lead Forecast</h3>
            <p className="text-[11px] text-muted-foreground">Expected conversions at each outbound stage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Leads / month</Label>
            <Input
              type="number"
              placeholder={defaultLeads > 0 ? String(defaultLeads) : "e.g. 5,000"}
              value={leads}
              onChange={(e) => setLeads(e.target.value)}
              className="h-9"
            />
            {defaultLeads > 0 && !leads && (
              <p className="text-[10px] text-muted-foreground">Using stack capacity: {defaultLeads.toLocaleString()}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Industry</Label>
            <Select value={String(industryIdx)} onValueChange={(v) => setIndustryIdx(Number(v))}>
              <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((item, i) => (
                  <SelectItem key={item.label} value={String(i)}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Region</Label>
            <Select value={String(regionIdx)} onValueChange={(v) => setRegionIdx(Number(v))}>
              <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGIONS.map((item, i) => (
                  <SelectItem key={item.label} value={String(i)}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {stages.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-[140px_1fr_72px_56px] text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              <span>Stage</span><span>Funnel</span><span className="text-right">Volume</span><span className="text-right">Conv.</span>
            </div>
            {stages.map((stage, i) => {
              const width = maxVal > 0 ? Math.max((stage.value / maxVal) * 100, 1) : 0;
              return (
                <div key={stage.label} className="grid grid-cols-[140px_1fr_72px_56px] items-center gap-3">
                  <span className={`text-xs font-medium ${stage.labelColor}`}>{stage.label}</span>
                  <div className="h-6 rounded-md bg-muted overflow-hidden">
                    <div
                      className={`h-full ${stage.barColor} rounded-md transition-all duration-500`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground text-right">
                    {stage.value.toLocaleString()}
                  </span>
                  <span className={`text-[11px] text-right ${i === 0 ? "text-muted-foreground" : stage.labelColor}`}>
                    {stage.pct}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {stages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Enter leads/month above to see your forecast</p>
          </div>
        )}
      </div>

      {stages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Reply rate",    value: stages[3]?.value ?? 0, total: stages[0]?.value ?? 1, suffix: "replies", color: "text-amber-600" },
            { label: "Demo rate",     value: stages[5]?.value ?? 0, total: stages[0]?.value ?? 1, suffix: "demos",   color: "text-emerald-600" },
            { label: "Close rate",    value: stages[6]?.value ?? 0, total: stages[0]?.value ?? 1, suffix: "deals",   color: "text-green-700" },
            { label: "Cost/deal",     value: null,                   total: null,                  suffix: "",        color: "text-primary" },
          ].map((card, i) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] text-muted-foreground mb-1">{card.label}</p>
              {i < 3 ? (
                <>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value!.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {card.suffix} · {card.total! > 0 ? ((card.value! / card.total!) * 100).toFixed(2) : 0}% of leads
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 italic">Add stack budget for cost/deal calc</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── GTM Approaches ─────────────────────────────────────────────────────────

const FREE_TOOLS = [
  { tool: "LinkedIn (Boolean search)",       note: "Manual list building with advanced search filters" },
  { tool: "Google Boolean search",           note: 'site:linkedin.com/in "Head of" AND "industry"' },
  { tool: "Clay (free plan)",                note: "Up to 100 enrichment credits/mo" },
  { tool: "Niche directories",               note: "Clutch, Google Maps, Yellow Pages, Maroof.sa" },
  { tool: "Instant Data Scraper",            note: "Chrome extension — no code required" },
  { tool: "Apollo (free plan)",              note: "50 export credits/mo + scraper credits" },
  { tool: "Email Permutator",                note: "Predict email patterns for manual validation" },
  { tool: "LeadMagic / Clay (freemium)",     note: "Basic email validation at no cost" },
];

const BEGINNER_ROWS = [
  { layer: "Data",        tool: "LinkedIn Sales Navigator", cost: "$80" },
  { layer: "Scraping",    tool: "Apify (Apollo scraper)",   cost: "$35" },
  { layer: "Outreach",    tool: "Smartlead (Basic)",        cost: "$39" },
  { layer: "Infra",       tool: "2 Sending Domains",        cost: "$30" },
  { layer: "Mailboxes",   tool: "6 accounts @ $4.5 each",  cost: "$27" },
  { layer: "LinkedIn",    tool: "Aimfox → Heyreach",        cost: "$39–79" },
  { layer: "Validation",  tool: "MillionVerifier",          cost: "$30" },
];

const ADVANCED_ROWS = [
  { layer: "Data",        tool: "LinkedIn Sales Navigator", cost: "$80" },
  { layer: "Enrichment",  tool: "Clay",                     cost: "$314" },
  { layer: "Data Source", tool: "Ocean.io",                 cost: "$79" },
  { layer: "Validation",  tool: "LeadMagic",                cost: "$100" },
  { layer: "Scraping",    tool: "Apify (Apollo scraper)",   cost: "$35" },
  { layer: "Outreach",    tool: "Smartlead Pro / Instantly",cost: "$97" },
  { layer: "Infra",       tool: "Zapmail / Smartlead — 15 domains", cost: "$250" },
  { layer: "Mailboxes",   tool: "45 accounts @ $4.5 each", cost: "$200" },
  { layer: "LinkedIn",    tool: "Heyreach",                 cost: "$79" },
  { layer: "Copywriting", tool: "Twain",                    cost: "$115" },
];

const StackTable = ({ rows, total }: { rows: { layer: string; tool: string; cost: string }[]; total: string }) => (
  <div className="rounded-lg border border-border overflow-hidden mt-4">
    <div className="grid grid-cols-[100px_1fr_80px] text-[11px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/50 px-4 py-2.5">
      <span>Layer</span><span>Tool</span><span className="text-right">Cost</span>
    </div>
    <div className="divide-y divide-border/40">
      {rows.map((r) => (
        <div key={r.tool} className="grid grid-cols-[100px_1fr_80px] items-center px-4 py-2.5 text-sm hover:bg-muted/20 transition-colors">
          <span className="text-[11px] font-medium text-muted-foreground">{r.layer}</span>
          <span className="text-foreground">{r.tool}</span>
          <span className="text-right font-semibold text-foreground">{r.cost}</span>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-[100px_1fr_80px] items-center px-4 py-3 bg-muted/30 border-t border-border">
      <span />
      <span className="text-sm font-bold text-foreground">Total</span>
      <span className="text-right text-sm font-bold text-primary">{total}</span>
    </div>
  </div>
);

const GtmApproachesTab = () => (
  <div className="space-y-5">
    {/* Zero-Budget */}
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-background p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-base">🆓</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">Zero-Budget Stack</h3>
            <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">$0 / month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ideal for solo founders or early GTM experiments. Requires more manual work but produces excellent results when done with focus.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FREE_TOOLS.map((item) => (
          <div key={item.tool} className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-white/60 px-3 py-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">{item.tool}</p>
              <p className="text-[11px] text-muted-foreground">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Beginner Stack */}
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-background p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-base">🚀</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">Beginner Stack</h3>
            <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">≈ $280 / month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            For small teams or early agencies ready to automate part of their workflow. Runs 1–2 campaigns/month with 5–10K leads total.
          </p>
        </div>
      </div>
      <StackTable rows={BEGINNER_ROWS} total="≈ $280/mo" />
    </div>

    {/* Advanced Stack */}
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-background p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-base">⚡</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">Advanced Stack</h3>
            <span className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">$1,200+ / month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            For scaling agencies or companies running multiple ICP campaigns simultaneously — managing 5–10+ clients or multi-segment campaigns (SaaS + FinTech + HRTech).
          </p>
        </div>
      </div>
      <StackTable rows={ADVANCED_ROWS} total="≈ $1,349/mo" />
    </div>
  </div>
);

// ── GTM Stack Tab ──────────────────────────────────────────────────────────

interface GtmStackTabProps {
  layers: DbLayer[];
  loading: boolean;
  phase: Phase;
  setPhase: (p: Phase) => void;
  layersForPhase: typeof GTM_LAYER_CONFIGS;
  openLayer: number | null;
  setOpenLayer: (n: number | null) => void;
  upsertLayer: (n: number, patch: Partial<DbLayer>) => void;
  setToolPlan: (n: number, layer: DbLayer | undefined, tool: string, plan: string) => void;
  movePhase: (n: number, p: Phase) => void;
}

const GtmStackTab = ({
  layers, loading, phase, setPhase, layersForPhase,
  openLayer, setOpenLayer, upsertLayer, setToolPlan, movePhase,
}: GtmStackTabProps) => {
  const completedCount = layers.filter((l) => l.is_complete).length;
  const totalConfigured = layers.length;

  return (
    <div className="space-y-5">
      <BudgetSummary layers={layers} />

      {/* Phase tabs */}
      <div className="grid grid-cols-3 gap-2">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const active = phase === p.key;
          const count = layers.filter((l) => (l.phase ?? DEFAULT_PHASE_FOR_LAYER[l.layer_number]) === p.key).length;
          return (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={`text-left rounded-xl border p-3.5 transition-all ${
                active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-xs font-bold ${active ? "text-primary" : "text-foreground"}`}>{p.label}</p>
                <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{p.description}</p>
            </button>
          );
        })}
      </div>

      {/* Progress */}
      {totalConfigured > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(completedCount / 8) * 100}%` }}
            />
          </div>
          <span>{completedCount} of 8 layers complete</span>
        </div>
      )}

      {/* Layers */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : layersForPhase.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm font-medium">No layers in this phase</p>
          <p className="text-xs mt-0.5">Use the phase dropdown on any layer to move it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {layersForPhase.map((cfg) => {
            const layer = layers.find((l) => l.layer_number === cfg.number);
            const isOpen = openLayer === cfg.number;
            const layerPhase = layer?.phase ?? DEFAULT_PHASE_FOR_LAYER[cfg.number] ?? "pre_launch";
            const toolPlans: Record<string, string> = layer?.calculator_data?.tool_plans ?? {};
            const checkedCount = (layer?.tools_selected ?? []).length;

            return (
              <div key={cfg.number} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenLayer(isOpen ? null : cfg.number)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                    {cfg.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{cfg.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{cfg.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {checkedCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">{checkedCount} tool{checkedCount !== 1 ? "s" : ""}</span>
                    )}
                    {layer?.is_complete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-border" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-3 border-t border-border bg-muted/5 space-y-4">
                    {/* Phase mover */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground shrink-0">Phase:</Label>
                      <Select value={layerPhase} onValueChange={(v) => movePhase(cfg.number, v as Phase)}>
                        <SelectTrigger className="h-7 text-xs bg-background w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PHASES.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tools */}
                    <div>
                      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tools</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                        {cfg.toolOptions.map((t) => {
                          const checked = (layer?.tools_selected ?? []).includes(t);
                          const hasPlans = !!TOOL_PLANS[t];
                          return (
                            <div key={t}>
                              <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                                checked ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:border-primary/30"
                              }`}>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => {
                                    const tools = layer?.tools_selected ?? [];
                                    upsertLayer(cfg.number, { tools_selected: checked ? tools.filter((x) => x !== t) : [...tools, t] });
                                  }}
                                />
                                <span className="text-foreground flex-1 text-sm">{t}</span>
                                {hasPlans && checked && toolPlans[t] && (
                                  <span className="text-[10px] text-primary truncate max-w-[80px]">{toolPlans[t]}</span>
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
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Calculator</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {cfg.calculator.map((f) => (
                            <div key={f.key}>
                              <Label className="text-xs mb-1 block text-muted-foreground">
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
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</Label>
                      <Textarea
                        value={layer?.comments ?? ""}
                        onChange={(e) => upsertLayer(cfg.number, { comments: e.target.value })}
                        placeholder="Context, decisions, next steps…"
                        className="mt-1.5 min-h-[64px] text-sm resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={!!layer?.is_complete}
                          onCheckedChange={(v) => upsertLayer(cfg.number, { is_complete: !!v })}
                        />
                        <span className="text-foreground">Mark layer as complete</span>
                      </label>
                      <Button size="sm" variant="ghost" className="text-muted-foreground h-7 text-xs" onClick={() => toast({ title: "Changes auto-saved" })}>
                        <Save className="w-3 h-3 mr-1" /> Auto-saved
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

// ── Main panel ─────────────────────────────────────────────────────────────

const GtmStackPanel = ({ companies }: Props) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(companies[0]?.slug ?? "");
  const [mainTab, setMainTab] = useState<MainTab>("stack");
  const [phase, setPhase] = useState<Phase>("pre_launch");
  const [layers, setLayers] = useState<DbLayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [openLayer, setOpenLayer] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedSlug && companies[0]) setSelectedSlug(companies[0].slug);
  }, [companies, selectedSlug]);

  const refresh = async () => {
    if (!selectedSlug) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("gtm_layers")
      .select("*")
      .eq("company_slug", selectedSlug)
      .order("layer_number");
    setLayers((data as DbLayer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [selectedSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const company = companies.find((c) => c.slug === selectedSlug);
  const totalLeadsCapacity = useMemo(() => computeBudget(layers).totalContacts, [layers]);

  const layersForPhase = useMemo(() => {
    return GTM_LAYER_CONFIGS.filter((cfg) => {
      const existing = layers.find((l) => l.layer_number === cfg.number);
      return (existing?.phase ?? DEFAULT_PHASE_FOR_LAYER[cfg.number] ?? "pre_launch") === phase;
    });
  }, [phase, layers]);

  const upsertLayer = async (layerNumber: number, patch: Partial<DbLayer>) => {
    if (!selectedSlug) return;
    const existing = layers.find((l) => l.layer_number === layerNumber);
    const merged: DbLayer = {
      company_slug: selectedSlug,
      layer_number: layerNumber,
      tools_selected: existing?.tools_selected ?? [],
      comments: existing?.comments ?? "",
      calculator_data: existing?.calculator_data ?? {},
      is_complete: existing?.is_complete ?? false,
      phase: existing?.phase ?? DEFAULT_PHASE_FOR_LAYER[layerNumber] ?? "pre_launch",
      ...patch,
    };
    setLayers((prev) => [...prev.filter((l) => l.layer_number !== layerNumber), merged].sort((a, b) => a.layer_number - b.layer_number));
    await (supabase as any)
      .from("gtm_layers")
      .upsert(
        { company_slug: selectedSlug, layer_number: layerNumber, tools_selected: merged.tools_selected, comments: merged.comments, calculator_data: merged.calculator_data, is_complete: merged.is_complete, phase: merged.phase },
        { onConflict: "company_slug,layer_number" },
      );
  };

  const setToolPlan = (layerNumber: number, layer: DbLayer | undefined, tool: string, planName: string) => {
    const calc = layer?.calculator_data ?? {};
    upsertLayer(layerNumber, { calculator_data: { ...calc, tool_plans: { ...(calc.tool_plans ?? {}), [tool]: planName } } });
  };

  const movePhase = async (layerNumber: number, newPhase: Phase) => {
    await upsertLayer(layerNumber, { phase: newPhase });
    toast({ title: `Layer ${layerNumber} moved to ${PHASES.find((p) => p.key === newPhase)?.label}` });
  };

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground text-sm">
        Add a company first in the Companies section.
      </div>
    );
  }

  const completed = layers.filter((l) => l.is_complete).length;

  return (
    <div className="space-y-6">
      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-card">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative px-5 md:px-7 py-5 md:py-6 flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Layers className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
                GTM Workspace
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                {company?.name ?? "Select a company"}
              </h2>
              <div className="mt-1.5 flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <strong className="text-foreground">{completed}</strong>/8 layers complete
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <strong className="text-foreground">{totalLeadsCapacity.toLocaleString()}</strong> leads/mo capacity
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:shrink-0">
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="w-full sm:w-[220px] bg-background h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab nav */}
        <div className="relative flex border-t border-border bg-card/40 backdrop-blur-sm overflow-x-auto">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = mainTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setMainTab(tab.key)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {active && (
                  <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-t-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {mainTab === "stack" && (
        <GtmStackTab
          layers={layers}
          loading={loading}
          phase={phase}
          setPhase={setPhase}
          layersForPhase={layersForPhase}
          openLayer={openLayer}
          setOpenLayer={setOpenLayer}
          upsertLayer={upsertLayer}
          setToolPlan={setToolPlan}
          movePhase={movePhase}
        />
      )}
      {mainTab === "forecast" && <LeadForecastTab defaultLeads={totalLeadsCapacity} />}
      {mainTab === "approaches" && <GtmApproachesTab />}
    </div>
  );
};

export default GtmStackPanel;
