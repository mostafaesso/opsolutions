import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Enhancement {
  id: string;
  company_slug: string;
  title: string;
  description: string | null;
  before_url: string;
  after_url: string;
  category: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  visibility: "all" | "managers" | "admins";
}

export const useEnhancements = (companySlug: string | undefined) => {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) return;
    fetchEnhancements();
  }, [companySlug]);

  const fetchEnhancements = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("enhancements")
        .select("*")
        .eq("company_slug", companySlug)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setEnhancements(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEnhancement = async (
    title: string,
    beforeUrl: string,
    afterUrl: string,
    createdBy: string,
    description?: string,
    category?: string,
    visibility?: "all" | "managers" | "admins"
  ) => {
    try {
      const { data, error: err } = await supabase
        .from("enhancements")
        .insert({
          company_slug: companySlug,
          title,
          description,
          before_url: beforeUrl,
          after_url: afterUrl,
          category,
          created_by: createdBy,
          visibility: visibility || "all",
        })
        .select()
        .single();

      if (err) throw err;
      setEnhancements([data, ...enhancements]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEnhancement = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("enhancements")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setEnhancements(enhancements.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { enhancements, loading, error, createEnhancement, deleteEnhancement, fetchEnhancements };
};
