import { supabase } from "@/integrations/supabase/client";

export interface Company {
  slug: string;
  name: string;
  logoUrl: string;
  managerEmails?: string[];
  isActive?: boolean;
  customDomain?: string | null;
}

export interface CompanyMedia {
  id: string;
  step_key: string;
  url: string;
  caption?: string;
}

export const fetchCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    slug: c.slug,
    name: c.name,
    logoUrl: c.logo_url,
    managerEmails: c.manager_emails || [],
    isActive: c.is_active ?? true,
    customDomain: c.custom_domain ?? null,
  }));
};

export const fetchCompanyBySlug = async (slug: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const d: any = data;
  return {
    slug: d.slug,
    name: d.name,
    logoUrl: d.logo_url,
    managerEmails: d.manager_emails || [],
    isActive: d.is_active ?? true,
    customDomain: d.custom_domain ?? null,
  };
};

export const addCompanyToDb = async (company: Company) => {
  const { error } = await supabase.from("companies").insert({
    slug: company.slug,
    name: company.name,
    logo_url: company.logoUrl,
    manager_emails: company.managerEmails || [],
  });
  if (error) throw error;
};

export const removeCompanyFromDb = async (slug: string) => {
  const { error } = await supabase.from("companies").delete().eq("slug", slug);
  if (error) throw error;
};

export const updateCompanyInDb = async (company: Company, originalSlug?: string) => {
  const payload: any = {
    name: company.name,
    logo_url: company.logoUrl,
    manager_emails: company.managerEmails || [],
    is_active: company.isActive ?? true,
    custom_domain: company.customDomain ?? null,
    slug: company.slug,
  };
  const { error } = await supabase
    .from("companies")
    .update(payload)
    .eq("slug", originalSlug ?? company.slug);
  if (error) throw error;
};

export const setCompanyActive = async (slug: string, isActive: boolean) => {
  const { error } = await supabase
    .from("companies")
    .update({ is_active: isActive } as any)
    .eq("slug", slug);
  if (error) throw error;
};

// Media helpers
export const fetchCompanyMedia = async (companySlug: string): Promise<Record<string, CompanyMedia[]>> => {
  const { data, error } = await supabase
    .from("company_media")
    .select("*")
    .eq("company_slug", companySlug);

  if (error) throw error;
  const map: Record<string, CompanyMedia[]> = {};
  (data || []).forEach((m) => {
    if (!map[m.step_key]) map[m.step_key] = [];
    map[m.step_key].push({ id: m.id, step_key: m.step_key, url: m.url, caption: m.caption || undefined });
  });
  return map;
};

export const addCompanyMedia = async (companySlug: string, stepKey: string, url: string, caption?: string) => {
  const { error } = await supabase.from("company_media").insert({
    company_slug: companySlug,
    step_key: stepKey,
    url,
    caption: caption || null,
  });
  if (error) throw error;
};

export const removeCompanyMedia = async (id: string) => {
  const { error } = await supabase.from("company_media").delete().eq("id", id);
  if (error) throw error;
};
