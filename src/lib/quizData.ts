export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizData: Record<string, QuizQuestion[]> = {
  "crm-overview": [
    {
      question: "What are the four core objects in HubSpot CRM?",
      options: [
        "Contacts, Companies, Deals, Tickets",
        "Leads, Accounts, Opportunities, Cases",
        "People, Organisations, Revenue, Support",
        "Users, Groups, Projects, Tasks",
      ],
      correctIndex: 0,
    },
    {
      question: "What should you do BEFORE creating a new Contact to avoid duplicates?",
      options: [
        "Check today's date",
        "Search by email first",
        "Create a Company record first",
        "Ask your manager for approval",
      ],
      correctIndex: 1,
    },
    {
      question: "What do Deals represent in HubSpot?",
      options: [
        "Support issues raised by customers",
        "Revenue opportunities you are actively working on",
        "Email campaigns sent to prospects",
        "Tasks assigned to individual sales reps",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the purpose of the Filters button in the CRM list view?",
      options: [
        "Delete multiple records at once",
        "Export records to a CSV file",
        "Narrow records down based on specific criteria",
        "Switch from table view to board view",
      ],
      correctIndex: 2,
    },
    {
      question: "What breaks if you don't link a Contact to their Company?",
      options: [
        "The contact gets deleted automatically",
        "Reporting accuracy is broken",
        "The deal won't move to the next stage",
        "HubSpot blocks you from saving the record",
      ],
      correctIndex: 1,
    },
  ],

  "activity-log": [
    {
      question: "When logging a call, which field should ALWAYS be completed?",
      options: [
        "Call duration in minutes",
        "Outcome (Connected, Voicemail, No Answer, etc.)",
        "Next scheduled meeting date",
        "Contact's time zone",
      ],
      correctIndex: 1,
    },
    {
      question: "How should you prefix a manually-logged WhatsApp note for easy filtering?",
      options: ["[MSG]", "[CHAT]", "[WhatsApp]", "[WA-LOG]"],
      correctIndex: 2,
    },
    {
      question: "Which tool enables automatic email logging from Gmail or Outlook into HubSpot?",
      options: [
        "HubSpot Workflows",
        "HubSpot Sales Extension",
        "HubSpot Forms",
        "HubSpot Sequences",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the key difference between a Note and a Task in HubSpot?",
      options: [
        "Notes are private; tasks are visible to the whole team",
        "Notes record history; tasks drive future action",
        "Tasks are a paid feature; notes are always free",
        "Notes are for managers only; tasks are for all reps",
      ],
      correctIndex: 1,
    },
    {
      question: "What must NEVER be left blank when creating a follow-up Task?",
      options: [
        "Priority level (High/Medium/Low)",
        "Associated Company record",
        "Due date",
        "Related deal amount",
      ],
      correctIndex: 2,
    },
  ],

  "create-object": [
    {
      question: "Which field is required when creating a new Contact in HubSpot?",
      options: ["Phone number", "Email address", "Company name", "Job title"],
      correctIndex: 1,
    },
    {
      question: "What does HubSpot use to auto-fill and enrich Company data?",
      options: [
        "LinkedIn profile URL",
        "Company phone number",
        "Company domain name",
        "Industry type selection",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the recommended format for naming a Deal?",
      options: [
        "Rep Name — Deal Value",
        "[Company] — [Product/Service]",
        "Date — Contact Name",
        "Pipeline — Stage Name",
      ],
      correctIndex: 1,
    },
    {
      question: "What Lifecycle Stage should be set when creating a contact for a new prospect?",
      options: ["Customer", "Lead", "Evangelist", "Marketing Qualified Lead"],
      correctIndex: 1,
    },
    {
      question: "Within how many hours should you follow up with a newly created lead?",
      options: ["12 hours", "24 hours", "48 hours", "72 hours"],
      correctIndex: 1,
    },
  ],

  "forms-leads": [
    {
      question: "When building a HubSpot form, which mistake reduces conversion rates?",
      options: [
        "Using a styled template for the form",
        "Adding too many fields — always keep it minimal",
        "Setting a thank-you redirect after submission",
        "Enabling email notifications for the sales team",
      ],
      correctIndex: 1,
    },
    {
      question: "What does HubSpot use as the unique key to identify a form submission?",
      options: ["Phone number", "Full name", "Email address", "IP address"],
      correctIndex: 2,
    },
    {
      question: "What Form Option should be configured to automatically classify new submissions?",
      options: [
        "Deal Stage on submission",
        "Lifecycle Stage on submission",
        "Lead Score on submission",
        "Contact Owner on submission",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the purpose of Hidden Fields such as UTM Source on a form?",
      options: [
        "To collect passwords securely",
        "To track where leads are coming from",
        "To prevent duplicate submissions",
        "To show personalised messages to returning visitors",
      ],
      correctIndex: 1,
    },
    {
      question: "Where can you review all submissions for a specific HubSpot form?",
      options: [
        "CRM → Contacts → Activity Tab",
        "Marketing → Forms → select form → Submissions tab",
        "Reports → Dashboards → Form Report",
        "Automation → Workflows → Submission Logs",
      ],
      correctIndex: 1,
    },
  ],

  "lead-management": [
    {
      question: "What does the letter 'A' stand for in the BANT framework?",
      options: ["Amount", "Authority", "Availability", "Awareness"],
      correctIndex: 1,
    },
    {
      question: "When should you create a Deal for a lead?",
      options: [
        "As soon as the lead submits a website form",
        "Only when all four BANT criteria are confirmed",
        "After the first follow-up email is sent",
        "Once the lead has been in the CRM for 7 days",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the correct Lead Status progression in HubSpot?",
      options: [
        "New → Contacted → Interested → Closed",
        "New → Attempting Contact → Connected → Qualified → Unqualified",
        "Open → Working → Nurturing → Won",
        "Cold → Warm → Hot → Converted",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the target lead response time?",
      options: ["Under 1 hour", "Under 2 hours", "Under 5 minutes", "Same business day"],
      correctIndex: 2,
    },
    {
      question: "What routing workflow action prevents leads from being left unassigned?",
      options: [
        "Setting a default pipeline stage on creation",
        "Setting a fallback owner in the routing workflow",
        "Enabling an auto-response email sequence",
        "Creating a lead scoring rule for every new contact",
      ],
      correctIndex: 1,
    },
  ],

  "lead-deal": [
    {
      question: "What must be confirmed before creating a Deal from a Lead?",
      options: [
        "The contact has opened at least 3 emails",
        "All four BANT criteria are met",
        "A proposal has already been sent",
        "The manager has given written approval",
      ],
      correctIndex: 1,
    },
    {
      question: "Why should you create a Deal from the Contact record rather than the Deals index page?",
      options: [
        "The Deals page is slower to load",
        "It automatically associates the Contact and Company to the Deal",
        "The Deals index page requires admin permissions",
        "It selects the correct pipeline automatically",
      ],
      correctIndex: 1,
    },
    {
      question: "Which Contact field should be updated to 'Qualified' after creating a Deal?",
      options: ["Contact Stage", "Lead Status", "Deal Source", "Lifecycle Stage"],
      correctIndex: 1,
    },
    {
      question: "What Lifecycle Stage should a Contact be moved to when a qualified Deal is created?",
      options: [
        "Lead",
        "Marketing Qualified Lead",
        "Sales Qualified Lead",
        "Customer",
      ],
      correctIndex: 2,
    },
    {
      question: "What happens to forecasting accuracy if a Deal's Amount is left as $0?",
      options: [
        "HubSpot automatically estimates the amount",
        "Forecasting calculations are broken",
        "The deal is hidden from pipeline view",
        "Nothing — amount is optional for forecasting",
      ],
      correctIndex: 1,
    },
  ],

  "pipeline": [
    {
      question: "In the pipeline board view, what does moving a deal card to a different column represent?",
      options: [
        "Changing the deal owner to a new rep",
        "Reaching a real, verified sales milestone",
        "Updating the deal's expected amount",
        "Reassigning an open task to the deal",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the correct action when a deal is no longer active?",
      options: [
        "Leave it in the current stage indefinitely",
        "Mark it as Closed Lost and add a reason",
        "Delete it from the CRM entirely",
        "Move it back to the first pipeline stage",
      ],
      correctIndex: 1,
    },
    {
      question: "How often should you review and update your pipeline?",
      options: ["Daily", "Weekly", "Monthly", "Quarterly"],
      correctIndex: 1,
    },
    {
      question: "What does 'weighted pipeline' show in HubSpot forecasting?",
      options: [
        "The total value of all deals regardless of their stage",
        "Revenue projections adjusted by each stage's probability percentage",
        "Deals filtered by close date in ascending order",
        "The sum of all closed-won deals in a period",
      ],
      correctIndex: 1,
    },
    {
      question: "When closing a deal as Lost, what additional step is always required?",
      options: [
        "Delete all associated contact records",
        "Add a Closed Lost Reason for trend analysis",
        "Remove the deal from the pipeline view",
        "Transfer the deal ownership to another rep",
      ],
      correctIndex: 1,
    },
  ],

  "quotes": [
    {
      question: "From where should you ALWAYS create a Quote in HubSpot?",
      options: [
        "The Contacts index page",
        "The Deal record",
        "The Quotes settings page under Admin",
        "The Company record sidebar",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the recommended expiration timeframe for a quote?",
      options: ["1–3 days", "7–10 days", "14–30 days", "60–90 days"],
      correctIndex: 2,
    },
    {
      question: "If a prospect requests changes after a quote has been sent, what should you do?",
      options: [
        "Edit the original quote directly to update it",
        "Create a new quote version instead of editing the sent one",
        "Cancel the deal and start the process over",
        "Ask the prospect to formally reject the current quote first",
      ],
      correctIndex: 1,
    },
    {
      question: "What feature enables faster deal closing directly from a HubSpot Quote?",
      options: [
        "Automatic payment processing integration",
        "E-signatures enabled in Settings → Quotes",
        "Automatic discount approval workflows",
        "Scheduled quote delivery system",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the correct status sequence for a HubSpot Quote?",
      options: [
        "New → Pending → Sent → Approved → Signed",
        "Draft → Pending → Approved → Signed",
        "Created → Reviewed → Sent → Closed",
        "Open → Active → Confirmed → Signed",
      ],
      correctIndex: 1,
    },
  ],

  "closing": [
    {
      question: "When should you update the Deal Stage to 'Closed Won'?",
      options: [
        "After a verbal agreement is made over the phone",
        "Once all terms are agreed but before the contract is signed",
        "Immediately after the contract is actually signed",
        "After the first payment or invoice is received",
      ],
      correctIndex: 2,
    },
    {
      question: "Where should the signed contract be stored after deal close?",
      options: [
        "Emailed to the client as the only record",
        "Saved in a local folder on your computer",
        "Attached to the Deal record in HubSpot",
        "Archived externally without uploading to HubSpot",
      ],
      correctIndex: 2,
    },
    {
      question: "What should be created for the CS team immediately after a deal closes?",
      options: [
        "A new Deal in the renewal pipeline",
        "A Ticket or Task for onboarding that includes full context",
        "A new Contact record for the account manager",
        "An automated welcome email sent to the client",
      ],
      correctIndex: 1,
    },
    {
      question: "What Contact Lifecycle Stage should be updated after a deal closes?",
      options: ["Sales Qualified Lead", "Opportunity", "Customer", "Evangelist"],
      correctIndex: 2,
    },
    {
      question: "What should be included in the post-close CS handoff task?",
      options: [
        "Only the final deal amount",
        "Deal summary, key contacts, special requirements, and agreed timeline",
        "Just a link to the signed contract",
        "The original lead source only",
      ],
      correctIndex: 1,
    },
  ],

  "reporting": [
    {
      question: "Where can you find pre-built report templates in HubSpot?",
      options: [
        "Settings → Reports → Templates",
        "Reports → Report Library",
        "Automation → Reporting Templates",
        "Marketing → Analytics → Library",
      ],
      correctIndex: 1,
    },
    {
      question: "What is a common mistake when building date-based reports?",
      options: [
        "Using too many filter conditions",
        "Forgetting to set a date range filter, leading to stale data",
        "Only using pipeline reports exclusively",
        "Sharing dashboards with too many team members",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the maximum recommended number of reports per dashboard?",
      options: ["5 reports", "10 reports", "15 reports", "20 reports"],
      correctIndex: 1,
    },
    {
      question: "How can you automatically receive a HubSpot dashboard by email?",
      options: [
        "Export manually and email to yourself each week",
        "Click '...' on the dashboard → Schedule email → set frequency",
        "Use a third-party tool like Zapier to send reports",
        "Set up an automation workflow to export data",
      ],
      correctIndex: 1,
    },
    {
      question: "According to best practice, what should separate dashboards be built for?",
      options: [
        "Each individual contact in the CRM",
        "Reps and managers, since they need different metrics",
        "Each stage in the sales pipeline",
        "Each geographic region only",
      ],
      correctIndex: 1,
    },
  ],
};
