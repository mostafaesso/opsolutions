import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Plus, X, Building2, Link as LinkIcon, Copy } from "lucide-react";
import { useState } from "react";
import { getCompanies, addCompany, removeCompany, Company } from "@/lib/companies";

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

const AddCompanyForm = ({ onAdd }: { onAdd: (c: Company) => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleAdd = () => {
    if (!name.trim() || !slug.trim() || !logoUrl.trim()) return;
    onAdd({ name: name.trim(), slug: slug.trim(), logoUrl: logoUrl.trim() });
    setName(""); setSlug(""); setLogoUrl(""); setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-xl px-4 py-3 w-full justify-center transition-colors">
        <Plus className="w-4 h-4" />
        Add Company
      </button>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Building2 className="w-4 h-4" />
        New Company
      </div>
      <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Company Name (e.g. Engagesoft)" className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Slug:</span>
        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="flex items-center gap-2">
        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Company logo URL" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleAdd} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add</button>
        <button onClick={() => { setOpen(false); setName(""); setSlug(""); setLogoUrl(""); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";
  const [companies, setCompanies] = useState<Company[]>(getCompanies);

  const handleAddCompany = (c: Company) => {
    const updated = addCompany(c);
    setCompanies([...updated]);
  };

  const handleRemoveCompany = (slug: string) => {
    const updated = removeCompany(slug);
    setCompanies([...updated]);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="h-10" />
        </div>
        <a href="https://www.opsolutionss.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 border border-border text-sm text-foreground px-4 py-2 rounded-full hover:border-primary/50 hover:bg-secondary transition-all">
          Visit Ops Solutions
        </a>
      </header>

      {/* Hero */}
      <div className="px-6 md:px-8 py-12 md:py-16 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Training Overview
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          Complete HubSpot CRM training modules. Click any card to explore step-by-step guidance on what to do and what not to do.
        </p>

        {/* Admin: Company Management */}
        {isAdmin && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Portals
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Each company gets a unique link with their branding. Add images via their portal's admin mode.
            </p>

            {companies.length > 0 && (
              <div className="space-y-3 mb-4">
                {companies.map((c) => (
                  <div key={c.slug} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <img src={c.logoUrl} alt={c.name} className="h-8 w-8 object-contain rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">/{c.slug}</p>
                    </div>
                    <button onClick={() => navigate(`/${c.slug}/training/crm-overview?admin=true`)} className="text-xs text-primary hover:text-primary/80 transition-colors">
                      Manage →
                    </button>
                    <button onClick={() => copyLink(c.slug)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy link">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemoveCompany(c.slug)} className="text-muted-foreground hover:text-destructive transition-colors" title="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <AddCompanyForm onAdd={handleAddCompany} />
          </div>
        )}

        {/* Training Grid */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingCards.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(`/training/${card.id}${isAdmin ? "?admin=true" : ""}`)}
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

export default Index;
