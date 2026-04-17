export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export const quizData: Record<string, QuizQuestion[]> = {
  "crm-overview": [
    {
      question: "What are the four core objects in HubSpot CRM?",
      options: [
        "Contacts, Companies, Deals, Tickets",
        "Leads, Accounts, Opportunities, Cases",
        "People, Organizations, Pipelines, Tasks",
        "Users, Teams, Campaigns, Reports",
      ],
      correctIndex: 0,
    },
    {
      question: "What should you always do before creating a new Contact?",
      options: [
        "Create the Company record first",
        "Set the Lifecycle Stage",
        "Search by email to avoid duplicates",
        "Assign a Contact Owner",
      ],
      correctIndex: 2,
    },
    {
      question: "Where should deal information like amount and stage be stored?",
      options: [
        "On the Contact record",
        "On the Company record",
        "On a Deal record",
        "In a Note on the timeline",
      ],
      correctIndex: 2,
    },
    {
      question: "What does a Ticket represent in HubSpot?",
      options: [
        "A revenue opportunity",
        "A support or service request",
        "A meeting invitation",
        "A marketing campaign",
      ],
      correctIndex: 1,
    },
    {
      question: "How do you save a filtered list view in HubSpot for quick reuse?",
      options: [
        "Bookmark the browser URL",
        "Export the results to CSV",
        "Pin the filter in settings",
        "Apply filters then click 'Save view'",
      ],
      correctIndex: 3,
    },
  ],

  "activity-log": [
    {
      question: "Which outcome should you select when you successfully spoke with the prospect?",
      options: ["No Answer", "Left Voicemail", "Connected", "Busy"],
      correctIndex: 2,
    },
    {
      question: "How should you log a WhatsApp conversation in HubSpot?",
      options: [
        "Create a new Deal record for it",
        "Log it as a Note starting with '[WhatsApp]'",
        "Send an email summary to yourself",
        "Add it as a calendar event",
      ],
      correctIndex: 1,
    },
    {
      question: "Why should you create a Task after an activity?",
      options: [
        "To replace the activity log entry",
        "To notify the marketing team",
        "To track next steps so follow-ups are not forgotten",
        "To close the deal automatically",
      ],
      correctIndex: 2,
    },
    {
      question: "Which field should never be left blank when creating a Task?",
      options: ["Priority", "Description", "Due Date", "Associated Deal"],
      correctIndex: 2,
    },
    {
      question: "What is the recommended way to automatically log emails in HubSpot?",
      options: [
        "BCC every email to HubSpot only",
        "Enter them manually after each email",
        "Use the HubSpot Sales extension for Gmail or Outlook",
        "Use the HubSpot mobile app",
      ],
      correctIndex: 2,
    },
  ],

  "create-object": [
    {
      question: "Which field is required when creating a new Contact?",
      options: ["Phone Number", "Email", "Job Title", "Lead Source"],
      correctIndex: 1,
    },
    {
      question: "What auto-populates when you enter a Company Domain Name?",
      options: [
        "The company's social media profiles",
        "The company's financial data",
        "The Company Name and enriched company data",
        "All associated contacts",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the correct Deal Name format?",
      options: [
        "[Product] — [Amount]",
        "[Company] — [Product/Service]",
        "[Rep Name] — [Company]",
        "[Date] — [Company]",
      ],
      correctIndex: 1,
    },
    {
      question: "What Lifecycle Stage should be set for a brand new prospect?",
      options: ["Customer", "Opportunity", "Sales Qualified Lead", "Lead"],
      correctIndex: 3,
    },
    {
      question: "Which field tracks how a lead originally came to you?",
      options: ["Lead Status", "Lead Source", "Contact Owner", "Lifecycle Stage"],
      correctIndex: 1,
    },
  ],

  "forms-leads": [
    {
      question: "How many form fields is recommended to maximise conversion rates?",
      options: [
        "As many as needed for full qualification",
        "At least 10",
        "Under 5",
        "Exactly 7",
      ],
      correctIndex: 2,
    },
    {
      question: "What does HubSpot use as the unique key when a form creates or updates a Contact?",
      options: ["Phone number", "Full name", "Email address", "IP address"],
      correctIndex: 2,
    },
    {
      question: "Where do you set the Lifecycle Stage for contacts who submit a form?",
      options: [
        "In the individual field settings",
        "In Form Options → 'Lifecycle stage on submission'",
        "In the CRM contact defaults",
        "In the notification settings",
      ],
      correctIndex: 1,
    },
    {
      question: "What hidden fields should you include in forms for marketing attribution?",
      options: [
        "User ID and session token",
        "UTM Source, UTM Campaign, Lead Source",
        "Admin password and API key",
        "Browser type and device model",
      ],
      correctIndex: 1,
    },
    {
      question: "What should you always do immediately after publishing a HubSpot form?",
      options: [
        "Notify every team member by email",
        "Archive the previous form version",
        "Test it yourself by submitting the form",
        "Set it to expire after 30 days",
      ],
      correctIndex: 2,
    },
  ],

  "lead-management": [
    {
      question: "What does the 'B' in the BANT lead qualification framework stand for?",
      options: ["Brand", "Budget", "Behaviour", "Buyer"],
      correctIndex: 1,
    },
    {
      question: "What is the target response time for contacting a new lead?",
      options: ["Within 24 hours", "Within 1 business day", "Under 5 minutes", "Within 1 hour"],
      correctIndex: 2,
    },
    {
      question: "When should you create a Deal for a lead?",
      options: [
        "As soon as they fill out a form",
        "After the first phone call",
        "Only after all BANT criteria are confirmed",
        "After three follow-up attempts",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the recommended method for routing leads across a team of 4+ reps?",
      options: [
        "Manager manually assigns each lead",
        "Alphabetical rotation by rep name",
        "Automated workflow with round-robin rotation",
        "First rep to respond gets the lead",
      ],
      correctIndex: 2,
    },
    {
      question: "What Lead Status should be set after you successfully spoke with a prospect?",
      options: ["New", "Open", "Connected", "Qualified"],
      correctIndex: 2,
    },
  ],

  "lead-deal": [
    {
      question: "Where should you create a Deal to ensure it auto-associates with the Contact and Company?",
      options: [
        "From the Deals index page",
        "From the Companies tab",
        "From the Contact record's right sidebar",
        "From the Pipeline board view",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the correct format for Deal Names?",
      options: [
        "[Rep Name] — [Deal Value]",
        "[Company] — [Product/Service]",
        "[Date] — [Stage]",
        "[Lead Source] — [Company]",
      ],
      correctIndex: 1,
    },
    {
      question: "What breaks if you leave the Deal Amount as $0?",
      options: [
        "The deal gets automatically archived",
        "It has no effect on reporting",
        "Forecasting calculations",
        "The deal moves to a hold stage",
      ],
      correctIndex: 2,
    },
    {
      question: "Which Lifecycle Stage should the Contact be updated to after creating a qualified Deal?",
      options: ["Lead", "Subscriber", "Sales Qualified Lead", "Customer"],
      correctIndex: 2,
    },
    {
      question: "What is the most common mistake when creating deals?",
      options: [
        "Linking to a Contact and Company",
        "Setting a realistic Close Date",
        "Creating deals for unqualified leads",
        "Filling in the Deal Stage accurately",
      ],
      correctIndex: 2,
    },
  ],

  "pipeline": [
    {
      question: "Where do you find the pipeline board view in HubSpot?",
      options: [
        "Marketing → Campaigns",
        "Sales → Forecasting",
        "CRM → Deals",
        "Reports → Dashboards",
      ],
      correctIndex: 2,
    },
    {
      question: "What should you do when a deal is no longer moving forward?",
      options: [
        "Leave it open to maintain pipeline size",
        "Move it back to the first stage",
        "Mark it Closed Lost and add a reason",
        "Delete the deal record",
      ],
      correctIndex: 2,
    },
    {
      question: "When should you mark a deal as Closed Won or Closed Lost?",
      options: [
        "At the end of the week during pipeline review",
        "At the end of the month",
        "The same day the outcome happens",
        "After the invoice is paid",
      ],
      correctIndex: 2,
    },
    {
      question: "Why is the 'Closed Lost Reason' field important?",
      options: [
        "To reassign the deal to another rep",
        "To trigger a refund workflow",
        "To track trends and improve future sales",
        "To notify the marketing team",
      ],
      correctIndex: 2,
    },
    {
      question: "How often should you review and update your pipeline?",
      options: ["Monthly", "Weekly", "Only when asked by a manager", "Quarterly"],
      correctIndex: 1,
    },
  ],

  "quotes": [
    {
      question: "Where should you always create a Quote from?",
      options: [
        "Marketing → Quotes",
        "CRM → Contacts",
        "The Deal record",
        "Settings → Products",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the correct Quote status flow?",
      options: [
        "New → Sent → Closed → Archived",
        "Draft → Pending → Approved → Signed",
        "Open → Review → Signed → Won",
        "Created → Delivered → Accepted → Paid",
      ],
      correctIndex: 1,
    },
    {
      question: "A prospect requests changes to a quote you already sent. What should you do?",
      options: [
        "Edit the existing quote directly",
        "Delete the old quote and start fresh",
        "Create a new quote version without editing the sent one",
        "Send a verbal confirmation of the changes",
      ],
      correctIndex: 2,
    },
    {
      question: "Within how long should you follow up after sending a quote?",
      options: ["1 week", "5 business days", "24-48 hours", "Immediately after sending"],
      correctIndex: 2,
    },
    {
      question: "Why is setting a Quote Expiration Date important?",
      options: [
        "HubSpot requires it to publish the quote",
        "It creates urgency and encourages faster decisions",
        "It automatically closes the deal if not signed",
        "It locks the pricing permanently",
      ],
      correctIndex: 1,
    },
  ],

  "closing": [
    {
      question: "When should you mark a Deal as Closed Won?",
      options: [
        "When the prospect verbally agrees",
        "After the first invoice is sent",
        "Only after the contract is actually signed",
        "When the quote is approved",
      ],
      correctIndex: 2,
    },
    {
      question: "Where should you attach the signed contract?",
      options: [
        "In an email to the finance team",
        "In the Contact record's notes",
        "On the Deal record in Attachments",
        "In a shared Google Drive folder",
      ],
      correctIndex: 2,
    },
    {
      question: "What Lifecycle Stage should the Contact be updated to after closing?",
      options: ["Sales Qualified Lead", "Customer", "Evangelist", "Opportunity"],
      correctIndex: 1,
    },
    {
      question: "What should be created immediately after closing to ensure a smooth handoff?",
      options: [
        "A new deal for upsell",
        "A marketing campaign",
        "A Ticket or Task for the CS/onboarding team",
        "A competitor analysis report",
      ],
      correctIndex: 2,
    },
    {
      question: "Which Deal Amount should be recorded after closing?",
      options: [
        "The original estimated amount",
        "The amount from the first quote",
        "The final contracted value",
        "The highest amount discussed",
      ],
      correctIndex: 2,
    },
  ],

  "reporting": [
    {
      question: "Where do you find pre-built report templates in HubSpot?",
      options: [
        "Settings → Reports → Templates",
        "Reports → Report Library",
        "Marketing → Analytics → Library",
        "Sales → Insights → Gallery",
      ],
      correctIndex: 1,
    },
    {
      question: "Which report shows pipeline value broken down by stage?",
      options: [
        "Sales Activity report",
        "Revenue Attribution report",
        "Deal Pipeline report",
        "Lead Source report",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the recommended maximum number of reports on a single dashboard?",
      options: ["5", "15", "20", "10"],
      correctIndex: 3,
    },
    {
      question: "How do you schedule a dashboard to be emailed automatically?",
      options: [
        "Settings → Notifications → Dashboard Delivery",
        "Click '...' on the dashboard → 'Schedule email'",
        "Reports → Export → Schedule",
        "Share → Email → Recurring",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the most common mistake when building reports?",
      options: [
        "Using too many chart types",
        "Sharing reports with too many people",
        "Creating reports without a clear question to answer",
        "Not adding a title to the report",
      ],
      correctIndex: 2,
    },
  ],
};
