import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, ExternalLink, FileText, Lock } from "lucide-react";

interface CollateralItem {
  title: string;
  description?: string;
  updatedOn?: string;
  link?: string;
  isPrivate?: boolean;
  subItems?: { label: string; link?: string; updatedOn?: string; isPrivate?: boolean }[];
}

interface CollateralSection {
  title: string;
  subtitle?: string;
  items: CollateralItem[];
}

const sections: CollateralSection[] = [
  {
    title: "General Collaterals",
    subtitle: "(For training purpose only)",
    items: [
      { title: "Sales Playbook: First call", description: "View more" },
      { title: "Jisr Product Pricing and Packaging 2025", description: "View more" },
      {
        title: "New Narrative : Jisr 2.0 (August 2025)",
        updatedOn: "August 13, 2025",
        description: "New narrative, new capabilities.pptx",
      },
      { title: "Objection handling", description: "View more" },
      {
        title: "Pricing calculators",
        subItems: [
          { label: "Knowledge Calculator", updatedOn: "August, 2025" },
          { label: "Knowledge with OCI Calculator", updatedOn: "August, 2025" },
          { label: "Labour/Technical Calculator", updatedOn: "August, 2025" },
          { label: "Labour/Technical with OCI Calculator", updatedOn: "August, 2025" },
        ],
      },
      {
        title: "ChatGPT Jisr Agents",
        subItems: [
          { label: "Jisr Performance Management Agent", updatedOn: "Nov, 2025" },
          { label: "Jisr ATS Agent", updatedOn: "Nov, 2025" },
        ],
      },
    ],
  },
  {
    title: "Core HR",
    items: [
      { title: "Earned salary access (Qsalary - talking points and FAQs)", isPrivate: true },
    ],
  },
  {
    title: "Talent",
    items: [
      { title: "ATS ROI Calculator", updatedOn: "September, 2025" },
      {
        title: "Workforce Planning",
        updatedOn: "Dec, 2025",
        subItems: [
          { label: "FAQs" },
          { label: "Pricing" },
          { label: "Sales scripts" },
          { label: "Training recording" },
        ],
      },
    ],
  },
  {
    title: "Spend",
    items: [
      { title: "Discovery Questions - About the product", updatedOn: "Feb 24, 2025", isPrivate: true },
      { title: "FAQs - About the product", updatedOn: "Feb 24, 2025", isPrivate: true },
      { title: "[EN] Spend Management - Pitch Deck", updatedOn: "Feb 3, 2025" },
      { title: "[AR] Spend Management - Pitch Deck", updatedOn: "Feb 3, 2025" },
    ],
  },
  {
    title: "Battlecards",
    items: [
      { title: "Competitive Displacement Offers", updatedOn: "Nov 3, 2025", isPrivate: true },
      {
        title: "Jisr vs SAP SuccessFactors",
        subItems: [
          { label: "(English) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(Arabic) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(English) Gamma One Pager", updatedOn: "Work in progress" },
          { label: "(Arabic) Gamma One Pager", updatedOn: "Work in progress" },
        ],
      },
      {
        title: "Jisr vs ZenHR",
        subItems: [
          { label: "(English) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(Arabic) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(English) Gamma One Pager", updatedOn: "Work in progress" },
          { label: "(Arabic) Gamma One Pager", updatedOn: "Work in progress" },
        ],
      },
      {
        title: "Jisr vs Oracle Fusion",
        subItems: [
          { label: "(English) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(Arabic) Sales Training", updatedOn: "Jan 8, 2026" },
          { label: "(English) Gamma One Pager", updatedOn: "Work in progress" },
        ],
      },
      {
        title: "Jisr vs Menaitech",
        subItems: [
          { label: "(English) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(Arabic) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(English) Gamma One Pager", updatedOn: "Work in progress" },
        ],
      },
      {
        title: "Jisr vs Odoo",
        subItems: [
          { label: "(English) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(Arabic) Sales Training", updatedOn: "Jan 8, 2026", isPrivate: true },
          { label: "(English) Gamma One Pager", updatedOn: "Work in progress" },
        ],
      },
    ],
  },
];

