import { useState, useEffect } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Cast to any: hubspot_credentials table not yet in generated types
const supabase = supabaseClient as any;

export interface HubSpotCredential {
  id: string;
  company_slug: string;
  private_app_token: string;
  created_at: string;
  updated_at: string;
}

export const useHubSpotCredentials = (companySlug: string | undefined) => {
  const [credential, setCredential] = useState<HubSpotCredential | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) return;
    fetchCredential();
  }, [companySlug]);

  const fetchCredential = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("hubspot_credentials")
        .select("*")
        .eq("company_slug", companySlug)
        .maybeSingle();

      if (err) throw err;
      setCredential(data || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveCredential = async (privateAppToken: string) => {
    try {
      // Check if already exists
      const existing = credential;

      if (existing) {
        const { data, error: err } = await supabase
          .from("hubspot_credentials")
          .update({ private_app_token: privateAppToken })
          .eq("company_slug", companySlug)
          .select()
          .single();

        if (err) throw err;
        setCredential(data);
        return data;
      } else {
        const { data, error: err } = await supabase
          .from("hubspot_credentials")
          .insert({
            company_slug: companySlug,
            private_app_token: privateAppToken,
          })
          .select()
          .single();

        if (err) throw err;
        setCredential(data);
        return data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCredential = async () => {
    try {
      const { error: err } = await supabase
        .from("hubspot_credentials")
        .delete()
        .eq("company_slug", companySlug);

      if (err) throw err;
      setCredential(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { credential, loading, error, saveCredential, deleteCredential, fetchCredential };
};
