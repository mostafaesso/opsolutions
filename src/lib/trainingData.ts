export interface TrainingMedia {
  type: "image" | "video";
  url: string;
  caption?: string;
}

export interface TrainingStep {
  title: string;
  description: string;
  instructions: string[];
  mistakes: string[];
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
        description: "Every record in HubSpot is one of four object types. They link together through associations so your team always has the full picture.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Index%20pages/index-page-click-record.png?width=600&height=125&name=index-page-click-record.png", caption: "HubSpot CRM — Deals table showing records with properties" },
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-left-sidebar.png?width=250&height=726&name=record-page-left-sidebar.png", caption: "Contact record — left sidebar with properties" },
        ],
        instructions: [
          "Open HubSpot and look at the top navigation bar — you'll see Contacts, Companies, Deals, and Tickets",
          "Contacts = people (leads, customers, partners)",
          "Companies = organisations those people work for",
          "Deals = revenue opportunities you're working on",
          "Tickets = support or service requests",
          "Click any record and check the right sidebar — it shows all linked records (e.g. a Contact linked to a Company and a Deal)",
        ],
        mistakes: [
          "Creating a Contact that already exists — always search by email first",
          "Storing deal info (amount, stage) on a Contact record instead of creating a Deal",
          "Not linking a Contact to their Company — it breaks reporting",
        ],
      },
      {
        title: "Navigating the CRM Interface",
        description: "HubSpot has a list view (table of all records) and a record view (detailed page for one entry). Mastering navigation saves you time every day.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-right-sidebar.png?width=250&height=637&name=record-page-right-sidebar.png", caption: "Right sidebar — associated deals, tickets, and attachments" },
        ],
        instructions: [
          "Click any object name in the top nav (e.g. 'Contacts') to open the list view",
          "Use the 'Filters' button at the top to narrow results (e.g. Contact Owner = Me)",
          "Click 'Save view' to save your filter as a custom view you can reuse",
          "Pin your most-used views to the left sidebar for one-click access",
          "Use the column editor (top right of the table) to add or remove columns relevant to your role",
        ],
        mistakes: [
          "Scrolling through all records instead of using search and filters",
          "Not saving custom views — you end up re-filtering every time",
          "Ignoring the column editor — the default columns may not show what you need",
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
        description: "After every call, log it immediately so your team has full context on every conversation.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-middle-column-use-activity.png?width=350&height=458&name=record-page-middle-column-use-activity.png", caption: "Activity timeline — log calls, emails, tasks on any record" },
        ],
        instructions: [
          "Open the Contact or Deal record in HubSpot",
          "In the middle activity panel, click 'Log activity' → select 'Call'",
          "Select the Outcome: Connected, Left Voicemail, No Answer, or Busy",
          "Choose Direction: Inbound or Outbound",
          "Write a 1-2 sentence summary in the Notes field (e.g. 'Discussed pricing, will send quote by Friday')",
          "If a Deal exists, associate the call to it using the 'Associate with' dropdown",
          "Click 'Log activity' to save",
        ],
        mistakes: [
          "Leaving the Outcome as 'None' — always select the real outcome",
          "Writing vague notes like 'spoke with client' — include what was discussed and next steps",
          "Skipping short calls — even a 30-second voicemail should be logged",
        ],
      },
      {
        title: "Log a WhatsApp Message",
        description: "If WhatsApp isn't integrated, manually log the key points so nothing gets lost.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-middle-column-use-activity.png?width=350&height=458&name=record-page-middle-column-use-activity.png", caption: "Use the activity timeline to log WhatsApp notes" },
        ],
        instructions: [
          "Open the Contact record",
          "Click 'Log activity' → select 'Note'",
          "Start the note with '[WhatsApp]' so it's easy to filter later",
          "Summarise the conversation: what was discussed, any commitments made, next steps",
          "Include the date and time the WhatsApp conversation happened",
          "If relevant, attach a screenshot of the chat",
          "Associate the note to a Deal or Ticket if one exists",
        ],
        mistakes: [
          "Pasting the entire chat transcript — summarise the key points instead",
          "Not logging WhatsApp conversations at all — your team can't see them unless they're in HubSpot",
          "Forgetting to note deadlines or promises made during the chat",
        ],
      },
      {
        title: "Log an Email",
        description: "Use the HubSpot email extension for automatic logging, or log manually for emails sent outside HubSpot.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-primary-display-properties.png?width=300&height=251&name=record-page-primary-display-properties.png", caption: "Contact record — edit properties directly on the record" },
        ],
        instructions: [
          "Install the HubSpot Sales extension for Gmail or Outlook",
          "When sending an email, toggle 'Log in CRM' and 'Track' in the extension",
          "The email automatically appears on the Contact's timeline",
          "For manual logging: open the record → 'Log activity' → 'Email'",
          "Paste the subject line and summarise the key takeaways",
          "Check the email tracking panel later to see if the recipient opened it",
        ],
        mistakes: [
          "Sending important emails outside HubSpot without logging them — your team loses visibility",
          "Using both BCC and the extension at the same time — it creates duplicate entries",
          "Logging personal or internal emails on customer records",
        ],
      },
      {
        title: "Create a Follow-Up Task",
        description: "After any activity, if there's a next step, create a Task so it doesn't get forgotten.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-middle-column-use-activity.png?width=350&height=458&name=record-page-middle-column-use-activity.png", caption: "Tasks appear in the activity timeline with due dates" },
        ],
        instructions: [
          "On the Contact or Deal record, click 'Create task'",
          "Write a specific title (e.g. 'Send pricing proposal to Ahmed' — not just 'Follow up')",
          "Set a Due Date — never leave it blank",
          "Set Priority: High, Medium, or Low",
          "Assign it to yourself or the correct team member",
          "Click 'Create' to save the task",
          "When the task is done, open it and click 'Mark as complete'",
        ],
        mistakes: [
          "Creating tasks without a due date — they'll get buried and forgotten",
          "Using vague titles like 'Call back' — be specific about what and who",
          "Using notes as a substitute for tasks — notes record history, tasks drive action",
        ],
      },
    ],
  },

  "create-object": {
    id: "create-object",
    number: 3,
    title: "Create Object",
    overview: "Creating records correctly from the start saves time and prevents data issues. Follow these steps for each object type.",
    steps: [
      {
        title: "Create a Contact",
        description: "Contacts are the foundation of your CRM — every person you interact with should have a Contact record.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-left-sidebar.png?width=250&height=726&name=record-page-left-sidebar.png", caption: "Contact record — fill in properties on the left sidebar" },
        ],
        instructions: [
          "Go to CRM → Contacts in the top navigation",
          "Click the orange 'Create contact' button (top right) — a form slides in",
          "Fill in Email (required) — always use a business email if available",
          "Fill in First Name and Last Name",
          "Add Phone Number and Job Title",
          "Set Lifecycle Stage to 'Lead' for new prospects or 'Customer' for existing clients",
          "Set Contact Owner to the responsible salesperson",
          "Under 'Associate with', link to an existing Company if one exists",
          "Click 'Create contact' to save",
        ],
        mistakes: [
          "Not searching before creating — type the email in the search bar first to avoid duplicates",
          "Leaving Lifecycle Stage blank — it drives workflows and reporting",
          "Using personal emails (gmail, hotmail) when a business email is available",
        ],
      },
      {
        title: "Create a Company",
        description: "Company records group your contacts together and give you an organisational view of your accounts.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Index%20pages/index-page-click-record.png?width=600&height=125&name=index-page-click-record.png", caption: "CRM index page — click a record name to open it" },
        ],
        instructions: [
          "Go to CRM → Companies in the top navigation",
          "Click 'Create company' (top right)",
          "Enter the Company Domain Name (e.g. acme.com) — HubSpot auto-fills data from it",
          "The Company Name should auto-populate — edit if needed",
          "Set Industry, Company Size, and Annual Revenue",
          "Set Company Owner to the account manager or sales rep",
          "Add phone number and address if known",
          "Associate existing Contacts to this Company",
          "Click 'Create company' to save",
        ],
        mistakes: [
          "Skipping the domain name — it's how HubSpot detects duplicates and auto-enriches data",
          "Not searching by domain first — you may create a duplicate",
          "Leaving Industry blank — it's used for reporting and segmentation",
        ],
      },
      {
        title: "Create a Deal",
        description: "Deals track revenue opportunities. They must be linked to a Contact and Company for accurate pipeline reporting.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Index%20pages/create-deal-index-page.png?width=350&height=523&name=create-deal-index-page.png", caption: "Create Deal form — fill in name, pipeline, stage, and amount" },
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/create-deal-from-record.png?width=250&height=497&name=create-deal-from-record.png", caption: "Create a deal directly from a Contact record" },
        ],
        instructions: [
          "Go to CRM → Deals in the top navigation",
          "Click 'Create deal' (top right)",
          "Enter a Deal Name using this format: '[Company] — [Product/Service]' (e.g. 'Acme Corp — CRM Setup')",
          "Select the correct Pipeline (if you have multiple)",
          "Set the Deal Stage to match where the conversation currently stands",
          "Enter Amount (estimated value) and Close Date (expected close date)",
          "Associate with both a Contact and a Company",
          "Set Deal Owner to the responsible sales rep",
          "Click 'Create deal' to save",
        ],
        mistakes: [
          "Creating a deal without linking a Contact and Company — it breaks reporting",
          "Leaving Amount as $0 — it breaks forecasting calculations",
          "Setting an unrealistic Close Date just to make the deal look active",
        ],
      },
      {
        title: "Open a New Lead",
        description: "A lead is simply a Contact with the Lifecycle Stage set to 'Lead'. Here's how to open one properly.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-left-sidebar.png?width=250&height=726&name=record-page-left-sidebar.png", caption: "Set Lifecycle Stage to 'Lead' on the contact properties" },
        ],
        instructions: [
          "Create a Contact following the steps above",
          "Set Lifecycle Stage to 'Lead'",
          "Set Lead Status to 'New' (or 'Open' if you've already reached out)",
          "Fill in Lead Source (e.g. Website Form, Referral, Event, Cold Outreach)",
          "Assign a Contact Owner for follow-up",
          "Add a note about how the lead was acquired and their initial interest",
          "Follow up within 24 hours",
        ],
        mistakes: [
          "Not setting Lifecycle Stage — the contact won't appear in lead reports",
          "Skipping Lead Source — marketing can't track where leads come from",
          "Waiting more than 24 hours to make the first outreach",
        ],
      },
    ],
  },

  "forms-leads": {
    id: "forms-leads",
    number: 4,
    title: "Forms → Leads",
    overview: "HubSpot forms capture visitor information and automatically create Contact records in your CRM.",
    steps: [
      {
        title: "Building a HubSpot Form",
        description: "Forms are the main way to capture leads from your website and landing pages.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Forms/Inbound%202025%20Screenshot%20Updates/Create%20and%20edit%20forms/forms-connect-field-to-property.gif?width=700&height=409&name=forms-connect-field-to-property.gif", caption: "Drag fields onto the form and connect them to CRM properties" },
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Forms/Inbound%202025%20Screenshot%20Updates/Create%20and%20edit%20forms/forms-required-field.png?width=600&height=361&name=forms-required-field.png", caption: "Set fields as required in the form editor" },
        ],
        instructions: [
          "Go to Marketing → Forms in the top navigation",
          "Click 'Create form' → choose 'Embedded form' (for websites) or 'Standalone page' (shareable link)",
          "Drag fields from the left panel onto the form: Name, Email, Phone, plus 1-2 qualifying questions",
          "Click the Submit Button to edit its text — use something clear like 'Get a Free Quote'",
          "Go to the 'Options' tab → set a Thank You message or redirect URL",
          "Go to 'Notifications' → add sales team emails so they get alerted on submission",
          "Click 'Publish' when ready",
          "Test the form yourself before sharing it",
        ],
        mistakes: [
          "Asking for too many fields — every extra field reduces conversions (keep it under 5)",
          "Not testing the form before publishing — you might miss errors",
          "Forgetting the thank-you page — visitors won't know their submission worked",
        ],
      },
      {
        title: "How Form Submissions Become Contacts",
        description: "When someone submits a form, HubSpot automatically creates or updates a Contact using the email as the unique key.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Forms/Inbound%202025%20Screenshot%20Updates/Create%20and%20edit%20forms/forms-create-new-property.png?width=415&height=506&name=forms-create-new-property.png", caption: "Create a new property directly from the form editor" },
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Forms/Inbound%202025%20Screenshot%20Updates/Create%20and%20edit%20forms/forms-edit-thank-you-message.gif?width=700&height=409&name=forms-edit-thank-you-message.gif", caption: "Set up your thank you message after form submission" },
        ],
        instructions: [
          "In the form editor, click any field → check 'CRM property' to see which Contact property it maps to",
          "Add Hidden Fields for tracking: UTM Source, UTM Campaign, Lead Source",
          "Go to Form Options → set 'Lifecycle stage on submission' to 'Lead'",
          "Enable GDPR consent checkboxes if required for your region",
          "After publishing, test: submit the form → go to Contacts → search for your test email → verify all fields are filled",
          "Review submissions anytime: Marketing → Forms → select your form → 'Submissions' tab",
        ],
        mistakes: [
          "Not setting Lifecycle Stage on submission — contacts won't appear in lead views",
          "Leaving fields unmapped — data goes nowhere",
          "Creating custom properties without a naming convention — it gets messy fast",
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
        description: "Use BANT during discovery calls to determine if a lead is worth pursuing.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-left-sidebar.png?width=250&height=726&name=record-page-left-sidebar.png", caption: "Update Lead Status on the contact record after qualification" },
        ],
        instructions: [
          "B — Budget: Ask 'Have you allocated budget for this project?'",
          "A — Authority: Ask 'Who else is involved in this decision?'",
          "N — Need: Ask 'What problem are you trying to solve?'",
          "T — Timeline: Ask 'When would you like to have this in place?'",
          "After each call, update the Lead Status on the Contact record:",
          "  → New → Attempting Contact → Connected → Qualified → Unqualified",
          "Log your qualification notes directly on the Contact record",
          "Only create a Deal once all four BANT criteria are confirmed",
        ],
        mistakes: [
          "Skipping qualification and creating deals for every lead — this pollutes the pipeline",
          "Treating all leads equally — prioritise by engagement and lead score",
          "Letting leads sit uncontacted for more than 24 hours",
        ],
      },
      {
        title: "Lead Routing & Assignment",
        description: "Set up automated assignment so leads reach the right salesperson quickly.",
        media: [],

        instructions: [
          "Go to Automation → Workflows → click 'Create workflow'",
          "Set the trigger: 'Contact is created' with filter 'Lifecycle Stage = Lead'",
          "Add action: 'Rotate record to owner' for round-robin distribution across your team",
          "Add another action: 'Send notification' (email or Slack) so the assigned rep knows immediately",
          "Set a fallback owner in case no routing rule matches",
          "Activate the workflow and test it by creating a test lead",
        ],
        mistakes: [
          "Manually assigning leads when you have more than 3 reps — automate it",
          "Not setting a fallback owner — some leads will go unassigned",
          "Ignoring lead response time — the goal is under 5 minutes",
        ],
      },
    ],
  },

  "lead-deal": {
    id: "lead-deal",
    number: 6,
    title: "Lead → Deal",
    overview: "When a lead is qualified (BANT confirmed), it's time to create a Deal. Here's when and how.",
    steps: [
      {
        title: "When to Create a Deal",
        description: "A Deal should only be created when the lead has a real need, budget authority, and a timeline. Not for 'maybe someday' conversations.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/create-deal-from-record.png?width=250&height=497&name=create-deal-from-record.png", caption: "Create a Deal directly from the Contact sidebar" },
        ],
        instructions: [
          "Confirm all BANT criteria are met (see Module 5)",
          "Open the Contact record of the qualified lead",
          "In the right sidebar, click 'Create deal' — this auto-associates the Contact and Company",
          "Set the Deal Stage to match the current stage (e.g. 'Discovery' or 'Proposal Sent')",
          "Fill in Amount, Close Date, and Deal Owner",
          "Go back to the Contact record and update:",
          "  → Lead Status = 'Qualified'",
          "  → Lifecycle Stage = 'Sales Qualified Lead'",
        ],
        mistakes: [
          "Creating deals for unqualified leads — it inflates your pipeline and wastes time",
          "Creating the deal from the Deals page instead of the Contact record — it won't auto-associate",
          "Forgetting to update the Contact's Lead Status after creating the Deal",
        ],
      },
      {
        title: "Setting Up Deal Properties",
        description: "These properties drive your pipeline view, forecasting, and reporting — fill them in accurately.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Index%20pages/create-deal-index-page.png?width=350&height=523&name=create-deal-index-page.png", caption: "Deal properties — name, pipeline, stage, amount, and close date" },
        ],
        instructions: [
          "Deal Name: use '[Company] — [Product]' format (e.g. 'Acme Corp — CRM Setup')",
          "Pipeline: select the correct one (Sales, Renewal, etc.)",
          "Deal Stage: match the actual current stage of the conversation",
          "Amount: enter the best estimate — update it as the deal progresses",
          "Close Date: set a realistic date based on the prospect's timeline",
          "Deal Type: select 'New Business' or 'Existing Business'",
          "Deal Source: note how the lead originally came in",
        ],
        mistakes: [
          "Leaving Amount as $0 — it breaks forecasting",
          "Setting Close Date to the end of the quarter just to look good",
          "Skipping Deal Type — it's used to compare new vs. renewal revenue",
        ],
      },
    ],
  },

  pipeline: {
    id: "pipeline",
    number: 7,
    title: "Pipeline",
    overview: "Your pipeline is a visual map of all active deals by stage. Managing it correctly gives accurate forecasts and clear next steps.",
    steps: [
      {
        title: "Understanding Pipeline Stages",
        description: "Each column in the board view represents a milestone in your sales process.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Index%20pages/index-page-click-record.png?width=600&height=125&name=index-page-click-record.png", caption: "Pipeline board view — drag deals between stages" },
        ],
        instructions: [
          "Go to CRM → Deals to see the board view",
          "Each column is a stage: e.g. Appointment Scheduled → Qualified → Proposal → Negotiation → Closed Won/Lost",
          "Drag deals between stages when a real milestone is achieved",
          "Learn what each stage means — ask your manager for the stage definitions",
          "Switch to 'Table' view (top right) for detailed analysis with more columns",
          "Review your pipeline weekly: sort by Close Date and update anything that's stale",
        ],
        mistakes: [
          "Skipping stages — each one represents a real milestone",
          "Leaving deals stuck in the same stage for weeks without any activity logged",
          "Keeping dead deals open — mark them as Closed Lost and add a reason",
        ],
      },
      {
        title: "Pipeline Forecasting",
        description: "Each stage has a probability percentage that weights revenue projections. Keep your data clean for accurate forecasts.",
        media: [],

        instructions: [
          "Go to Sales → Forecasting to see revenue projections",
          "Select your pipeline and date range",
          "Review weighted pipeline (realistic) vs. unweighted (best case)",
          "Update deal amounts and close dates weekly to keep forecasts accurate",
          "Mark deals as Closed Won or Closed Lost the same day the outcome happens",
          "When closing a deal as Lost, always add a 'Closed Lost Reason' for trend analysis",
        ],
        mistakes: [
          "Inflating deal amounts to make your pipeline look bigger",
          "Keeping deals open past their close date without updating them",
          "Not adding a reason when closing deals as Lost — you can't improve what you don't track",
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
        description: "Always create quotes from the Deal record so they're automatically linked to the deal, contact, and company.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/cpq-record-quote-add.png?width=350&height=104&name=cpq-record-quote-add.png", caption: "Click +Add on the Quotes card in the Deal sidebar" },
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/cpq-create-quote-board-view-2.png?width=300&height=281&name=cpq-create-quote-board-view-2.png", caption: "Create a quote from the board view quick action" },
        ],
        instructions: [
          "Open the Deal record you want to quote",
          "Scroll to the 'Quotes' card in the right sidebar → click 'Create quote'",
          "Choose a Quote Template (set up by your admin under Settings → Quotes)",
          "Click 'Add line item' → search your product library or create a custom item",
          "Set the correct quantity, price, and discount for each line item",
          "Set an Expiration Date (typically 14-30 days)",
          "Add Terms & Conditions",
          "Preview the quote PDF — review it carefully",
          "Click 'Save' when everything looks correct",
        ],
        mistakes: [
          "Creating quotes outside HubSpot — you lose all tracking and association",
          "Not setting an expiration date — open-ended quotes reduce urgency",
          "Skipping the preview step — always review before sending",
        ],
      },
      {
        title: "Sending & Following Up on Quotes",
        description: "After creating the quote, share it and track when the prospect views it.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/quotes-create-deal-index.png?width=500&height=74&name=quotes-create-deal-index.png", caption: "Create Quote button in the deal index table" },
        ],
        instructions: [
          "Click 'Share' → 'Send via email' to track opens and views",
          "The quote status changes: Draft → Pending → Approved → Signed",
          "Follow up within 24-48 hours of sending",
          "If the prospect requests changes, create a new quote version (don't edit the sent one)",
          "Enable e-signatures in Settings → Quotes for faster closes",
          "Create a follow-up task so you don't forget to check back",
        ],
        mistakes: [
          "Sending the quote and forgetting about it — always schedule a follow-up",
          "Offering discounts without checking with your manager first",
          "Letting quotes expire without re-sending or following up",
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
        description: "Once all terms are agreed, send the final contract and update your CRM the moment it's signed.",
        media: [
          { type: "image", url: "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Knowledge_Base_2023-24-25/KB-Records/Record%20Pages/record-page-right-sidebar.png?width=250&height=637&name=record-page-right-sidebar.png", caption: "Attach signed contracts in the Deal record sidebar" },
        ],
        instructions: [
          "Confirm all terms are agreed upon via email or call before sending the final contract",
          "Send the quote with e-signature enabled (or use DocuSign / PandaDoc integration)",
          "Once the contract is signed, immediately update the Deal Stage to 'Closed Won'",
          "Update the Deal Amount to the final contracted value (not the original estimate)",
          "Attach the signed contract to the Deal record (drag & drop into 'Attachments')",
          "Log a note: 'Deal signed on [date], contract attached'",
        ],
        mistakes: [
          "Marking as Closed Won before the contract is actually signed",
          "Not updating the Amount to the final number",
          "Losing the signed contract — always attach it to the Deal",
        ],
      },
      {
        title: "Post-Close Handoff",
        description: "After closing, make sure the client is smoothly transitioned to the onboarding or customer success team.",
        media: [],

        instructions: [
          "Create a Ticket or Task: 'Onboard [Company Name]' and assign it to the CS team",
          "Include all context: deal summary, key contacts, special requirements, timeline",
          "Send an intro email connecting the client to their new account manager",
          "Update the Contact's Lifecycle Stage to 'Customer'",
          "Share the win in your team channel with key learnings — celebrate!",
        ],
        mistakes: [
          "Disappearing after the deal is closed — the customer remembers",
          "Skipping the handoff meeting between sales and CS",
          "Not updating Lifecycle Stage to 'Customer' — it affects reporting and segmentation",
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
        title: "Key Sales Reports",
        description: "Start with pre-built reports from the Report Library, then customise for your team's needs.",
        media: [],

        instructions: [
          "Go to Reports → Reports in the top navigation",
          "Click 'Report Library' to browse pre-built templates",
          "Search for 'Deal Pipeline' — this shows pipeline value by stage",
          "Search for 'Sales Activity' — this shows calls, emails, and meetings per rep",
          "To build a custom report: click 'Create report' → select data source (e.g. Deals)",
          "Add filters: Date range, Deal Owner, Pipeline",
          "Save the report and add it to a dashboard",
        ],
        mistakes: [
          "Relying on a single report — use a mix of pipeline, activity, and outcome reports",
          "Forgetting to filter by date range — stale data misleads",
          "Creating reports without a clear question you're trying to answer",
        ],
      },
      {
        title: "Building Dashboards",
        description: "Dashboards group your reports in one view. Create separate ones for reps and managers.",
        media: [],

        instructions: [
          "Go to Reports → Dashboards → click 'Create dashboard'",
          "For reps: add My Open Deals, My Tasks Due Today, My Activity This Week, My Pipeline Value",
          "For managers: add Team Pipeline, Deals by Stage, Win Rate, Average Deal Size, Forecast",
          "Keep it to a maximum of 10 reports per dashboard",
          "Schedule email delivery: click '...' on the dashboard → 'Schedule email' → set to weekly",
          "Review and update dashboards every quarter — remove reports nobody checks",
        ],
        mistakes: [
          "Putting more than 10 reports on one dashboard — it becomes overwhelming",
          "Giving everyone access to every dashboard — use permissions to keep it focused",
          "Creating duplicate dashboards — consolidate and share instead",
        ],
      },
    ],
  },
};
