// Single source of truth for the Doc Training stepper:
// the HubSpot journey from form submission to deal closed.
// Each step's screenshots are loaded per-company from the
// `company_media` table using `step_key`.

export interface JourneyStep {
  key: string; // matches company_media.step_key
  number: number;
  title: string;
  description: string;
  bullets: string[];
}

export const HUBSPOT_JOURNEY: JourneyStep[] = [
  {
    key: "journey-1-form-submission",
    number: 1,
    title: "Form Submission",
    description:
      "A prospect fills out a form on your website. HubSpot captures the submission and creates or updates a Contact record automatically.",
    bullets: [
      "Form is embedded on the website or landing page",
      "Submission triggers a new Contact record",
      "Lead source and original referrer are captured",
      "Notification is sent to the assigned sales rep",
    ],
  },
  {
    key: "journey-2-create-contact",
    number: 2,
    title: "Create Contact",
    description:
      "The Contact record is the foundation of the CRM. Every interaction with a person is logged on their record.",
    bullets: [
      "Email, name, phone, and job title are populated",
      "Lifecycle Stage is set to 'Lead'",
      "Lead Source is recorded (form, referral, outbound, etc.)",
      "Contact Owner is assigned for follow-up",
    ],
  },
  {
    key: "journey-3-create-company",
    number: 3,
    title: "Create Company",
    description:
      "If the contact's company doesn't exist yet, a Company record is created and the Contact is associated with it.",
    bullets: [
      "Domain is the unique identifier for a company",
      "Industry, size, and revenue are filled in",
      "Contact is associated with the Company",
      "Company Owner is assigned for account management",
    ],
  },
  {
    key: "journey-4-qualify-lead",
    number: 4,
    title: "Qualify the Lead",
    description:
      "The sales rep reviews the lead, makes contact, and decides whether the lead is a good fit (MQL → SQL).",
    bullets: [
      "Initial outreach within 24 hours",
      "Discovery questions to assess fit",
      "Lead Status moves from 'New' → 'Open' → 'Qualified'",
      "Lifecycle Stage moves to 'Marketing Qualified Lead' then 'Sales Qualified Lead'",
    ],
  },
  {
    key: "journey-5-create-deal",
    number: 5,
    title: "Create Deal",
    description:
      "When the lead is qualified, a Deal is created in the pipeline to track the revenue opportunity.",
    bullets: [
      "Deal name uses the format: '[Company] — [Product/Service]'",
      "Deal is associated with the Contact and Company",
      "Pipeline and Deal Stage are set",
      "Estimated Amount and Close Date are entered",
    ],
  },
  {
    key: "journey-6-pipeline-progression",
    number: 6,
    title: "Move Deal Through Pipeline",
    description:
      "As the deal progresses, the rep moves it through pipeline stages, logging every meaningful activity.",
    bullets: [
      "Log every call, email, meeting, and WhatsApp message",
      "Move stage when objective criteria are met (not when 'it feels right')",
      "Update Amount and Close Date if they change",
      "Create follow-up tasks so nothing is forgotten",
    ],
  },
  {
    key: "journey-7-send-quote",
    number: 7,
    title: "Send Quote / Proposal",
    description:
      "When the prospect is ready, the rep sends a Quote (or proposal document) directly from the Deal.",
    bullets: [
      "Build the quote inside the Deal record",
      "Add line items with prices and discounts",
      "Send for e-signature when applicable",
      "Stage moves to 'Proposal Sent' or 'Contract Sent'",
    ],
  },
  {
    key: "journey-8-deal-closed",
    number: 8,
    title: "Deal Closed",
    description:
      "Mark the Deal as Closed Won (or Closed Lost). Closed Won deals trigger handoff to delivery / customer success.",
    bullets: [
      "Move Deal to 'Closed Won' or 'Closed Lost'",
      "Closed Lost requires a Lost Reason",
      "Closed Won updates the Contact's Lifecycle Stage to 'Customer'",
      "Handoff workflow notifies the delivery team",
    ],
  },
];
