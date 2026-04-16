export interface TrainingMedia {
  type: "image" | "video";
  url: string;
  caption?: string;
}

export interface TrainingStep {
  title: string;
  description: string;
  doList: string[];
  dontList: string[];
  media?: TrainingMedia[];
}

export interface TrainingTopic {
  id: string;
  number: number;
  title: string;
  overview: string;
  steps: TrainingStep[];
}

export const trainingCards = [
  { id: "crm-overview", number: 1, title: "CRM Overview", desc: "Core objects & connections" },
  { id: "activity-log", number: 2, title: "Activity Log", desc: "Log calls, WhatsApp, emails & tasks" },
  { id: "create-object", number: 3, title: "Create Object", desc: "Contacts, companies, deals & leads" },
  { id: "forms-leads", number: 4, title: "Forms → Leads", desc: "Capture & create contacts" },
  { id: "lead-management", number: 5, title: "Lead Management", desc: "Qualify, status, routing" },
  { id: "lead-deal", number: 6, title: "Lead → Deal", desc: "Conversion steps" },
  { id: "pipeline", number: 7, title: "Pipeline", desc: "Stages & forecasting" },
  { id: "quotes", number: 8, title: "Quotes", desc: "Proposals & docs" },
  { id: "closing", number: 9, title: "Closing", desc: "Signatures & win" },
  { id: "reporting", number: 10, title: "Reporting", desc: "Track performance" },
];

