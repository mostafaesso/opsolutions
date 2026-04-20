import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  default_video_url: string | null;
  default_notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyTrainingAssignment {
  id: string;
  company_slug: string;
  module_id: string;
  custom_title: string | null;
  custom_description: string | null;
  custom_video_url: string | null;
  custom_notes: string | null;
  is_visible: boolean;
  sort_order: number;
}

export const useTrainingModules = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("training_modules")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setModules((data as TrainingModule[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async (input: Partial<TrainingModule> & { title: string }) => {
    await (supabase as any).from("training_modules").insert({
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? null,
      default_video_url: input.default_video_url ?? null,
      default_notes: input.default_notes ?? null,
      sort_order: modules.length,
    });
    await refresh();
  };

  const update = async (id: string, patch: Partial<TrainingModule>) => {
    await (supabase as any)
      .from("training_modules")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    await refresh();
  };

  const remove = async (id: string) => {
    await (supabase as any).from("training_modules").delete().eq("id", id);
    await refresh();
  };

  return { modules, loading, create, update, remove, refresh };
};

export const useCompanyAssignments = (companySlug: string | undefined) => {
  const [assignments, setAssignments] = useState<CompanyTrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!companySlug) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("company_training_assignments")
      .select("*")
      .eq("company_slug", companySlug)
      .order("sort_order", { ascending: true });
    setAssignments((data as CompanyTrainingAssignment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  const assign = async (moduleId: string) => {
    if (!companySlug) return;
    await (supabase as any)
      .from("company_training_assignments")
      .upsert(
        { company_slug: companySlug, module_id: moduleId, is_visible: true, sort_order: assignments.length },
        { onConflict: "company_slug,module_id" }
      );
    await refresh();
  };

  const updateAssignment = async (id: string, patch: Partial<CompanyTrainingAssignment>) => {
    await (supabase as any)
      .from("company_training_assignments")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    await refresh();
  };

  const unassign = async (id: string) => {
    await (supabase as any).from("company_training_assignments").delete().eq("id", id);
    await refresh();
  };

  return { assignments, loading, assign, updateAssignment, unassign, refresh };
};
