import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IcpTemplate {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  geography: string | null;
  job_titles: string[];
  pain_points: string | null;
  buying_triggers: string | null;
  decision_process: string | null;
  disqualifiers: string | null;
  budget_range: string | null;
  goals: string | null;
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
  industry: string | null;
  company_size: string | null;
  geography: string | null;
  job_titles: string[];
  pain_points: string | null;
  buying_triggers: string | null;
  decision_process: string | null;
  disqualifiers: string | null;
  budget_range: string | null;
  goals: string | null;
  notes: string | null;
}

const EMPTY_COMPANY_ICP = (slug: string): CompanyIcp => ({
  company_slug: slug,
  template_id: null,
  name: null,
  description: null,
  industry: null,
  company_size: null,
  geography: null,
  job_titles: [],
  pain_points: null,
  buying_triggers: null,
  decision_process: null,
  disqualifiers: null,
  budget_range: null,
  goals: null,
  notes: null,
});

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
    await (supabase as any)
      .from("company_icp")
      .upsert(
        {
          company_slug: companySlug,
          template_id: next.template_id,
          name: next.name,
          description: next.description,
          industry: next.industry,
          company_size: next.company_size,
          geography: next.geography,
          job_titles: next.job_titles,
          pain_points: next.pain_points,
          buying_triggers: next.buying_triggers,
          decision_process: next.decision_process,
          disqualifiers: next.disqualifiers,
          budget_range: next.budget_range,
          goals: next.goals,
          notes: next.notes,
        },
        { onConflict: "company_slug" }
      );
  };

  const applyTemplate = async (template: IcpTemplate) => {
    if (!companySlug) return;
    await save({
      template_id: template.id,
      name: template.name,
      description: template.description,
      industry: template.industry,
      company_size: template.company_size,
      geography: template.geography,
      job_titles: template.job_titles,
      pain_points: template.pain_points,
      buying_triggers: template.buying_triggers,
      decision_process: template.decision_process,
      disqualifiers: template.disqualifiers,
      budget_range: template.budget_range,
      goals: template.goals,
      notes: template.notes,
    });
  };

  return { icp: icp ?? (companySlug ? EMPTY_COMPANY_ICP(companySlug) : null), loading, save, applyTemplate, refresh };
};
