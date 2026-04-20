import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Lightbulb, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CommentThread from "@/components/CommentThread";

interface GTMStep {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  hubspot_integration_note: string | null;
}

interface GTMTool {
  id: string;
  step_id: string;
  tier: string;
  tool_name: string;
  tool_url: string | null;
  monthly_cost: number;
  notes: string | null;
  order_index: number;
}

interface GTMAccess {
  is_active: boolean;
  tiers_visible: string[];
}

interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
}

interface GTMFlowProps {
  companyId: string;
  currentUser: CurrentUser;
}

type Tier = "free" | "mid" | "pro";

const TIER_LABELS: Record<Tier, string> = {
  free: "Free",
  mid: "$400 / mo",
  pro: "$1,500 / mo",
};

const GTMFlow = ({ companyId, currentUser }: GTMFlowProps) => {
  const [steps, setSteps] = useState<GTMStep[]>([]);
  const [tools, setTools] = useState<GTMTool[]>([]);
  const [access, setAccess] = useState<GTMAccess | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier>("free");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [{ data: acc }, { data: stepsData }, { data: toolsData }] = await Promise.all([
      (supabase as any).from("company_gtm_access").select("*").eq("company_id", companyId).maybeSingle(),
      (supabase as any).from("gtm_flow_steps").select("*").order("order_index"),
      (supabase as any).from("gtm_tier_tools").select("*").order("order_index"),
    ]);
    setAccess(acc);
    setSteps(stepsData || []);
    setTools(toolsData || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading GTM flow…</p>;

  if (!access?.is_active) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <BarChart2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">GTM Flow is not enabled for your account.</p>
        <p className="text-xs text-muted-foreground mt-1">Contact your Ops Solutions representative to activate this module.</p>
      </div>
    );
  }

  const visibleTiers = (access.tiers_visible || ["free", "mid", "pro"]) as Tier[];
  const activeTier = visibleTiers.includes(selectedTier) ? selectedTier : visibleTiers[0];

  const toolsForStep = (stepId: string) =>
    tools.filter(t => t.step_id === stepId && t.tier === activeTier)
      .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">GTM Flow</h2>
        <p className="text-sm text-muted-foreground mt-1">
          End-to-end go-to-market toolstack across 6 stages. Select a tier to see recommended tools.
        </p>
      </div>

      {/* Step progression bar */}
      <div className="hidden md:flex items-center gap-0 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center shrink-0">
            <button
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                expandedStep === step.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                expandedStep === step.id ? "bg-white/20" : "bg-muted"
              }`}>
                {i + 1}
              </span>
              {step.title}
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Tier toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        {visibleTiers.map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTier === tier
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TIER_LABELS[tier]}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const stepTools = toolsForStep(step.id);
          const isOpen = expandedStep === step.id;
          return (
            <div key={step.id} className={`rounded-2xl border transition-all ${isOpen ? "border-primary/30 shadow-sm" : "border-border"} bg-card overflow-hidden`}>
              {/* Step header */}
              <button
                onClick={() => setExpandedStep(isOpen ? null : step.id)}
                className="flex items-center gap-4 w-full p-5 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                  isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{step.title}</p>
                  {!isOpen && step.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{step.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">{stepTools.length} tools</span>
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-border px-5 pb-6 space-y-6 pt-5">
                  {/* Description */}
                  {step.description && (
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  )}

                  {/* Tools grid */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      {TIER_LABELS[activeTier]} Tools
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stepTools.map(tool => (
                        <div key={tool.id} className="rounded-xl border border-border bg-background p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground leading-tight">{tool.tool_name}</p>
                            {tool.tool_url && (
                              <a
                                href={tool.tool_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs font-medium text-primary">
                            {tool.monthly_cost === 0 ? "Free" : `$${tool.monthly_cost}/mo`}
                          </p>
                          {tool.notes && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{tool.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HubSpot integration note */}
                  {step.hubspot_integration_note && (
                    <div className="rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[#FF6B35] shrink-0" />
                        <p className="text-xs font-semibold text-[#FF6B35]">HubSpot Integration Note</p>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{step.hubspot_integration_note}</p>
                    </div>
                  )}

                  {/* Comment thread */}
                  <div className="border-t border-border pt-5">
                    <CommentThread
                      moduleId={step.id}
                      moduleType="gtm"
                      companyId={companyId}
                      currentUser={currentUser}
                      canComment={true}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GTMFlow;
