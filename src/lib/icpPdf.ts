import jsPDF from "jspdf";
import type { CompanyIcp, IcpTemplate } from "@/hooks/useIcpTemplates";
import type { Company } from "@/lib/companies";

type AnyIcp = Partial<CompanyIcp & IcpTemplate> & { name?: string | null };

const OPS_LOGO_URL = "https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png";

const fetchAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const detectFormat = (dataUrl: string): "PNG" | "JPEG" => {
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "JPEG";
  return "PNG";
};

export const generateIcpPdf = async (company: Company, icp: AnyIcp) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 36;
  const MR = 36;
  const contentW = W - ML - MR;

  // Colors
  const navy: [number, number, number] = [29, 41, 73];
  const accent: [number, number, number] = [56, 130, 246];
  const ink: [number, number, number] = [24, 28, 36];
  const muted: [number, number, number] = [110, 118, 132];
  const line: [number, number, number] = [225, 228, 234];
  const surface: [number, number, number] = [246, 247, 250];
  const white: [number, number, number] = [255, 255, 255];

  // Pre-fetch both logos in parallel
  const [companyLogoData, opsLogoData] = await Promise.all([
    company.logoUrl ? fetchAsDataUrl(company.logoUrl) : Promise.resolve(null),
    fetchAsDataUrl(OPS_LOGO_URL),
  ]);

  let pageCount = 1;
  let y = 0;

  const addHeader = () => {
    doc.setFillColor(...navy);
    doc.rect(0, 0, W, 90, "F");
    doc.setFillColor(...accent);
    doc.rect(0, 90, W, 3, "F");

    // Company logo — left
    let textX = ML;
    if (companyLogoData) {
      try {
        doc.addImage(companyLogoData, detectFormat(companyLogoData), ML, 18, 54, 54, undefined, "FAST");
        textX = ML + 62;
      } catch { /* ignore */ }
    }

    // Title
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("IDEAL CUSTOMER PROFILE", textX, 33);
    doc.setFontSize(17);
    doc.text(company.name, textX, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 205, 240);
    doc.text(icp.name || "Primary ICP", textX, 71);

    // OPS logo — right, white pill background
    if (opsLogoData) {
      try {
        doc.setFillColor(...white);
        doc.roundedRect(W - MR - 92, 20, 84, 50, 6, 6, "F");
        doc.addImage(opsLogoData, detectFormat(opsLogoData), W - MR - 86, 28, 72, 34, undefined, "FAST");
      } catch { /* ignore */ }
    }

    y = 106;
  };

  const addFooter = () => {
    doc.setDrawColor(...line);
    doc.line(ML, H - 36, W - MR, H - 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(`${company.name} · ICP Report`, ML, H - 20);
    doc.text(
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      W / 2,
      H - 20,
      { align: "center" },
    );
    doc.setTextColor(...accent);
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageCount}`, W - MR, H - 20, { align: "right" });
  };

  const ensureSpace = (need: number) => {
    if (y + need > H - 46) {
      addFooter();
      doc.addPage();
      pageCount++;
      doc.setFillColor(...navy);
      doc.rect(0, 0, W, 26, "F");
      doc.setFillColor(...accent);
      doc.rect(0, 26, W, 2, "F");
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(`${company.name.toUpperCase()} · ICP (continued)`, ML, 18);
      y = 38;
    }
  };

  const sectionHeader = (title: string) => {
    ensureSpace(22);
    doc.setFillColor(...navy);
    doc.rect(ML, y, contentW, 17, "F");
    doc.setFillColor(...accent);
    doc.rect(ML, y, 3, 17, "F");
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(title.toUpperCase(), ML + 8, y + 11.5);
    y += 20;
  };

  const fieldRow = (label: string, value?: string | null) => {
    if (!value || !String(value).trim()) return;
    const text = String(value).trim();
    const labelW = 108;
    const valueW = contentW - labelW - 4;
    const lines = doc.splitTextToSize(text, valueW) as string[];
    const rowH = Math.max(15, lines.length * 10.5 + 5);
    ensureSpace(rowH + 2);

    doc.setFillColor(...surface);
    doc.rect(ML, y, contentW, rowH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), ML + 5, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...ink);
    doc.text(lines, ML + labelW + 4, y + 10);
    y += rowH + 2;
  };

  const tagsRow = (label: string, items: string[]) => {
    const tags = items.filter(Boolean);
    if (tags.length === 0) return;
    ensureSpace(38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), ML, y + 8);
    y += 13;

    let x = ML;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const t of tags) {
      const w = doc.getTextWidth(t) + 10;
      if (x + w > W - MR) { x = ML; y += 18; ensureSpace(18); }
      doc.setFillColor(...accent);
      doc.roundedRect(x, y, w, 14, 7, 7, "F");
      doc.setTextColor(...white);
      doc.text(t, x + 5, y + 10);
      x += w + 4;
    }
    y += 19;
  };

  const tierBadge = () => {
    if (!icp.tier && !icp.personalization_level) return;
    ensureSpace(22);
    let x = ML;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    if (icp.tier) {
      const lbl = icp.tier;
      const w = doc.getTextWidth(lbl) + 14;
      doc.setFillColor(...navy);
      doc.roundedRect(x, y, w, 16, 4, 4, "F");
      doc.setTextColor(...white);
      doc.text(lbl, x + 7, y + 11);
      x += w + 5;
    }
    if (icp.personalization_level) {
      const w = doc.getTextWidth(icp.personalization_level) + 14;
      doc.setFillColor(...accent);
      doc.roundedRect(x, y, w, 16, 4, 4, "F");
      doc.setTextColor(...white);
      doc.text(icp.personalization_level, x + 7, y + 11);
    }
    y += 22;
  };

  // ── Build document ──
  addHeader();

  if (icp.description) {
    ensureSpace(24);
    const lines = doc.splitTextToSize(String(icp.description), contentW) as string[];
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(lines, ML, y);
    y += lines.length * 10.5 + 6;
  }

  tierBadge();
  y += 3;

  sectionHeader("Layer 1 · Company");
  fieldRow("Industry", icp.industry);
  fieldRow("Company Size", icp.company_size);
  fieldRow("Geography", icp.geography);
  fieldRow("Funding Stage", icp.funding_stage);
  fieldRow("Hiring Activity", icp.hiring_activity);
  fieldRow("Tech Stack", icp.tech_stack);
  fieldRow("Growth Signals", icp.growth_signals);

  y += 3;
  sectionHeader("Layer 2 · Contact");
  tagsRow("Decision-Maker Titles", icp.job_titles ?? []);
  fieldRow("Departments", icp.departments);
  fieldRow("Seniority", icp.seniority);
  fieldRow("Role in Buying Process", icp.buying_role);

  y += 3;
  sectionHeader("Pain · Triggers · Goals");
  fieldRow("Pain Points", icp.pain_points);
  fieldRow("Buying Triggers", icp.buying_triggers);
  fieldRow("Their Goals", icp.goals);
  fieldRow("Decision Process", icp.decision_process);
  fieldRow("Budget Range", icp.budget_range);

  y += 3;
  sectionHeader("Exclusions & Disqualifiers");
  fieldRow("Exclusions", icp.exclusions);
  fieldRow("Disqualifiers", icp.disqualifiers);

  y += 3;
  sectionHeader("Validation");
  fieldRow("TAM Estimate", icp.tam_estimate);
  fieldRow("Validation Notes", icp.validation_notes);
  fieldRow("Notes", icp.notes);

  addFooter();

  const safeName = company.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`ICP-${safeName}.pdf`);
};