const trainingCards = [
  {
    id: "crm-overview",
    number: 1,
    title: "CRM Overview",
    desc: "Core objects & connections",
  },
  {
    id: "forms-leads",
    number: 2,
    title: "Forms → Leads",
    desc: "Capture & create contacts",
  },
  {
    id: "lead-management",
    number: 3,
    title: "Lead Management",
    desc: "Qualify, status, routing",
  },
  {
    id: "lead-deal",
    number: 4,
    title: "Lead → Deal",
    desc: "Conversion steps",
  },
  {
    id: "pipeline",
    number: 5,
    title: "Pipeline",
    desc: "Stages & forecasting",
  },
  {
    id: "quotes",
    number: 6,
    title: "Quotes",
    desc: "Proposals & docs",
  },
  {
    id: "closing",
    number: 7,
    title: "Closing",
    desc: "Signatures & win",
  },
  {
    id: "reporting",
    number: 8,
    title: "Reporting",
    desc: "Track performance",
  },
];

const ExpandableCard = ({ item }: { item: CollateralItem }) => {
  const [expanded, setExpanded] = useState(false);
  const hasExpandContent = item.subItems || item.description;

  return (
    <div
      className="rounded-xl border border-border/50 bg-card transition-all hover:border-border"
    >
      <button
        className="w-full flex items-center justify-between p-5 text-left"
        onClick={() => hasExpandContent && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
          {item.updatedOn && !expanded && (
            <p className="text-sm text-muted-foreground mt-1">
              Updated on: {item.updatedOn}
            </p>
          )}
          {item.isPrivate && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Lock className="w-3 h-3" /> Private file
            </span>
          )}
          {!expanded && item.description && !item.subItems && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {item.link && (
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          )}
          {hasExpandContent && (
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-border/30">
          {item.description && (
            <p className="text-sm text-muted-foreground mt-3">{item.description}</p>
          )}
          {item.updatedOn && (
            <p className="text-sm text-muted-foreground mt-2">
              Updated on: {item.updatedOn}
            </p>
          )}
          {item.subItems && (
            <div className="mt-3 space-y-2">
              {item.subItems.map((sub, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{sub.label}</p>
                    {sub.updatedOn && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Updated on: {sub.updatedOn}
                      </p>
                    )}
                    {sub.isPrivate && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Lock className="w-3 h-3" /> Private file
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CollateralSectionBlock = ({ section }: { section: CollateralSection }) => {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-2">{section.title}</h2>
      {section.subtitle && (
        <p className="text-muted-foreground mb-6">{section.subtitle}</p>
      )}
      <div className="space-y-3">
        {section.items.map((item, i) => (
          <ExpandableCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
};

const OpsCollateral = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="relative py-20 px-6"
        style={{ background: "rgb(18, 18, 18)" }}
      >
        <div className="max-w-4xl mx-auto">
          <img src="/images/jisr-logo.png" alt="Jisr" className="h-10 mb-8 opacity-60" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Internal Collateral Repository
          </h1>
          <p className="text-muted-foreground text-lg mb-1">
            For internal sharing/training purpose only.
          </p>
          <p className="text-sm font-semibold text-destructive">
            NOTE: DO NOT SHARE THESE COLLATERALS TO PROSPECTS/CUSTOMERS!
          </p>
          <p className="text-sm text-muted-foreground mt-6">
            Last updated on: Feb 24, 2026
          </p>
        </div>
      </div>

      {/* Table of contents */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Table of contents</h2>
        <ul className="space-y-2 mb-16">
          {sections.map((s, i) => (
            <li key={i}>
              <a
                href={`#section-${i}`}
                className="text-accent hover:underline flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#training"
              className="text-accent hover:underline flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              Training Sessions
            </a>
          </li>
        </ul>

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={i} id={`section-${i}`}>
            <CollateralSectionBlock section={section} />
          </div>
        ))}

        {/* Training Overview */}
        <div id="training" className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Training Overview</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => navigate(`/ops/training/${card.id}`)}
                  className="group rounded-xl border border-border/60 bg-secondary/30 p-5 text-left transition-all hover:border-accent/40 hover:bg-secondary/60 hover:shadow-md"
                >
                  <h3 className="text-base font-bold text-foreground mb-1">
                    {card.number}. {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center pt-8 pb-16">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to presentations
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpsCollateral;
