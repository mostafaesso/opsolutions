import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, Play, Plus, Link, X, ImageIcon } from "lucide-react";
import { useState } from "react";
import { getCompanyBySlug, getMediaKey } from "@/lib/companies";

interface TrainingMedia {
  type: "image" | "video";
  url: string;
  caption?: string;
}

interface TrainingStep {
  title: string;
  description: string;
  doList: string[];
  dontList: string[];
  media?: TrainingMedia[];
}

interface TrainingTopic {
  id: string;
  number: number;
  title: string;
  overview: string;
  steps: TrainingStep[];
}

const MediaEmbed = ({ media }: { media: TrainingMedia }) => {
  const [playing, setPlaying] = useState(false);

  if (media.type === "video") {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-muted">
        {!playing ? (
          <div className="relative cursor-pointer group" onClick={() => setPlaying(true)}>
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors shadow-lg">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              </div>
            </div>
            {media.caption && (
              <p className="text-xs text-muted-foreground p-2 border-t border-border">{media.caption}</p>
            )}
          </div>
        ) : (
          <div>
            <video src={media.url} controls autoPlay className="w-full aspect-video" />
            {media.caption && (
              <p className="text-xs text-muted-foreground p-2 border-t border-border">{media.caption}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-muted">
      <img src={media.url} alt={media.caption || "Training screenshot"} className="w-full object-cover" loading="lazy" />
      {media.caption && (
        <p className="text-xs text-muted-foreground p-2 border-t border-border">{media.caption}</p>
      )}
    </div>
  );
};

const trainingTopics: Record<string, TrainingTopic> = {
  "crm-overview": {
    id: "crm-overview",
    number: 1,
    title: "CRM Overview",
    overview: "Understanding HubSpot CRM's core objects (Contacts, Companies, Deals, Tickets) and how they connect to build a complete picture of your sales pipeline.",
    steps: [
      {
        title: "Understanding Core Objects",
        description: "HubSpot CRM is built around four core objects: Contacts, Companies, Deals, and Tickets. Each object stores specific data and connects to the others through associations.",
        media: [],
        doList: [
          "Learn the difference between each object type",
          "Understand how associations link objects together",
          "Use the CRM sidebar to see related records",
          "Keep object records clean and up-to-date",
        ],
        dontList: [
          "Don't create duplicate records for the same entity",
          "Don't ignore association links between objects",
          "Don't store deal info on the contact record instead of creating a Deal",
          "Don't skip filling in required properties",
        ],
      },
      {
        title: "Navigating the CRM Dashboard",
        description: "The CRM dashboard gives you a bird's-eye view of your pipeline, recent activities, and key metrics.",
        media: [],
        doList: [
          "Customize your dashboard with relevant reports",
          "Use filters to segment your view",
          "Pin frequently used views for quick access",
          "Review your dashboard daily for updates",
        ],
        dontList: [
          "Don't overload your dashboard with too many widgets",
          "Don't ignore the activity feed",
          "Don't forget to set date range filters",
          "Don't rely solely on the dashboard — drill into records",
        ],
      },
    ],
  },
  "activity-log": {
    id: "activity-log",
    number: 2,
    title: "Activity Log",
    overview: "Learn how to log calls, WhatsApp messages, emails, notes, and tasks on HubSpot records to keep a complete activity history.",
    steps: [
      {
        title: "Log a Call",
        description: "Recording calls on contact or deal records ensures your team has full context on every conversation.",
        media: [],
        doList: [
          "Open the contact/deal record and click 'Log Activity' → 'Call'",
          "Select the call outcome (Connected, Left Voicemail, No Answer)",
          "Add a brief summary of the call in the notes field",
          "Set the call duration and direction (inbound/outbound)",
          "Associate the call with relevant deals or companies",
        ],
        dontList: [
          "Don't skip logging calls — even short ones matter",
          "Don't leave the outcome field empty",
          "Don't write vague notes like 'called client'",
          "Don't forget to associate the call with the right deal",
        ],
      },
      {
        title: "Log a WhatsApp Message",
        description: "Track WhatsApp conversations by logging them as activities so nothing falls through the cracks.",
        media: [],
        doList: [
          "Use the 'Log Activity' → 'Note' or WhatsApp integration to record messages",
          "Copy key parts of the conversation into the notes",
          "Tag the message type as WhatsApp for easy filtering",
          "Associate the activity with the relevant deal or ticket",
          "Include any commitments or next steps from the chat",
        ],
        dontList: [
          "Don't rely on WhatsApp alone — always log it in HubSpot",
          "Don't paste entire chat transcripts — summarize key points",
          "Don't forget to note any promises or deadlines discussed",
          "Don't leave WhatsApp conversations untracked",
        ],
      },
      {
        title: "Log an Email",
        description: "Logging emails ensures every communication is visible to your team and tied to the right records.",
        media: [],
        doList: [
          "Use the HubSpot email integration (Gmail/Outlook) for automatic logging",
          "Manually log important emails via 'Log Activity' → 'Email' if needed",
          "Include the subject line and key takeaways",
          "Associate the email with relevant deals and companies",
          "Check email tracking to see if the recipient opened it",
        ],
        dontList: [
          "Don't send emails outside HubSpot without logging them",
          "Don't forget to BCC HubSpot if not using the integration",
          "Don't log internal emails on customer records",
          "Don't ignore email open/click tracking data",
        ],
      },
      {
        title: "Log a Note or Task",
        description: "Notes capture important context while tasks ensure follow-ups don't get missed.",
        media: [],
        doList: [
          "Use 'Log Activity' → 'Note' for meeting summaries and key observations",
          "Create tasks with clear due dates and descriptions",
          "Assign tasks to yourself or the appropriate team member",
          "Use task queues to batch your follow-up work",
          "Pin important notes so they stay visible at the top",
        ],
        dontList: [
          "Don't create tasks without a due date",
          "Don't write notes without context — include who/what/when",
          "Don't leave tasks unassigned",
          "Don't forget to mark tasks as complete when done",
          "Don't use notes as a replacement for proper task management",
        ],
      },
    ],
  },
  "create-object": {
    id: "create-object",
    number: 3,
    title: "Create Object",
    overview: "Learn how to create and manage contacts, companies, deals, and leads in HubSpot CRM — the foundational activities for every sales workflow.",
    steps: [
      {
        title: "How to Create a Contact",
        description: "Contacts are the foundation of your CRM. Every interaction starts with a properly created contact record.",
        media: [],
        doList: [
          "Go to Contacts → Create Contact",
          "Fill in First Name, Last Name, and Email (required fields)",
          "Add phone number and job title for context",
          "Associate the contact with an existing Company if applicable",
          "Add lifecycle stage (Lead, MQL, SQL, etc.) based on their status",
          "Add any relevant notes about how you met or their interest",
        ],
        dontList: [
          "Don't create duplicate contacts — always search first",
          "Don't leave the email field empty",
          "Don't skip the company association",
          "Don't use personal emails when a business email is available",
          "Don't forget to set the correct contact owner",
        ],
      },
      {
        title: "How to Create a Company",
        description: "Company records group contacts together and give you an organizational view of your accounts.",
        media: [],
        doList: [
          "Go to Companies → Create Company",
          "Enter the Company Name and Domain Name",
          "Fill in Industry, Company Size, and Annual Revenue",
          "Associate existing contacts to the company",
          "Set the Company Owner to the responsible sales rep",
          "Add the company's address and phone number",
        ],
        dontList: [
          "Don't create a company without a domain — it helps HubSpot auto-enrich data",
          "Don't duplicate companies — search by domain first",
          "Don't leave Industry or Size blank — these are key for segmentation",
          "Don't forget to link related contacts to the company",
          "Don't assign the wrong owner — it affects reporting",
        ],
      },
      {
        title: "How to Create a Deal",
        description: "Deals represent revenue opportunities. Creating them correctly ensures your pipeline and forecasts are accurate.",
        media: [],
        doList: [
          "Go to Deals → Create Deal",
          "Enter a clear Deal Name (e.g., 'Acme Corp — CRM Setup')",
          "Set the correct Pipeline and Deal Stage",
          "Enter the Deal Amount and Close Date",
          "Associate the deal with a Contact and Company",
          "Set the Deal Owner to the responsible rep",
        ],
        dontList: [
          "Don't create deals without associating a contact and company",
          "Don't leave the amount at $0 unless it's truly unknown",
          "Don't skip the close date — it's critical for forecasting",
          "Don't put deals in the wrong pipeline stage",
          "Don't forget to update the deal stage as it progresses",
        ],
      },
      {
        title: "How to Open a New Lead",
        description: "Leads in HubSpot represent early-stage prospects. Properly opening a lead ensures it enters the right qualification workflow.",
        media: [],
        doList: [
          "Go to Contacts → Create Contact and set Lifecycle Stage to 'Lead'",
          "Fill in all known information (name, email, company, source)",
          "Set the Lead Status to 'New' or 'Open'",
          "Assign the lead to the correct owner or queue for routing",
          "Log the source of the lead (form, referral, event, etc.)",
          "Add initial notes about the lead's interest or intent",
        ],
        dontList: [
          "Don't create a lead without setting the lifecycle stage",
          "Don't skip the lead source — it's essential for attribution",
          "Don't leave lead status as blank or undefined",
          "Don't assign leads without checking routing rules first",
          "Don't forget to follow up within 24 hours of lead creation",
        ],
      },
    ],
  },
  "forms-leads": {
    id: "forms-leads",
    number: 4,
    title: "Forms → Leads",
    overview: "How to capture leads through HubSpot forms, convert form submissions into contacts, and ensure data flows correctly into your CRM.",
    steps: [
      {
        title: "Creating Effective Forms",
        description: "HubSpot forms are the primary way to capture lead information from your website, landing pages, and campaigns.",
        media: [],
        doList: ["Keep forms short — ask only essential fields", "Use progressive profiling to gather more data over time", "Include a clear call-to-action on the submit button", "Set up form notifications for sales team"],
        dontList: ["Don't ask for too many fields upfront — it reduces conversion", "Don't forget to test your form before publishing", "Don't skip setting up a thank-you page or redirect", "Don't use generic field labels — be specific"],
      },
      {
        title: "Form-to-Contact Mapping",
        description: "When a form is submitted, HubSpot creates or updates a contact record. Understanding how fields map ensures clean data.",
        media: [],
        doList: ["Map form fields to the correct CRM properties", "Use hidden fields for tracking source/campaign", "Enable GDPR consent fields when required", "Review submissions regularly for data quality"],
        dontList: ["Don't create custom properties without a naming convention", "Don't ignore unmapped fields — they create data gaps", "Don't forget to set up lifecycle stage on form submission", "Don't leave default field mappings without reviewing them"],
      },
    ],
  },
  "lead-management": {
    id: "lead-management",
    number: 5,
    title: "Lead Management",
    overview: "Best practices for qualifying leads, managing lead status, and routing leads to the right sales reps efficiently.",
    steps: [
      {
        title: "Lead Qualification Process",
        description: "Not every lead is sales-ready. Learn to qualify leads using criteria like budget, authority, need, and timeline (BANT).",
        media: [],
        doList: ["Define clear MQL and SQL criteria with marketing", "Use lead scoring to prioritize outreach", "Update lead status promptly after each interaction", "Document qualification notes on the contact record"],
        dontList: ["Don't treat all leads equally — prioritize by score", "Don't skip the qualification step before creating a deal", "Don't let leads sit uncontacted for more than 24 hours", "Don't change lead status without logging an activity"],
      },
      {
        title: "Lead Routing & Assignment",
        description: "Ensure leads reach the right salesperson quickly using assignment rules, round-robin, or territory-based routing.",
        media: [],
        doList: ["Set up automated lead assignment workflows", "Use round-robin for fair distribution", "Consider territory or product-based routing", "Notify assigned reps immediately via email/Slack"],
        dontList: ["Don't manually assign leads if you have more than 5 reps", "Don't let leads go unassigned — set a fallback owner", "Don't reassign leads without notifying the original owner", "Don't ignore lead response time metrics"],
      },
    ],
  },
  "lead-deal": {
    id: "lead-deal",
    number: 6,
    title: "Lead → Deal",
    overview: "The conversion process from a qualified lead to an active deal. Learn when and how to create deals and associate them properly.",
    steps: [
      {
        title: "When to Create a Deal",
        description: "A deal should be created when a lead has been qualified and there's a genuine sales opportunity to pursue.",
        media: [],
        doList: ["Create a deal only after qualification is complete", "Associate the deal with the correct contact and company", "Set the deal stage to match the current sales stage", "Add an estimated close date and deal amount"],
        dontList: ["Don't create deals for unqualified leads", "Don't forget to associate contacts and companies", "Don't leave deal amount as $0 unless it's truly unknown", "Don't create multiple deals for the same opportunity"],
      },
      {
        title: "Deal Properties Setup",
        description: "Properly filling out deal properties ensures accurate pipeline reporting and forecasting.",
        media: [],
        doList: ["Fill in all required deal properties at creation", "Use deal type to categorize (new business vs. renewal)", "Set pipeline correctly if you have multiple pipelines", "Update close date as conversations progress"],
        dontList: ["Don't leave properties blank — it breaks reporting", "Don't use the wrong pipeline for the deal type", "Don't set unrealistic close dates just to hit targets", "Don't forget to log the source of the deal"],
      },
    ],
  },
  pipeline: {
    id: "pipeline",
    number: 7,
    title: "Pipeline",
    overview: "Managing your sales pipeline effectively: understanding stages, moving deals through the funnel, and forecasting revenue.",
    steps: [
      {
        title: "Pipeline Stages",
        description: "Each pipeline stage represents a milestone in your sales process. Deals should move forward as progress is made.",
        media: [],
        doList: ["Define clear entry/exit criteria for each stage", "Move deals to the correct stage after each milestone", "Review pipeline weekly for stale deals", "Use pipeline views to focus on high-priority deals"],
        dontList: ["Don't skip stages — follow the process sequentially", "Don't leave deals in the same stage for weeks without action", "Don't move deals backward without documenting why", "Don't create too many stages — keep it manageable (5-7)"],
      },
      {
        title: "Pipeline Forecasting",
        description: "Use pipeline data to forecast revenue and plan your quarter.",
        media: [],
        doList: ["Update deal amounts and close dates regularly", "Use weighted pipeline for realistic forecasts", "Run weekly forecast reviews with your manager", "Mark deals as Closed Won/Lost promptly"],
        dontList: ["Don't inflate deal amounts for optimistic forecasting", "Don't keep dead deals open — close them as Lost", "Don't forget to add a close reason for lost deals", "Don't ignore forecast accuracy metrics"],
      },
    ],
  },
  quotes: {
    id: "quotes",
    number: 8,
    title: "Quotes",
    overview: "Creating professional quotes and proposals in HubSpot, including line items, discounts, and e-signatures.",
    steps: [
      {
        title: "Creating Quotes",
        description: "HubSpot quotes let you create professional proposals directly from a deal record, complete with line items and pricing.",
        media: [],
        doList: ["Create quotes from the deal record for proper association", "Use pre-built quote templates for consistency", "Include all relevant line items with correct pricing", "Add terms and conditions to every quote"],
        dontList: ["Don't send quotes without manager approval for large deals", "Don't forget to set an expiration date on quotes", "Don't create quotes outside HubSpot — use the built-in tool", "Don't skip reviewing the quote preview before sending"],
      },
      {
        title: "Quote Follow-up",
        description: "After sending a quote, follow up promptly and track engagement to close the deal faster.",
        media: [],
        doList: ["Follow up within 24-48 hours of sending", "Check if the prospect viewed the quote (tracking)", "Address objections and update quotes if needed", "Use e-signature for faster close"],
        dontList: ["Don't send and forget — always schedule a follow-up", "Don't create multiple quote versions without archiving old ones", "Don't discount without checking with your manager", "Don't ignore quote expiration — re-send if expired"],
      },
    ],
  },
  closing: {
    id: "closing",
    number: 9,
    title: "Closing",
    overview: "Final steps to close a deal: getting signatures, processing paperwork, and marking deals as won in HubSpot.",
    steps: [
      {
        title: "Getting to Closed Won",
        description: "The final stage involves contract review, signature collection, and internal processing before marking a deal as won.",
        media: [],
        doList: ["Confirm all terms are agreed upon before sending contract", "Use HubSpot e-signature or DocuSign integration", "Log the signed contract as a document on the deal", "Mark the deal as Closed Won immediately after signature"],
        dontList: ["Don't mark deals as Closed Won before the contract is signed", "Don't forget to update the deal amount to the final number", "Don't skip notifying the onboarding/CS team about the win", "Don't lose the signed contract — attach it to the deal"],
      },
      {
        title: "Post-Close Handoff",
        description: "After closing, ensure a smooth handoff to the customer success or onboarding team.",
        media: [],
        doList: ["Create a handoff task or ticket for the CS team", "Include all relevant context and notes from the deal", "Introduce the customer to their account manager", "Celebrate the win and share learnings with the team"],
        dontList: ["Don't ghost the customer after the deal is closed", "Don't skip the handoff meeting with CS", "Don't forget to log the win in your team's channel", "Don't move on without documenting what worked"],
      },
    ],
  },
  reporting: {
    id: "reporting",
    number: 10,
    title: "Reporting",
    overview: "Using HubSpot reporting to track sales performance, pipeline health, and individual rep metrics.",
    steps: [
      {
        title: "Key Sales Reports",
        description: "HubSpot provides built-in reports for pipeline, activity, and revenue metrics.",
        media: [],
        doList: ["Track pipeline value by stage weekly", "Monitor deal velocity and average sales cycle", "Review activity metrics (calls, emails, meetings)", "Create custom reports for your specific KPIs"],
        dontList: ["Don't rely on a single report for all insights", "Don't forget to filter reports by date range and rep", "Don't ignore trends — compare month-over-month", "Don't create reports without a clear business question"],
      },
      {
        title: "Dashboard Best Practices",
        description: "Build dashboards that give leadership and reps the right information at the right time.",
        media: [],
        doList: ["Create separate dashboards for reps vs. managers", "Include a mix of leading and lagging indicators", "Schedule dashboard email reports for stakeholders", "Review and update dashboards quarterly"],
        dontList: ["Don't add more than 10 reports to a single dashboard", "Don't ignore dashboard permissions — not everyone needs access", "Don't forget to share dashboards with relevant teams", "Don't create duplicate dashboards — consolidate"],
      },
    ],
  },
};


const ImageUrlInput = ({ onAdd }: { onAdd: (url: string, caption: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  const handleAdd = () => {
    if (!url.trim()) return;
    onAdd(url.trim(), caption.trim());
    setUrl("");
    setCaption("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-lg px-3 py-2 w-full justify-center transition-colors">
        <Plus className="w-3.5 h-3.5" />
        Add Image URL
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-background">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <Link className="w-3.5 h-3.5" />
        Paste image URL
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/image.png"
        className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">
          Add
        </button>
        <button onClick={() => { setOpen(false); setUrl(""); setCaption(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

const TrainingDetail = () => {
  const { topicId, companySlug } = useParams<{ topicId: string; companySlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAdmin = searchParams.get("admin") === "true";
  const topic = topicId ? trainingTopics[topicId] : null;
  const company = companySlug ? getCompanyBySlug(companySlug) : null;
  const mediaStorageKey = getMediaKey(companySlug);

  const [extraMedia, setExtraMedia] = useState<Record<string, TrainingMedia[]>>(() => {
    const saved = localStorage.getItem(mediaStorageKey);
    return saved ? JSON.parse(saved) : {};
  });

  const addMedia = (stepKey: string, url: string, caption: string) => {
    const updated = { ...extraMedia };
    if (!updated[stepKey]) updated[stepKey] = [];
    updated[stepKey] = [...updated[stepKey], { type: "image" as const, url, caption: caption || undefined }];
    setExtraMedia(updated);
    localStorage.setItem(mediaStorageKey, JSON.stringify(updated));
  };

  const removeMedia = (stepKey: string, index: number) => {
    const updated = { ...extraMedia };
    if (updated[stepKey]) {
      updated[stepKey] = updated[stepKey].filter((_, i) => i !== index);
      if (updated[stepKey].length === 0) delete updated[stepKey];
    }
    setExtraMedia(updated);
    localStorage.setItem(mediaStorageKey, JSON.stringify(updated));
  };

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Training topic not found</p>
      </div>
    );
  }

  const topicIds = Object.keys(trainingTopics);
  const currentIdx = topicIds.indexOf(topic.id);
  const prevTopic = currentIdx > 0 ? trainingTopics[topicIds[currentIdx - 1]] : null;
  const nextTopic = currentIdx < topicIds.length - 1 ? trainingTopics[topicIds[currentIdx + 1]] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="h-10" />
          </button>
        </div>
        <a href="https://www.opsolutionss.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 border border-border text-sm text-foreground px-4 py-2 rounded-full hover:border-primary/50 hover:bg-secondary transition-all">
          Visit Ops Solutions
        </a>
      </header>

      {/* Content */}
      <div className="px-6 md:px-8 py-10 max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Training Overview
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold bg-primary text-primary-foreground">
            {topic.number}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{topic.title}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mb-10">{topic.overview}</p>

        {/* Steps */}
        <div className="space-y-8">
          {topic.steps.map((step, i) => {
            const stepKey = `${topicId}-${i}`;
            const savedMedia = extraMedia[stepKey] || [];
            const allMedia = [...(step.media || []), ...savedMedia];

            return (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Step {i + 1}: {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                </div>

                {/* Content + Images side by side */}
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Do / Don't lists */}
                  <div className="flex-1 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                    <div className="p-6">
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "hsl(160, 84%, 39%)" }}>
                        <CheckCircle2 className="w-5 h-5" />
                        What to do
                      </h4>
                      <ul className="space-y-3">
                        {step.doList.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(160, 84%, 39%)" }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6">
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "hsl(4, 72%, 56%)" }}>
                        <XCircle className="w-5 h-5" />
                        What NOT to do
                      </h4>
                      <ul className="space-y-3">
                        {step.dontList.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                            <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(4, 72%, 56%)" }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: Screenshots */}
                  {(allMedia.length > 0 || isAdmin) && (
                    <div className="lg:w-[380px] shrink-0 p-4 border-t lg:border-t-0 lg:border-l border-border bg-muted/30 space-y-3">
                      {allMedia.map((m, k) => (
                        <div key={k} className="relative group">
                          <MediaEmbed media={m} />
                          {isAdmin && k >= (step.media?.length || 0) && (
                            <button
                              onClick={() => removeMedia(stepKey, k - (step.media?.length || 0))}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isAdmin && (
                        <ImageUrlInput onAdd={(url, caption) => addMedia(stepKey, url, caption)} />
                      )}
                      {allMedia.length === 0 && !isAdmin && null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-10 pb-16">
          {prevTopic ? (
            <button onClick={() => navigate(`/training/${prevTopic.id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {prevTopic.number}. {prevTopic.title}
            </button>
          ) : (
            <div />
          )}
          {nextTopic ? (
            <button onClick={() => navigate(`/training/${nextTopic.id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {nextTopic.number}. {nextTopic.title}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Overview
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingDetail;