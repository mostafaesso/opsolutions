interface GTMLayer {
  number: number;
  name: string;
  purpose: string;
  tools: string;
}

export const GTM_LAYERS: GTMLayer[] = [
  {
    number: 1,
    name: "Data Sources",
    purpose: "Where do you find your target companies and contacts",
    tools: "Apollo, LinkedIn Sales Navigator, Ocean.io, D7, Maroof.sa, Clay",
  },
  {
    number: 2,
    name: "Data Scraping",
    purpose: "Extracting lead info from websites and directories",
    tools: "Instant Data Scraper, Apify, PhantomBuster",
  },
  {
    number: 3,
    name: "Enrichment",
    purpose: "Completing missing data fields (email, phone, title, LinkedIn)",
    tools: "Clay, Leads Magic, Full Enrich, iSkala Enrich",
  },
  {
    number: 4,
    name: "Buying Signals",
    purpose: "Detecting intent or activity that shows readiness",
    tools: "PhantomBuster (activity trackers), Trigify",
  },
  {
    number: 5,
    name: "Copywriting / Personalization",
    purpose: "Writing messages tailored to each lead",
    tools: "ChatGPT, Twain, Clay (AI fields)",
  },
  {
    number: 6,
    name: "Email Validation",
    purpose: "Ensuring emails are valid and won't bounce",
    tools: "Leads Magic, MillionVerifier, BounceBan",
  },
  {
    number: 7,
    name: "Outreach Execution",
    purpose: "Sending your campaigns via email or LinkedIn",
    tools: "Apollo, Smartlead, Instantly, Lemlist, Heyreach, Aimfox",
  },
  {
    number: 8,
    name: "Infrastructure & Deliverability",
    purpose: "Domains, mailboxes, SMTPs, and routing",
    tools: "Google Workspace, Microsoft 365, Mailreef, Zapmail, Inboxology",
  },
];

const GTMFlow = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Core GTM Stack Layers</h2>
        <p className="text-sm text-muted-foreground">
          Below are the 8 essential layers every cold email GTM engine is built on.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[48px_1fr_2fr_2fr] gap-0 bg-muted/50 border-b border-border">
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</div>
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layer</div>
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purpose</div>
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example Tools</div>
        </div>

        {/* Rows */}
        {GTM_LAYERS.map((layer, idx) => (
          <div
            key={layer.number}
            className={`grid grid-cols-[48px_1fr_2fr_2fr] gap-0 border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
              idx % 2 === 0 ? "bg-background" : "bg-muted/10"
            }`}
          >
            <div className="px-4 py-4 flex items-start">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {layer.number}
              </span>
            </div>
            <div className="px-4 py-4">
              <span className="text-sm font-semibold text-foreground">{layer.name}</span>
            </div>
            <div className="px-4 py-4">
              <span className="text-sm text-muted-foreground">{layer.purpose}</span>
            </div>
            <div className="px-4 py-4">
              <div className="flex flex-wrap gap-1">
                {layer.tools.split(", ").map((tool) => (
                  <span
                    key={tool}
                    className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GTMFlow;
