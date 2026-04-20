import jsPDF from "jspdf";
import type { CompanyIcp, IcpTemplate } from "@/hooks/useIcpTemplates";
import type { Company } from "@/lib/companies";

type AnyIcp = Partial<CompanyIcp & IcpTemplate> & { name?: string | null };

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
  const M = 48;

  // Brand colors (HSL approximations of the Ops Solution palette)
  const navy: [number, number, number] = [29, 41, 73];
  const accent: [number, number, number] = [56, 130, 246];
  const ink: [number, number, number] = [24, 28, 36];
  const muted: [number, number, number] = [110, 118, 132];
  const line: [number, number, number] = [225, 228, 234];
  const surface: [number, number, number] = [246, 247, 250];

  let y = M;

  // ── Header band ─────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 110, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 110, W, 4, "F");

  // Company logo (top-left)
  let logoBottom = 32;
  if (company.logoUrl) {
    const data = await fetchAsDataUrl(company.logoUrl);
    if (data) {
      try {
        doc.addImage(data, detectFormat(data), M, 28, 56, 56, undefined, "FAST");
        logoBottom = 28 + 56;
      } catch {
        /* ignore */
      }
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("IDEAL CUSTOMER PROFILE", M + 72, 50);
  doc.setFontSize(20);
  doc.text(company.name, M + 72, 74);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 215, 240);
  doc.text(icp.name || "Primary ICP", M + 72, 92);

  y = 150;

  // ── Section helpers ─────────────────────────────
  const ensureSpace = (need: number) => {
    if (y + need > H - 70) {
      addFooter();
      doc.addPage();
      y = M;
    }
  };

  const sectionHeader = (title: string) => {
    ensureSpace(40);
    doc.setFillColor(...accent);
    doc.rect(M, y, 4, 16, "F");
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title.toUpperCase(), M + 12, y + 12);
    y += 26;
  };

  const fieldRow = (label: string, value?: string | null) => {
    if (!value || !String(value).trim()) return;
    const text = String(value).trim();
    const labelW = 130;
    const valueW = W - M * 2 - labelW - 12;
    const lines = doc.splitTextToSize(text, valueW) as string[];
    const blockH = Math.max(18, lines.length * 13 + 6);
    ensureSpace(blockH + 6);

    doc.setFillColor(...surface);
    doc.rect(M, y, W - M * 2, blockH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), M + 10, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...ink);
    doc.text(lines, M + labelW + 12, y + 14);
    y += blockH + 6;
  };

  const tagsRow = (label: string, items: string[]) => {
    const tags = items.filter(Boolean);
    if (tags.length === 0) return;
    ensureSpace(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), M, y + 10);
    y += 18;

    let x = M;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const t of tags) {
      const w = doc.getTextWidth(t) + 16;
      if (x + w > W - M) {
        x = M;
        y += 24;
        ensureSpace(28);
      }
      doc.setFillColor(...accent);
      doc.roundedRect(x, y, w, 18, 9, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(t, x + 8, y + 12);
      x += w + 6;
    }
    y += 28;
  };

  const tierBadge = () => {
    if (!icp.tier) return;
    ensureSpace(34);
    doc.setFillColor(...navy);
    doc.roundedRect(M, y, 200, 24, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`TIER · ${icp.tier.toUpperCase()}`, M + 12, y + 16);
    if (icp.personalization_level) {
      doc.setFillColor(...accent);
      doc.roundedRect(M + 210, y, 220, 24, 6, 6, "F");
      doc.text(`MODE · ${icp.personalization_level.toUpperCase()}`, M + 222, y + 16);
    }
    y += 34;
  };

  const addFooter = () => {
    doc.setDrawColor(...line);
    doc.line(M, H - 50, W - M, H - 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(`ICP · ${company.name}`, M, H - 32);
    doc.setTextColor(...accent);
    doc.setFont("helvetica", "bold");
    doc.text("Powered by Ops Solution", W - M, H - 32, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(new Date().toLocaleDateString(), W / 2, H - 32, { align: "center" });
  };

  // ── Body ────────────────────────────────────────
  if (icp.description) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...muted);
    const lines = doc.splitTextToSize(icp.description, W - M * 2) as string[];
    doc.text(lines, M, y);
    y += lines.length * 14 + 10;
  }

  tierBadge();

  sectionHeader("Layer 1 · Company Level");
  fieldRow("Industry", icp.industry);
  fieldRow("Company size", icp.company_size);
  fieldRow("Geography", icp.geography);
  fieldRow("Funding stage", icp.funding_stage);
  fieldRow("Hiring activity", icp.hiring_activity);
  fieldRow("Tech stack", icp.tech_stack);
  fieldRow("Growth signals", icp.growth_signals);

  sectionHeader("Layer 2 · Contact Level");
  tagsRow("Decision-maker titles", icp.job_titles ?? []);
  fieldRow("Departments", icp.departments);
  fieldRow("Seniority", icp.seniority);
  fieldRow("Role in buying process", icp.buying_role);

  sectionHeader("Pain · Triggers · Goals");
  fieldRow("Pain points", icp.pain_points);
  fieldRow("Buying triggers", icp.buying_triggers);
  fieldRow("Their goals", icp.goals);
  fieldRow("Decision process", icp.decision_process);
  fieldRow("Budget range", icp.budget_range);

  sectionHeader("Exclusions & Disqualifiers");
  fieldRow("Exclusions", icp.exclusions);
  fieldRow("Disqualifiers", icp.disqualifiers);

  sectionHeader("Validation");
  fieldRow("TAM estimate", icp.tam_estimate);
  fieldRow("Validation notes", icp.validation_notes);
  fieldRow("Notes", icp.notes);

  addFooter();

  const safeName = company.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`ICP-${safeName}.pdf`);
};
