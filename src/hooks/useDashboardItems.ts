import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardItem {
  id: string;
  company_slug: string;
  name: string;
  description: string | null;
  logic_prompt: string | null;
  data_definition: any | null;
  filter_team: boolean;
  filter_date: boolean;
  filter_region: boolean;
  iframe_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReportItem {
  id: string;
  company_slug: string;
  name: string;
  description: string | null;
  logic_prompt: string | null;
  data_definition: any | null;
  filter_team: boolean;
  filter_date: boolean;
  filter_region: boolean;
  iframe_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type NewDashboard = Omit<DashboardItem, "id" | "created_at" | "updated_at">;
type NewReport = Omit<ReportItem, "id" | "created_at" | "updated_at">;

export const useDashboardItems = (companySlug: string) => {
  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [dbRes, rpRes] = await Promise.all([
      (supabase as any).from("company_dashboards").select("*").eq("company_slug", companySlug).order("sort_order"),
      (supabase as any).from("company_reports").select("*").eq("company_slug", companySlug).order("sort_order"),
    ]);
    setDashboards(dbRes.data ?? []);
    setReports(rpRes.data ?? []);
    setLoading(false);
  }, [companySlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDashboard = async (item: NewDashboard) => {
    const { error } = await (supabase as any).from("company_dashboards").insert(item);
    if (error) throw error;
    await refresh();
  };

  const updateDashboard = async (id: string, patch: Partial<DashboardItem>) => {
    const { error } = await (supabase as any)
      .from("company_dashboards")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const deleteDashboard = async (id: string) => {
    const { error } = await (supabase as any).from("company_dashboards").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const addReport = async (item: NewReport) => {
    const { error } = await (supabase as any).from("company_reports").insert(item);
    if (error) throw error;
    await refresh();
  };

  const updateReport = async (id: string, patch: Partial<ReportItem>) => {
    const { error } = await (supabase as any)
      .from("company_reports")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const deleteReport = async (id: string) => {
    const { error } = await (supabase as any).from("company_reports").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  return {
    dashboards,
    reports,
    loading,
    refresh,
    addDashboard,
    updateDashboard,
    deleteDashboard,
    addReport,
    updateReport,
    deleteReport,
  };
};
