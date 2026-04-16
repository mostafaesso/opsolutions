export interface Company {
  slug: string;
  name: string;
  logoUrl: string;
  managerEmails?: string[];
}

const STORAGE_KEY = "training-companies";

export const getCompanies = (): Company[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

export const getCompanyBySlug = (slug: string): Company | undefined => {
  return getCompanies().find((c) => c.slug === slug);
};

export const addCompany = (company: Company): Company[] => {
  const companies = getCompanies();
  companies.push(company);
  saveCompanies(companies);
  return companies;
};

export const removeCompany = (slug: string): Company[] => {
  const companies = getCompanies().filter((c) => c.slug !== slug);
  saveCompanies(companies);
  // Also clean up company-specific media
  localStorage.removeItem(`training-extra-media-${slug}`);
  return companies;
};

// Media helpers scoped per company
export const getMediaKey = (companySlug?: string): string => {
  return companySlug ? `training-extra-media-${companySlug}` : "training-extra-media";
};
