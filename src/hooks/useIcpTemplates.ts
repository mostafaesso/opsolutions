import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IcpTemplate {
  id: string;
  name: string;
  description: string | null;
  // Tier
  tier: string | null;
  personalization_level: string | null;
  // Company-level
  industry: string | null;
  company_size: string | null;
  geography: string | null;
  funding_stage: string | null;
  hiring_activity: string | null;
  tech_stack: string | null;
  growth_signals: string | null;
  // Contact-level
  job_titles: string[];
  departments: string | null;
  seniority: string | null;
  buying_role: string | null;
  // Strategy
  pain_points: string | null;
  buying_triggers: string | null;
  decision_process: string | null;
  exclusions: string | null;
  disqualifiers: string | null;
  budget_range: string | null;
  goals: string | null;
  // Validation
  tam_estimate: string | null;
  validation_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type IcpTemplateInput = Partial<Omit<IcpTemplate, "id" | "created_at" | "updated_at">>;

export const useIcpTemplates = () => {
  const [templates, setTemplates] = useState<IcpTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("icp_templates")
      .select("*")
      .order("created_at", { ascending: false });
    setTemplates((data as IcpTemplate[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async (input: IcpTemplateInput & { name: string }) => {
    const { data } = await (supabase as any)
      .from("icp_templates")
      .insert({ ...input, job_titles: input.job_titles ?? [] })
      .select()
      .single();
    await refresh();
    return data as IcpTemplate;
  };

  const update = async (id: string, patch: IcpTemplateInput) => {
    await (supabase as any)
      .from("icp_templates")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    await refresh();
  };

  const remove = async (id: string) => {
    await (supabase as any).from("icp_templates").delete().eq("id", id);
    await refresh();
  };

  return { templates, loading, create, update, remove, refresh };
};

export interface CompanyIcp {
  id?: string;
  company_slug: string;
  template_id: string | null;
  name: string | null;
  description: string | null;
  tier: string | null;
  personalization_level: string | null;
  industry: string | null;
  company_size: string | null;
  geography: string | null;
  funding_stage: string | null;
  hiring_activity: string | null;
  tech_stack: string | null;
  growth_signals: string | null;
  job_titles: string[];
  departments: string | null;
  seniority: string | null;
  buying_role: string | null;
  pain_points: string | null;
  buying_triggers: string | null;
  decision_process: string | null;
  exclusions: string | null;
  disqualifiers: string | null;
  budget_range: string | null;
  goals: string | null;
  tam_estimate: string | null;
  validation_notes: string | null;
  notes: string | null;
}

const EMPTY_COMPANY_ICP = (slug: string): CompanyIcp => ({
  company_slug: slug,
  template_id: null,
  name: null,
  description: null,
  tier: null,
  personalization_level: null,
  industry: null,
  company_size: null,
  geography: null,
  funding_stage: null,
  hiring_activity: null,
  tech_stack: null,
  growth_signals: null,
  job_titles: [],
  departments: null,
  seniority: null,
  buying_role: null,
  pain_points: null,
  buying_triggers: null,
  decision_process: null,
  exclusions: null,
  disqualifiers: null,
  budget_range: null,
  goals: null,
  tam_estimate: null,
  validation_notes: null,
  notes: null,
});

const COMPANY_ICP_COLUMNS: (keyof CompanyIcp)[] = [
  "company_slug","template_id","name","description","tier","personalization_level",
  "industry","company_size","geography","funding_stage","hiring_activity","tech_stack","growth_signals",
  "job_titles","departments","seniority","buying_role",
  "pain_points","buying_triggers","decision_process","exclusions","disqualifiers","budget_range","goals",
  "tam_estimate","validation_notes","notes",
];

export const useCompanyIcp = (companySlug: string | undefined) => {
  const [icp, setIcp] = useState<CompanyIcp | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!companySlug) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("company_icp")
      .select("*")
      .eq("company_slug", companySlug)
      .maybeSingle();
    setIcp((data as CompanyIcp) ?? EMPTY_COMPANY_ICP(companySlug));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  const save = async (patch: Partial<CompanyIcp>) => {
    if (!companySlug) return;
    const next: CompanyIcp = { ...(icp ?? EMPTY_COMPANY_ICP(companySlug)), ...patch, company_slug: companySlug };
    setIcp(next);
    const payload: any = {};
    for (const k of COMPANY_ICP_COLUMNS) payload[k] = (next as any)[k];
    await (supabase as any)
      .from("company_icp")
      .upsert(payload, { onConflict: "company_slug" });
  };

  const applyTemplate = async (template: IcpTemplate) => {
    if (!companySlug) return;
    await save({
      template_id: template.id,
      name: template.name,
      description: template.description,
      tier: template.tier,
      personalization_level: template.personalization_level,
      industry: template.industry,
      company_size: template.company_size,
      geography: template.geography,
      funding_stage: template.funding_stage,
      hiring_activity: template.hiring_activity,
      tech_stack: template.tech_stack,
      growth_signals: template.growth_signals,
      job_titles: template.job_titles,
      departments: template.departments,
      seniority: template.seniority,
      buying_role: template.buying_role,
      pain_points: template.pain_points,
      buying_triggers: template.buying_triggers,
      decision_process: template.decision_process,
      exclusions: template.exclusions,
      disqualifiers: template.disqualifiers,
      budget_range: template.budget_range,
      goals: template.goals,
      tam_estimate: template.tam_estimate,
      validation_notes: template.validation_notes,
      notes: template.notes,
    });
  };

  return { icp: icp ?? (companySlug ? EMPTY_COMPANY_ICP(companySlug) : null), loading, save, applyTemplate, refresh };
};
