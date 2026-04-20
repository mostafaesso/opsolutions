import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingOverride {
  id: string;
  company_slug: string;
  module_id: string;
  custom_notes: string | null;
  custom_video_url: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export const useTrainingOverrides = (companySlug: string | undefined) => {
  const [overrides, setOverrides] = useState<TrainingOverride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) return;
    fetchOverrides();
  }, [companySlug]);

  const fetchOverrides = async () => {
    if (!companySlug) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("company_training_overrides")
        .select("*")
        .eq("company_slug", companySlug);
      if (err) throw err;
      setOverrides((data as TrainingOverride[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOverride = (moduleId: string): TrainingOverride | undefined =>
    overrides.find((o) => o.module_id === moduleId);

  const upsertOverride = async (
    moduleId: string,
    updates: { custom_notes?: string; custom_video_url?: string; is_hidden?: boolean }
  ) => {
    if (!companySlug) return;
    setError(null);
    try {
      const existing = getOverride(moduleId);
      if (existing) {
        const { data, error: err } = await supabase
          .from("company_training_overrides")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("company_slug", companySlug)
          .eq("module_id", moduleId)
          .select()
          .single();
        if (err) throw err;
        setOverrides((prev) =>
          prev.map((o) => (o.module_id === moduleId ? (data as TrainingOverride) : o))
        );
      } else {
        const { data, error: err } = await supabase
          .from("company_training_overrides")
          .insert({ company_slug: companySlug, module_id: moduleId, ...updates })
          .select()
          .single();
        if (err) throw err;
        setOverrides((prev) => [...prev, (data as TrainingOverride)]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { overrides, loading, error, getOverride, upsertOverride, fetchOverrides };
};