export const trainingTopics: Record<string, TrainingTopic> = {
  "crm-overview": {
    id: "crm-overview",
    number: 1,
    title: "CRM Overview",
    overview: "HubSpot CRM organises everything around four core objects — Contacts, Companies, Deals, and Tickets. Understanding how they connect is the foundation for every sales workflow.",
    steps: [
      {
        title: "Understanding the Four Core Objects",
        description: "Every record in HubSpot is one of four object types. Contacts store people, Companies store organisations, Deals track revenue opportunities, and Tickets handle support requests. They link together through associations.",
        media: [],
        doList: [
          "Navigate to CRM → Contacts / Companies / Deals / Tickets to browse each object",
          "Click any record and look at the right sidebar to see associated records (e.g. a Contact linked to a Company)",
          "Use the 'Associations' card on a record to manually add or remove links",
          "Keep one canonical record per person/company — search before creating",
        ],
        dontList: [
          "Don't store deal details (amount, stage) on a Contact record — create a Deal instead",
          "Don't create a Contact without an email address",
          "Don't duplicate a Company — search by domain name first",
          "Don't ignore the activity timeline on each record — it shows the full history",
        ],
      },
      {
        title: "Navigating the CRM Interface",
        description: "HubSpot's top nav bar has Contacts, Companies, Deals, Tickets, and more. Each object has a list view (table of records) and a record view (detailed page for a single entry).",
        media: [],
        doList: [
          "Click the object name in the top nav (e.g. Contacts) to open the list view",
          "Use 'Filters' at the top of the list to narrow results (e.g. Contact Owner = Me)",
          "Save frequently used filter sets as custom views (click 'Save view')",
          "Pin your most-used views to the left sidebar for quick access",
        ],
        dontList: [
          "Don't scroll through all records — use filters and search instead",
          "Don't forget to click 'All views' to switch between saved views",
          "Don't rely only on the default view — create views for your workflow (e.g. 'My Open Deals')",
          "Don't ignore the column editor — add/remove columns relevant to your role",
        ],
      },
    ],
  },

  "activity-log": {
    id: "activity-log",
    number: 2,
    title: "Activity Log",
    overview: "Every interaction — call, email, WhatsApp, meeting, or note — should be logged on the relevant Contact or Deal record. This builds a complete timeline your whole team can see.",
    steps: [
      {
        title: "Log a Call",
        description: "Open the Contact or Deal record. In the activity panel (middle section), click 'Log activity' → 'Call'. Fill in every field so your team has full context.",
        media: [],
        doList: [
          "Select the Outcome: Connected, Left Voicemail, No Answer, or Busy",
          "Choose Direction: Inbound or Outbound",
          "Write a 1-2 sentence summary in the Notes field (e.g. 'Discussed pricing, will send quote by Friday')",
          "Set the correct date/time if logging retroactively",
          "Associate the call to a Deal if a sales opportunity exists",
        ],
        dontList: [
          "Don't leave the Outcome field as 'None' — always select one",
          "Don't write vague notes like 'spoke with client' — include key details and next steps",
          "Don't skip logging short calls — even a 30-second voicemail matters",
          "Don't forget to associate the call with the correct Deal (not just the Contact)",
        ],
      },
      {
        title: "Log a WhatsApp Message",
        description: "If your HubSpot has the WhatsApp integration, messages log automatically. If not, open the Contact record, click 'Log activity' → 'Note', and record the key points.",
        media: [],
        doList: [
          "Summarise the conversation: who said what, any commitments made",
          "Include the date/time the WhatsApp conversation happened",
          "Tag it in the notes as '[WhatsApp]' so it's easy to filter later",
          "Attach a screenshot of the chat if it contains important details",
          "Associate the note to a Deal or Ticket if relevant",
        ],
        dontList: [
          "Don't paste the entire chat transcript — summarise key points",
          "Don't leave WhatsApp conversations untracked in HubSpot",
          "Don't forget to note any deadlines or promises made in the chat",
          "Don't rely on WhatsApp alone — your team can't see it unless it's in HubSpot",
        ],
      },
      {
        title: "Log an Email",
        description: "Use the HubSpot Gmail/Outlook extension to log emails automatically. If logging manually: open the record → 'Log activity' → 'Email'. Include the subject and key takeaways.",
        media: [],
        doList: [
          "Install the HubSpot Sales extension for Gmail or Outlook for auto-logging",
          "Toggle 'Log in CRM' and 'Track' when sending emails from the extension",
          "For manual logging: paste the subject line and summarise the body",
          "Check the email tracking panel to see opens and clicks",
          "Associate logged emails with the right Deal and Company",
        ],
        dontList: [
          "Don't send important emails outside HubSpot without logging them",
          "Don't BCC HubSpot and also use the extension — it creates duplicates",
          "Don't log personal or internal-only emails on customer records",
          "Don't ignore email open notifications — they're a signal to follow up",
        ],
      },
      {
        title: "Create a Task for Follow-Up",
        description: "After any activity, create a Task if there's a next step. Open the record → 'Create task' (or use the Tasks panel). Set a due date and clear description.",
        media: [],
        doList: [
          "Write a specific task title (e.g. 'Send pricing proposal to Ahmed' not 'Follow up')",
          "Set a due date — never leave it blank",
          "Set the Priority (High / Medium / Low)",
          "Assign it to yourself or the correct team member",
          "Use Task Queues to batch similar follow-ups (Settings → Tasks)",
        ],
        dontList: [
          "Don't create tasks without a due date — they'll get lost",
          "Don't write vague titles like 'Call back' — be specific",
          "Don't leave tasks unassigned",
          "Don't use notes as a substitute for tasks — notes record history, tasks drive action",
          "Don't forget to mark tasks as Complete when done",
        ],
      },
    ],
  },

  "create-object": {
    id: "create-object",
    number: 3,
    title: "Create Object",
    overview: "Creating records correctly from the start saves time and prevents data issues. Here's exactly how to create each object type in HubSpot.",
    steps: [
      {
        title: "Create a Contact",
        description: "Go to CRM → Contacts → click the orange 'Create contact' button (top right). A form slides in from the right.",
        media: [],
        doList: [
          "Fill in Email (required) — always use a business email if available",
          "Fill in First Name and Last Name",
          "Add Phone Number and Job Title",
          "Set Lifecycle Stage to 'Lead' for new prospects or 'Customer' for existing clients",
          "Set Contact Owner to the responsible salesperson",
          "Under 'Associate with', link to an existing Company if one exists",
        ],
        dontList: [
          "Don't skip the email field — it's the unique identifier for contacts",
          "Don't create a contact without searching first (type the email in the search bar)",
          "Don't leave Lifecycle Stage blank — it drives workflows and reporting",
          "Don't use personal emails (gmail, hotmail) when a business email is available",
          "Don't forget to set the Contact Owner — unowned contacts get missed",
        ],
      },
      {
        title: "Create a Company",
        description: "Go to CRM → Companies → click 'Create company'. The key field is the Company Domain Name — HubSpot uses it to auto-fill data and prevent duplicates.",
        media: [],
        doList: [
          "Enter the Company Domain Name (e.g. acme.com) — HubSpot auto-enriches data from it",
          "Fill in Company Name if it doesn't auto-populate",
          "Set Industry, Company Size, and Annual Revenue for segmentation",
          "Set Company Owner to the account manager or sales rep",
          "Add phone number and address if known",
          "Associate existing Contacts to this Company",
        ],
        dontList: [
          "Don't skip the domain name — it's how HubSpot detects duplicates",
          "Don't create a new Company without searching by domain first",
          "Don't leave Industry blank — it's used for reporting and smart lists",
          "Don't create multiple Company records for subsidiaries without a naming convention",
          "Don't assign the wrong owner — it affects pipeline reports",
        ],
      },
      {
        title: "Create a Deal",
        description: "Go to CRM → Deals → click 'Create deal'. Deals track revenue opportunities and must be linked to a Contact and Company.",
        media: [],
        doList: [
          "Enter a clear Deal Name: '[Company] — [Product/Service]' (e.g. 'Acme Corp — CRM Setup')",
          "Select the correct Pipeline (if you have multiple)",
          "Set the Deal Stage to match where the conversation currently stands",
          "Enter Amount (estimated value) and Close Date (expected close)",
          "Associate with both a Contact and a Company",
          "Set Deal Owner to the responsible sales rep",
        ],
        dontList: [
          "Don't create a deal without a Contact and Company association",
          "Don't leave Amount as $0 unless it's genuinely unknown — it breaks forecasting",
          "Don't set an unrealistic Close Date just to make it look active",
          "Don't put deals in the wrong pipeline — ask your manager if unsure",
          "Don't create multiple deals for the same opportunity — update the existing one",
        ],
      },
      {
        title: "Open a New Lead",
        description: "A lead is simply a Contact with Lifecycle Stage set to 'Lead'. Create a Contact (see Step 1), then set Lead Status to 'New' or 'Open'.",
        media: [],
        doList: [
          "Create a Contact and set Lifecycle Stage = 'Lead'",
          "Set Lead Status = 'New' (or 'Open' if you've already reached out)",
          "Fill in Lead Source (e.g. Website Form, Referral, Event, Cold Outreach)",
          "Assign a Contact Owner for follow-up",
          "Add notes about how the lead was acquired and their initial interest",
          "Follow up within 24 hours of creation",
        ],
        dontList: [
          "Don't create a lead without setting Lifecycle Stage — they won't appear in lead reports",
          "Don't skip Lead Source — it's essential for marketing attribution",
          "Don't leave Lead Status as blank — it tracks qualification progress",
          "Don't assign leads without checking your team's routing rules",
          "Don't wait more than 24 hours for the first outreach",
        ],
      },
    ],
  },

  "forms-leads": {
    id: "forms-leads",
    number: 4,
    title: "Forms → Leads",
    overview: "HubSpot forms capture visitor information and automatically create Contact records in your CRM. Here's how to set them up and ensure data flows correctly.",
    steps: [
      {
        title: "Building a HubSpot Form",
        description: "Go to Marketing → Forms → click 'Create form'. Choose 'Embedded form' for websites or 'Standalone page' for a shareable link. Drag fields from the left panel onto the form.",
        media: [],
        doList: [
          "Keep it short: Name, Email, Phone, and 1-2 qualifying questions max",
          "Use 'Progressive profiling' (Form Options tab) to ask different questions on repeat visits",
          "Set a clear Submit Button text (e.g. 'Get a Free Quote' not 'Submit')",
          "Configure a Thank You message or redirect URL after submission",
          "Enable Notifications → add sales team emails so they're alerted immediately",
        ],
        dontList: [
          "Don't ask for more than 5 fields on initial forms — every extra field reduces conversions",
          "Don't forget to test the form yourself before publishing",
          "Don't skip the thank-you page — it confirms the submission worked",
          "Don't use field labels that confuse visitors (e.g. 'Lifecycle Stage' — rephrase to 'What are you looking for?')",
        ],
      },
      {
        title: "Form Submission → Contact Creation",
        description: "When someone submits a form, HubSpot automatically creates (or updates) a Contact using the email as the unique key. You control which CRM properties each form field maps to.",
        media: [],
        doList: [
          "Go to the form editor → click a field → 'CRM property' to see/change the mapping",
          "Add Hidden Fields for tracking: UTM Source, UTM Campaign, Lead Source",
          "Set Lifecycle Stage on submission: Form Options → 'Set lifecycle stage to Lead'",
          "Enable GDPR consent checkboxes if required for your region",
          "Review submissions: Marketing → Forms → select your form → 'Submissions' tab",
        ],
        dontList: [
          "Don't create custom properties without a naming convention (prefix with your team name)",
          "Don't leave fields unmapped — data goes nowhere",
          "Don't forget to set Lifecycle Stage — otherwise contacts don't appear in lead views",
          "Don't publish forms without testing the full flow: submit → check CRM → verify properties",
        ],
      },
    ],
  },

  "lead-management": {
    id: "lead-management",
    number: 5,
    title: "Lead Management",
    overview: "Not every lead is ready for sales. Learn how to qualify, prioritise, and route leads so reps focus on the highest-value opportunities.",
    steps: [
      {
        title: "Qualifying Leads (BANT Framework)",
        description: "Use the BANT framework during discovery calls: Budget — do they have budget? Authority — are you talking to a decision-maker? Need — do they have a problem you solve? Timeline — when do they want to act?",
        media: [],
        doList: [
          "Ask budget questions early: 'Have you allocated budget for this project?'",
          "Identify the decision-maker: 'Who else is involved in this decision?'",
          "Confirm the need: 'What problem are you trying to solve?'",
          "Establish timeline: 'When would you like to have this in place?'",
          "Update Lead Status after each call: New → Attempting Contact → Connected → Qualified → Unqualified",
          "Log qualification notes on the Contact record",
        ],
        dontList: [
          "Don't skip qualification — creating deals for unqualified leads pollutes the pipeline",
          "Don't treat all leads equally — prioritise by lead score and engagement",
          "Don't let leads sit uncontacted for more than 24 hours",
          "Don't change Lead Status without logging an activity explaining why",
        ],
      },
      {
        title: "Lead Routing & Assignment",
        description: "Go to Automation → Workflows → create a workflow triggered by 'Lead Status = New'. Use actions to assign the Contact Owner based on territory, product, or round-robin.",
        media: [],
        doList: [
          "Set up a workflow: trigger = Contact Created with Lifecycle Stage = Lead",
          "Use 'Rotate record to owner' action for round-robin distribution",
          "Add a notification action (email or Slack) so the assigned rep knows immediately",
          "Set a fallback owner for leads that don't match any routing rule",
          "Monitor lead response time: Reports → Create report → 'Time to first contact'",
        ],
        dontList: [
          "Don't manually assign leads if you have more than 3 reps — automate it",
          "Don't let leads go unassigned — always set a fallback owner",
          "Don't reassign leads without notifying the original owner",
          "Don't ignore lead response time — under 5 minutes is the goal",
        ],
      },
    ],
  },

  "lead-deal": {
    id: "lead-deal",
    number: 6,
    title: "Lead → Deal",
    overview: "When a lead is qualified (BANT confirmed), it's time to create a Deal. Here's exactly when and how to convert.",
    steps: [
      {
        title: "When to Create a Deal",
        description: "Create a Deal only after the lead is qualified: they have a real need, budget authority, and a timeline. Don't create deals for 'maybe someday' conversations.",
        media: [],
        doList: [
          "Confirm all BANT criteria are met before creating a Deal",
          "Open the Contact record → click 'Create deal' in the right sidebar",
          "The Contact and Company auto-associate when you create from the Contact record",
          "Set the Deal Stage to the current stage (e.g. 'Discovery' or 'Proposal Sent')",
          "Update the Contact's Lead Status to 'Qualified' and Lifecycle Stage to 'Sales Qualified Lead'",
        ],
        dontList: [
          "Don't create deals for unqualified leads — it inflates your pipeline",
          "Don't create the deal from the Deals page (it won't auto-associate the Contact)",
          "Don't leave the Contact's Lead Status as 'New' after creating a Deal",
          "Don't create multiple deals for the same opportunity unless they're truly separate products",
        ],
      },
      {
        title: "Setting Up Deal Properties",
        description: "When the deal creation form opens, fill in every field accurately. These properties drive your pipeline view, forecasting, and reporting.",
        media: [],
        doList: [
          "Deal Name: use '[Company] — [Product]' format for consistency",
          "Pipeline: select the correct one (Sales Pipeline, Renewal Pipeline, etc.)",
          "Deal Stage: match the actual current stage of the conversation",
          "Amount: enter the best estimate — update as the deal progresses",
          "Close Date: set a realistic date based on the prospect's timeline",
          "Deal Type: 'New Business' or 'Existing Business' for accurate reporting",
        ],
        dontList: [
          "Don't leave Amount as $0 — it breaks forecasting calculations",
          "Don't set Close Date to the end of the quarter just to look good",
          "Don't skip Deal Type — it's used to compare new vs. renewal revenue",
          "Don't forget to log the source of the deal (how the lead came in)",
        ],
      },
    ],
  },

  pipeline: {
    id: "pipeline",
    number: 7,
    title: "Pipeline",
    overview: "Your pipeline is a visual map of all active deals by stage. Managing it correctly gives your team accurate forecasts and clear next steps.",
    steps: [
      {
        title: "Understanding Pipeline Stages",
        description: "Go to CRM → Deals to see the board view. Each column is a pipeline stage (e.g. Appointment Scheduled → Qualified → Proposal → Negotiation → Closed Won/Lost). Drag deals between stages.",
        media: [],
        doList: [
          "Learn your pipeline stages and what each one means (ask your manager for definitions)",
          "Move deals forward only when the real milestone is achieved (e.g. 'Proposal Sent' = you actually sent it)",
          "Review your pipeline weekly: sort by Close Date and update stale deals",
          "Use the 'Board' view for visual overview and 'Table' view for detailed analysis",
        ],
        dontList: [
          "Don't skip stages — each represents a real milestone in the sales process",
          "Don't leave deals in the same stage for more than 2 weeks without logging an activity",
          "Don't move deals backwards without adding a note explaining why",
          "Don't keep dead deals open — mark them as Closed Lost with a reason",
        ],
      },
      {
        title: "Pipeline Forecasting",
        description: "Go to Sales → Forecasting to see revenue projections based on deal amounts and stage probabilities. Each stage has a probability % that weights the forecast.",
        media: [],
        doList: [
          "Update deal amounts and close dates weekly for accurate forecasts",
          "Use the Forecast tool: Sales → Forecasting → select your pipeline",
          "Review weighted pipeline vs. unweighted to understand best vs. worst case",
          "Mark deals as Closed Won or Closed Lost the same day the outcome happens",
          "Add a 'Closed Lost Reason' property to every lost deal for trend analysis",
        ],
        dontList: [
          "Don't inflate deal amounts to make your pipeline look bigger",
          "Don't keep deals open past their close date without updating",
          "Don't ignore the Forecast page — your manager relies on it for planning",
          "Don't forget to add a reason when closing deals as Lost (it helps improve the process)",
        ],
      },
    ],
  },

  quotes: {
    id: "quotes",
    number: 8,
    title: "Quotes",
    overview: "HubSpot Quotes let you build professional proposals with line items, discounts, and e-signatures — all tracked inside the CRM.",
    steps: [
      {
        title: "Creating a Quote",
        description: "Open the Deal record → scroll to the 'Quotes' card in the right sidebar → click 'Create quote'. This ensures the quote is automatically linked to the deal, contact, and company.",
        media: [],
        doList: [
          "Always create quotes from the Deal record (not standalone)",
          "Choose a Quote Template (set up by your admin under Settings → Quotes)",
          "Add Line Items: click 'Add line item' → search your product library or create custom items",
          "Set the correct quantity, price, and discount for each line item",
          "Set an Expiration Date (typically 14-30 days)",
          "Add Terms & Conditions from the template or manually",
        ],
        dontList: [
          "Don't create quotes outside HubSpot — you lose tracking and association",
          "Don't forget to set an expiration date — open-ended quotes reduce urgency",
          "Don't skip the preview step — review the quote PDF before sending",
          "Don't send quotes for large deals without manager approval (set your threshold with your manager)",
        ],
      },
      {
        title: "Sending & Following Up on Quotes",
        description: "After creating the quote, click 'Share' to get a shareable link or send via email directly from HubSpot. Track when the prospect views it.",
        media: [],
        doList: [
          "Click 'Share' → 'Send via email' to track opens and clicks",
          "Check the quote status: Draft → Pending → Approved → Signed",
          "Follow up within 24-48 hours of sending",
          "If the prospect requests changes, create a new quote version (don't edit the sent one)",
          "Enable e-signatures (Settings → Quotes → turn on e-sign) for faster closes",
        ],
        dontList: [
          "Don't send and forget — always create a follow-up task",
          "Don't offer discounts without checking with your manager first",
          "Don't let quotes expire without re-sending or updating",
          "Don't create multiple active quotes without archiving old versions",
        ],
      },
    ],
  },

  closing: {
    id: "closing",
    number: 9,
    title: "Closing",
    overview: "The final steps: get the contract signed, mark the deal as won, and hand off to the delivery or customer success team.",
    steps: [
      {
        title: "Getting to Closed Won",
        description: "Once all terms are agreed, send the final contract for signature. Use HubSpot's e-signature or an integration like DocuSign / PandaDoc.",
        media: [],
        doList: [
          "Confirm all terms verbally or via email before sending the final contract",
          "Send the quote with e-signature enabled (or use your DocuSign integration)",
          "Once signed, immediately update the Deal Stage to 'Closed Won'",
          "Update the Deal Amount to the final contracted value",
          "Attach the signed contract to the Deal record (drag & drop into the 'Attachments' section)",
          "Log a note: 'Deal signed on [date], contract attached'",
        ],
        dontList: [
          "Don't mark as Closed Won before the contract is actually signed",
          "Don't forget to update the Amount to the final number (not the estimate)",
          "Don't lose the signed contract — always attach it to the Deal",
          "Don't skip notifying your CS/delivery team about the new client",
        ],
      },
      {
        title: "Post-Close Handoff",
        description: "After closing, ensure the client is smoothly transitioned to the onboarding or customer success team. Don't disappear after the signature.",
        media: [],
        doList: [
          "Create a Ticket or Task: 'Onboard [Company Name]' and assign to the CS team",
          "Include all context: deal summary, key contacts, special requirements, timeline",
          "Send an intro email connecting the client to their account manager",
          "Update the Contact's Lifecycle Stage to 'Customer'",
          "Share the win in your team channel with key learnings",
        ],
        dontList: [
          "Don't ghost the customer after closing — they'll remember",
          "Don't skip the handoff meeting between sales and CS",
          "Don't forget to update Lifecycle Stage to 'Customer' — it affects segmentation",
          "Don't move on without documenting what worked and what didn't in the deal notes",
        ],
      },
    ],
  },

  reporting: {
    id: "reporting",
    number: 10,
    title: "Reporting",
    overview: "HubSpot reporting helps you track pipeline health, rep performance, and sales trends. Here's how to find and build the reports that matter.",
    steps: [
      {
        title: "Key Sales Reports to Track",
        description: "Go to Reports → Reports → click 'Create report'. Use the 'Deals' data source for pipeline reports and 'Activities' for rep performance. Or browse the Report Library for pre-built templates.",
        media: [],
        doList: [
          "Track pipeline value by stage: Reports → Report Library → 'Deal Pipeline' report",
          "Monitor deal velocity: average time deals spend in each stage",
          "Track rep activity: calls made, emails sent, meetings booked (Report Library → 'Sales Activity' reports)",
          "Build a 'Deals Closed' report filtered by date range and owner to track wins",
          "Create a 'Deals Lost' report by close reason to identify patterns",
        ],
        dontList: [
          "Don't rely on a single report — use a mix of pipeline, activity, and outcome reports",
          "Don't forget to filter by date range — stale data misleads",
          "Don't ignore trends — compare this month vs. last month",
          "Don't create reports without a clear question you're trying to answer",
        ],
      },
      {
        title: "Building Dashboards",
        description: "Go to Reports → Dashboards → 'Create dashboard'. Add up to 10 reports per dashboard. Create separate dashboards for reps (their own metrics) and managers (team overview).",
        media: [],
        doList: [
          "Rep dashboard: My Open Deals, My Tasks Due Today, My Activity This Week, My Pipeline Value",
          "Manager dashboard: Team Pipeline, Deals by Stage, Win Rate, Average Deal Size, Forecast",
          "Schedule email delivery: click '...' on the dashboard → 'Schedule email' (weekly to stakeholders)",
          "Review and update dashboards quarterly — remove reports nobody checks",
        ],
        dontList: [
          "Don't put more than 10 reports on one dashboard — it becomes overwhelming",
          "Don't give everyone access to every dashboard — use permissions",
          "Don't create duplicate dashboards — consolidate and share",
          "Don't skip the Forecast dashboard — leadership depends on it",
        ],
      },
    ],
  },
};
