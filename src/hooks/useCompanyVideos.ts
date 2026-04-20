import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyVideo {
  id: string;
  company_slug: string;
  title: string;
  url: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export const useCompanyVideos = (companySlug: string | undefined) => {
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!companySlug) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("company_videos")
      .select("*")
      .eq("company_slug", companySlug)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setVideos((data as CompanyVideo[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  const add = async (input: { title: string; url: string; description?: string }) => {
    if (!companySlug) return;
    await (supabase as any).from("company_videos").insert({
      company_slug: companySlug,
      title: input.title,
      url: input.url,
      description: input.description ?? null,
      sort_order: videos.length,
    });
    await refresh();
  };

  const remove = async (id: string) => {
    await (supabase as any).from("company_videos").delete().eq("id", id);
    await refresh();
  };

  return { videos, loading, add, remove, refresh };
};
