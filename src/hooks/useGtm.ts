import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GtmIcp {
  company_slug: string;
  industry: string | null;
  company_size: string | null;
  geography: string | null;
  job_titles: string[];
  pain_points: string | null;
  buying_triggers: string | null;
  notes: string | null;
}

export interface GtmLayer {
  id?: string;
  company_slug: string;
  layer_number: number;
  tools_selected: string[];
  comments: string | null;
  calculator_data: Record<string, any>;
  is_complete: boolean;
}

const ICP_DEFAULT: Omit<GtmIcp, "company_slug"> = {
  industry: "",
  company_size: "",
  geography: "",
  job_titles: [],
  pain_points: "",
  buying_triggers: "",
  notes: "",
};

export const useGtmIcp = (companySlug: string | undefined) => {
  const [icp, setIcp] = useState<GtmIcp | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!companySlug) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("gtm_icp")
      .select("*")
      .eq("company_slug", companySlug)
      .maybeSingle();
    setIcp(
      data
        ? (data as GtmIcp)
        : { company_slug: companySlug, ...ICP_DEFAULT }
    );
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  const save = async (patch: Partial<GtmIcp>) => {
    if (!companySlug) return;
    const next = { ...(icp ?? { company_slug: companySlug, ...ICP_DEFAULT }), ...patch };
    setIcp(next);
    await (supabase as any)
      .from("gtm_icp")
      .upsert({ ...next, company_slug: companySlug }, { onConflict: "company_slug" });
  };

  return { icp: icp ?? { company_slug: companySlug ?? "", ...ICP_DEFAULT }, loading, save, refresh };
};

export const useGtmLayers = (companySlug: string | undefined) => {
  const [layers, setLayers] = useState<GtmLayer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!companySlug) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("gtm_layers")
      .select("*")
      .eq("company_slug", companySlug)
      .order("layer_number", { ascending: true });
    setLayers((data as GtmLayer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  const upsertLayer = async (layerNumber: number, patch: Partial<GtmLayer>) => {
    if (!companySlug) return;
    const existing = layers.find((l) => l.layer_number === layerNumber);
    const merged: GtmLayer = {
      company_slug: companySlug,
      layer_number: layerNumber,
      tools_selected: existing?.tools_selected ?? [],
      comments: existing?.comments ?? "",
      calculator_data: existing?.calculator_data ?? {},
      is_complete: existing?.is_complete ?? false,
      ...patch,
    };
    // Optimistic
    setLayers((prev) => {
      const others = prev.filter((l) => l.layer_number !== layerNumber);
      return [...others, merged].sort((a, b) => a.layer_number - b.layer_number);
    });
    await (supabase as any)
      .from("gtm_layers")
      .upsert(
        {
          company_slug: companySlug,
          layer_number: layerNumber,
          tools_selected: merged.tools_selected,
          comments: merged.comments,
          calculator_data: merged.calculator_data,
          is_complete: merged.is_complete,
        },
        { onConflict: "company_slug,layer_number" }
      );
  };

  return { layers, loading, upsertLayer, refresh };
};
