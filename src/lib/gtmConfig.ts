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

// ── Tool subscription plans ───────────────────────────────────────────────

export type BillingType = "monthly" | "annual" | "one_time" | "per_user_month" | "free";

export interface ToolPlan {
  name: string;
  price: number;               // USD per billing cycle
  billing: BillingType;
  units_per_month: number;     // contacts / emails / credits / verifications per month
  unit_label: string;          // "contacts/mo", "emails/mo", "credits/mo", etc.
  popular?: boolean;
  note?: string;
}

export const TOOL_PLANS: Record<string, ToolPlan[]> = {
  // ── Data Sources ─────────────────────────────────────────
  "Apollo": [
    { name: "Free",         price: 0,   billing: "free",    units_per_month: 50,    unit_label: "contacts/mo",  note: "50 export credits/mo" },
    { name: "Basic",        price: 49,  billing: "monthly", units_per_month: 1000,  unit_label: "contacts/mo",  popular: true },
    { name: "Professional", price: 79,  billing: "monthly", units_per_month: 2000,  unit_label: "contacts/mo" },
    { name: "Organization", price: 119, billing: "per_user_month", units_per_month: 4000, unit_label: "contacts/mo" },
  ],
  "LinkedIn Sales Navigator": [
    { name: "Core (annual)",     price: 79.99, billing: "per_user_month", units_per_month: 1000, unit_label: "saved leads/mo",  note: "Billed $959/yr/user" },
    { name: "Advanced (annual)", price: 135,   billing: "per_user_month", units_per_month: 2500, unit_label: "saved leads/mo",  popular: true, note: "Billed $1,620/yr/user" },
    { name: "Advanced Plus",     price: 0,     billing: "monthly",        units_per_month: 0,    unit_label: "custom",          note: "Contact sales for pricing" },
  ],
  "Ocean.io": [
    { name: "Starter",      price: 199, billing: "monthly", units_per_month: 500,  unit_label: "contacts/mo" },
    { name: "Growth",       price: 499, billing: "monthly", units_per_month: 2000, unit_label: "contacts/mo", popular: true },
    { name: "Enterprise",   price: 0,   billing: "monthly", units_per_month: 0,    unit_label: "custom",       note: "Contact sales" },
  ],
  "Clay": [
    { name: "Free",        price: 0,   billing: "free",    units_per_month: 100,   unit_label: "credits/mo" },
    { name: "Starter",     price: 149, billing: "monthly", units_per_month: 2000,  unit_label: "credits/mo" },
    { name: "Explorer",    price: 349, billing: "monthly", units_per_month: 10000, unit_label: "credits/mo", popular: true },
    { name: "Pro",         price: 800, billing: "monthly", units_per_month: 25000, unit_label: "credits/mo" },
    { name: "Enterprise",  price: 0,   billing: "monthly", units_per_month: 0,     unit_label: "custom",     note: "Contact sales" },
  ],
  "D7": [
    { name: "Starter",     price: 39,  billing: "monthly", units_per_month: 500,  unit_label: "contacts/mo" },
    { name: "Business",    price: 99,  billing: "monthly", units_per_month: 2000, unit_label: "contacts/mo", popular: true },
    { name: "Agency",      price: 299, billing: "monthly", units_per_month: 10000, unit_label: "contacts/mo" },
  ],

  // ── Data Scraping ─────────────────────────────────────────
  "Apify": [
    { name: "Free",        price: 0,   billing: "free",    units_per_month: 100,  unit_label: "compute units/mo" },
    { name: "Starter",     price: 49,  billing: "monthly", units_per_month: 500,  unit_label: "compute units/mo" },
    { name: "Scale",       price: 499, billing: "monthly", units_per_month: 8000, unit_label: "compute units/mo", popular: true },
  ],
  "PhantomBuster": [
    { name: "Starter",     price: 56,  billing: "monthly", units_per_month: 20,   unit_label: "hours/mo" },
    { name: "Pro",         price: 128, billing: "monthly", units_per_month: 80,   unit_label: "hours/mo", popular: true },
    { name: "Team",        price: 352, billing: "monthly", units_per_month: 300,  unit_label: "hours/mo" },
  ],

  // ── Enrichment ────────────────────────────────────────────
  "Leads Magic": [
    { name: "Starter",     price: 29,  billing: "monthly", units_per_month: 500,  unit_label: "enrichments/mo" },
    { name: "Growth",      price: 79,  billing: "monthly", units_per_month: 2000, unit_label: "enrichments/mo", popular: true },
    { name: "Pro",         price: 149, billing: "monthly", units_per_month: 5000, unit_label: "enrichments/mo" },
  ],
  "Full Enrich": [
    { name: "Starter",     price: 29,  billing: "monthly", units_per_month: 200,   unit_label: "enrichments/mo" },
    { name: "Growth",      price: 99,  billing: "monthly", units_per_month: 1000,  unit_label: "enrichments/mo", popular: true },
    { name: "Pro",         price: 249, billing: "monthly", units_per_month: 3000,  unit_label: "enrichments/mo" },
  ],

  // ── Buying Signals ────────────────────────────────────────
  "Trigify": [
    { name: "Starter",     price: 99,  billing: "monthly", units_per_month: 500,  unit_label: "signals/mo" },
    { name: "Growth",      price: 299, billing: "monthly", units_per_month: 2000, unit_label: "signals/mo", popular: true },
  ],
  "Bombora": [
    { name: "Business",    price: 0,   billing: "monthly", units_per_month: 0,    unit_label: "custom",     note: "Contact sales — typically $1,000+/mo" },
  ],

  // ── Copywriting ───────────────────────────────────────────
  "ChatGPT": [
    { name: "Free",        price: 0,   billing: "free",    units_per_month: 0,    unit_label: "GPT-3.5 only" },
    { name: "Plus",        price: 20,  billing: "monthly", units_per_month: 0,    unit_label: "GPT-4o access", popular: true },
    { name: "Team",        price: 25,  billing: "per_user_month", units_per_month: 0, unit_label: "GPT-4o + API" },
  ],
  "Claude": [
    { name: "Free",        price: 0,   billing: "free",    units_per_month: 0,    unit_label: "limited usage" },
    { name: "Pro",         price: 20,  billing: "monthly", units_per_month: 0,    unit_label: "priority access", popular: true },
    { name: "Team",        price: 25,  billing: "per_user_month", units_per_month: 0, unit_label: "team workspace" },
  ],

  // ── Email Validation ──────────────────────────────────────
  "MillionVerifier": [
    { name: "Pay-as-you-go", price: 37, billing: "one_time", units_per_month: 10000, unit_label: "verifications",  note: "$37 per 10k verifications" },
    { name: "Monthly 50k",   price: 97, billing: "monthly",  units_per_month: 50000, unit_label: "verifications/mo", popular: true },
  ],
  "ZeroBounce": [
    { name: "Pay-as-you-go", price: 16, billing: "one_time", units_per_month: 2000,  unit_label: "verifications",  note: "$16 per 2k credits" },
    { name: "Monthly 10k",   price: 18, billing: "monthly",  units_per_month: 10000, unit_label: "verifications/mo" },
    { name: "Monthly 100k",  price: 78, billing: "monthly",  units_per_month: 100000, unit_label: "verifications/mo", popular: true },
  ],
  "BounceBan": [
    { name: "Starter",     price: 19,  billing: "monthly", units_per_month: 5000,  unit_label: "verifications/mo" },
    { name: "Growth",      price: 39,  billing: "monthly", units_per_month: 15000, unit_label: "verifications/mo", popular: true },
    { name: "Pro",         price: 79,  billing: "monthly", units_per_month: 50000, unit_label: "verifications/mo" },
  ],

  // ── Outreach Execution ────────────────────────────────────
  "Smartlead": [
    { name: "Basic",       price: 39,  billing: "monthly", units_per_month: 0,     unit_label: "unlimited emails", note: "2 active mailboxes" },
    { name: "Pro",         price: 94,  billing: "monthly", units_per_month: 0,     unit_label: "unlimited emails", popular: true, note: "Unlimited mailboxes" },
    { name: "Custom",      price: 174, billing: "monthly", units_per_month: 0,     unit_label: "unlimited emails", note: "White-label + API" },
  ],
  "Instantly": [
    { name: "Growth",      price: 37,  billing: "monthly", units_per_month: 5000,  unit_label: "emails/mo",   note: "1k active leads" },
    { name: "Hypergrowth", price: 97,  billing: "monthly", units_per_month: 100000, unit_label: "emails/mo",  popular: true, note: "25k active leads" },
    { name: "Light Speed", price: 358, billing: "monthly", units_per_month: 500000, unit_label: "emails/mo",  note: "500k active leads" },
  ],
  "Lemlist": [
    { name: "Email Outreach",    price: 59,  billing: "per_user_month", units_per_month: 0, unit_label: "unlimited emails" },
    { name: "Sales Engagement",  price: 99,  billing: "per_user_month", units_per_month: 0, unit_label: "email + LinkedIn", popular: true },
    { name: "Agency",            price: 159, billing: "monthly",        units_per_month: 0, unit_label: "multi-client" },
  ],
  "Heyreach": [
    { name: "Starter",     price: 79,  billing: "monthly", units_per_month: 800,  unit_label: "LinkedIn msgs/mo",  note: "2 LinkedIn accounts" },
    { name: "Pro",         price: 239, billing: "monthly", units_per_month: 2800, unit_label: "LinkedIn msgs/mo",  popular: true, note: "7 LinkedIn accounts" },
    { name: "Agency",      price: 999, billing: "monthly", units_per_month: 0,    unit_label: "unlimited accounts" },
  ],
  "Aimfox": [
    { name: "Basic",       price: 49,  billing: "per_user_month", units_per_month: 500,  unit_label: "LinkedIn msgs/mo" },
    { name: "Pro",         price: 89,  billing: "per_user_month", units_per_month: 1000, unit_label: "LinkedIn msgs/mo", popular: true },
  ],

  // ── Infrastructure ────────────────────────────────────────
  "Google Workspace": [
    { name: "Business Starter",  price: 6,  billing: "per_user_month", units_per_month: 0, unit_label: "1 mailbox/user" },
    { name: "Business Standard", price: 12, billing: "per_user_month", units_per_month: 0, unit_label: "1 mailbox/user", popular: true },
    { name: "Business Plus",     price: 18, billing: "per_user_month", units_per_month: 0, unit_label: "1 mailbox/user" },
  ],
  "Microsoft 365": [
    { name: "Business Basic",    price: 6,  billing: "per_user_month", units_per_month: 0, unit_label: "1 mailbox/user" },
    { name: "Business Standard", price: 12.50, billing: "per_user_month", units_per_month: 0, unit_label: "1 mailbox/user", popular: true },
    { name: "Business Premium",  price: 22, billing: "per_user_month", units_per_month: 0, unit_label: "1 mailbox/user" },
  ],
  "Mailreef": [
    { name: "Starter",     price: 30,  billing: "monthly", units_per_month: 0, unit_label: "3 domains + 15 mailboxes" },
    { name: "Growth",      price: 60,  billing: "monthly", units_per_month: 0, unit_label: "10 domains + 50 mailboxes", popular: true },
    { name: "Agency",      price: 120, billing: "monthly", units_per_month: 0, unit_label: "unlimited domains" },
  ],
};

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
