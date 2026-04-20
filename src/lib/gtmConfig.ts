// Predefined tool catalog and calculator inputs for each GTM layer.
// Edit-able via Ops Admin in the company GTM module.

export interface GtmCalcField {
  key: string;
  label: string;
  type: "number" | "percent" | "text";
  placeholder?: string;
  // The summary-flow stage this number feeds into (optional).
  flowStage?: "sourced" | "enriched" | "validated" | "contacted" | "replied" | "meetings";
}

export interface GtmLayerConfig {
  number: number;
  name: string;
  purpose: string;
  toolOptions: string[];
  calculator: GtmCalcField[];
}

export const GTM_LAYER_CONFIGS: GtmLayerConfig[] = [
  {
    number: 1,
    name: "Data Sources",
    purpose: "Where do you find your target companies and contacts",
    toolOptions: ["Apollo", "LinkedIn Sales Navigator", "Ocean.io", "D7", "Maroof.sa", "Clay"],
    calculator: [
      { key: "leads_sourced", label: "Total leads sourced", type: "number", flowStage: "sourced" },
      { key: "primary_source", label: "Primary source", type: "text", placeholder: "e.g. Apollo" },
    ],
  },
  {
    number: 2,
    name: "Data Scraping",
    purpose: "Extracting lead info from websites and directories",
    toolOptions: ["Instant Data Scraper", "Apify", "PhantomBuster"],
    calculator: [
      { key: "scraped_records", label: "Records scraped", type: "number" },
    ],
  },
  {
    number: 3,
    name: "Enrichment",
    purpose: "Completing missing data fields (email, phone, title, LinkedIn)",
    toolOptions: ["Clay", "Leads Magic", "Full Enrich", "iSkala Enrich"],
    calculator: [
      { key: "enriched", label: "Leads enriched", type: "number", flowStage: "enriched" },
      { key: "enrichment_rate", label: "Enrichment rate", type: "percent" },
    ],
  },
  {
    number: 4,
    name: "Buying Signals",
    purpose: "Detecting intent or activity that shows readiness",
    toolOptions: ["PhantomBuster", "Trigify", "Bombora", "G2 Buyer Intent"],
    calculator: [
      { key: "signals_detected", label: "Signals detected", type: "number" },
    ],
  },
  {
    number: 5,
    name: "Copywriting / Personalization",
    purpose: "Writing messages tailored to each lead",
    toolOptions: ["ChatGPT", "Twain", "Clay (AI fields)", "Claude"],
    calculator: [
      { key: "variants", label: "Copy variants written", type: "number" },
    ],
  },
  {
    number: 6,
    name: "Email Validation",
    purpose: "Ensuring emails are valid and won't bounce",
    toolOptions: ["Leads Magic", "MillionVerifier", "BounceBan", "ZeroBounce"],
    calculator: [
      { key: "validated", label: "Emails validated", type: "number", flowStage: "validated" },
      { key: "valid_rate", label: "Valid rate", type: "percent" },
    ],
  },
  {
    number: 7,
    name: "Outreach Execution",
    purpose: "Sending your campaigns via email or LinkedIn",
    toolOptions: ["Apollo", "Smartlead", "Instantly", "Lemlist", "Heyreach", "Aimfox"],
    calculator: [
      { key: "emails_sent", label: "Emails sent", type: "number", flowStage: "contacted" },
      { key: "reply_rate", label: "Reply rate", type: "percent" },
      { key: "replies", label: "Replies received", type: "number", flowStage: "replied" },
      { key: "meetings", label: "Meetings booked", type: "number", flowStage: "meetings" },
    ],
  },
  {
    number: 8,
    name: "Infrastructure & Deliverability",
    purpose: "Domains, mailboxes, SMTPs, and routing",
    toolOptions: ["Google Workspace", "Microsoft 365", "Mailreef", "Zapmail", "Inboxology"],
    calculator: [
      { key: "domains", label: "Sending domains", type: "number" },
      { key: "mailboxes", label: "Active mailboxes", type: "number" },
    ],
  },
];
