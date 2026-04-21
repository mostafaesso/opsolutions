import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanySettings {
  company_slug: string;
  training_doc_enabled: boolean;
  training_video_enabled: boolean;
  crm_updates_employee_visible: boolean;
  dashboards_enabled: boolean;
  dashboards_permission: "view_only" | "edit";
}

const DEFAULTS: Omit<CompanySettings, "company_slug"> = {
  training_doc_enabled: true,
  training_video_enabled: true,
  crm_updates_employee_visible: false,
  dashboards_enabled: false,
  dashboards_permission: "view_only",
};

export const useCompanySettings = (companySlug: string | undefined) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!companySlug) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("company_settings")
      .select("*")
      .eq("company_slug", companySlug)
      .maybeSingle();

    if (data) {
      setSettings(data as CompanySettings);
    } else {
      setSettings({ company_slug: companySlug, ...DEFAULTS });
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  const update = async (patch: Partial<Omit<CompanySettings, "company_slug">>) => {
    if (!companySlug) return;
    const next = { ...(settings ?? { company_slug: companySlug, ...DEFAULTS }), ...patch };
    setSettings(next);
    await (supabase as any)
      .from("company_settings")
      .upsert(
        {
          company_slug: companySlug,
          training_doc_enabled: next.training_doc_enabled,
          training_video_enabled: next.training_video_enabled,
          crm_updates_employee_visible: next.crm_updates_employee_visible,
          dashboards_enabled: next.dashboards_enabled,
          dashboards_permission: next.dashboards_permission,
        },
        { onConflict: "company_slug" }
      );
  };

  return { settings: settings ?? { company_slug: companySlug ?? "", ...DEFAULTS }, loading, update, refresh };
};
