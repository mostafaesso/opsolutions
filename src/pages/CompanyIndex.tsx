import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCompanyBySlug } from "@/lib/companies";

const trainingCards = [
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

const CompanyIndex = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const company = companySlug ? getCompanyBySlug(companySlug) : null;

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Company not found</h1>
          <p className="text-muted-foreground">This training portal doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={company.logoUrl}
            alt={company.name}
            className="h-10 object-contain"
          />
          <div className="hidden sm:block h-6 w-px bg-border" />
          <img
            src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
            alt="Ops Solutions"
            className="hidden sm:block h-8 opacity-60"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          Powered by Ops Solutions
        </span>
      </header>

      {/* Hero */}
      <div className="px-6 md:px-8 py-12 md:py-16 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Training for {company.name}
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          Complete HubSpot CRM training modules. Click any card to explore step-by-step guidance on what to do and what not to do.
        </p>

        {/* Training Grid */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingCards.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(`/${companySlug}/training/${card.id}`)}
                className="group flex items-center justify-between rounded-xl border border-border bg-background p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    {card.number}. {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyIndex;
