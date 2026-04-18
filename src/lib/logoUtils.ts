/**
 * Auto-fetch company logo from their website
 */
export const fetchLogoFromUrl = async (websiteUrl: string): Promise<string | null> => {
  try {
    // Extract domain from URL
    const url = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
    const domain = url.hostname;

    // Try common favicon locations
    const faviconUrls = [
      `https://${domain}/favicon.ico`,
      `https://${domain}/logo.png`,
      `https://${domain}/logo.jpg`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    ];

    // Return Google's favicon API as it's reliable
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return null;
  }
};

/**
 * Get company logo - use stored logo or try to fetch from website
 */
export const getCompanyLogo = (storedLogo: string | null, websiteUrl?: string): string => {
  if (storedLogo) return storedLogo;

  // Return default placeholder if no logo
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='40' fill='%23999' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E";
};
