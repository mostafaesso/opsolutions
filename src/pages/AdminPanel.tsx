import { useState, useEffect } from "react";
import { Building2, Plus, X, Copy, Link as LinkIcon, ImageIcon, ChevronRight, ChevronDown, ExternalLink, Trash2, CheckCircle2, BookOpen, Share2, Info, Mail, Users } from "lucide-react";
import { fetchCompanies, addCompanyToDb, removeCompanyFromDb, updateCompanyInDb, fetchCompanyMedia, addCompanyMedia, removeCompanyMedia, Company } from "@/lib/companies";
import { trainingTopics, trainingCards } from "@/lib/trainingData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import AdminTeamTab from "@/components/AdminTeamTab";
import AdminPermissionsPanel from "@/components/AdminPermissionsPanel";
import AdminGTMAccess from "@/components/AdminGTMAccess";
import AdminCommentRouting from "@/components/AdminCommentRouting";

// ─── Companies Tab ────────────────────────────────────────────────────────────

const CompaniesTab = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    fetchCompanies().then(c => { setCompanies(c); setLoading(false); });
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleAdd = async () => {
    if (!name.trim() || !slug.trim() || !logoUrl.trim()) return;
    try {
      await addCompanyToDb({ name: name.trim(), slug: slug.trim(), logoUrl: logoUrl.trim() });
      const updated = await fetchCompanies();
      setCompanies(updated);
      setName(""); setSlug(""); setLogoUrl(""); setShowAddForm(false);
      toast({ title: "Company added!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRemove = async (s: string) => {
    try {
      await removeCompanyFromDb(s);
      const updated = await fetchCompanies();
      setCompanies(updated);
      if (selected === s) setSelected(null);
      toast({ title: "Company removed" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const copyLink = (s: string) => {
    const url = `${window.location.origin}/${s}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: url });
  };

  const company = selected ? companies.find(c => c.slug === selected) : null;

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Left: Company List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Companies ({companies.length})
        </h2>
        <div className="space-y-2">
          {companies.map(c => (
            <div
              key={c.slug}
              onClick={() => setSelected(c.slug)}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                selected === c.slug ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <img src={c.logoUrl} alt={c.name} className="h-8 w-8 object-contain rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">/{c.slug}</p>
              </div>
            </div>
          ))}
        </div>

        {!showAddForm ? (
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 border border-dashed border-primary/40 rounded-xl px-4 py-3 w-full justify-center transition-colors">
            <Plus className="w-4 h-4" /> Add Company
          </button>
        ) : (
          <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" /> New Company
            </p>
            <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Company Name" className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Slug:</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Company logo URL" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add</button>
              <button onClick={() => { setShowAddForm(false); setName(""); setSlug(""); setLogoUrl(""); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Company Detail */}
      <div className="rounded-2xl border border-border bg-card p-6 min-h-[400px]">
        {!company ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 py-16">
            <BookOpen className="w-10 h-10 text-muted-foreground/40" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Select a company to manage</p>
              <p className="text-xs">Choose a company from the left</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={company.logoUrl} alt={company.name} className="h-10 object-contain" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">{company.name}</h2>
                  <p className="text-xs text-muted-foreground">/{company.slug}</p>
                </div>
              </div>
              <button onClick={() => handleRemove(company.slug)} className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            {/* Shareable Link */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">Shareable Training Link</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono truncate select-all">
                  {`${window.location.origin}/${company.slug}`}
                </div>
                <button onClick={() => copyLink(company.slug)} className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shrink-0">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <a href={`/${company.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs border border-border text-foreground px-4 py-2 rounded-lg hover:bg-secondary transition-colors shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </a>
              </div>
            </div>

            {/* Manager Emails */}
            <ManagerEmailsEditor
              company={company}
              onUpdate={async (updated: Company) => {
                await updateCompanyInDb(updated);
                setCompanies(await fetchCompanies());
              }}
            />

            {/* Module Permissions */}
            {company.id && (
              <AdminPermissionsPanel companyId={company.id} companyName={company.name} />
            )}

            {/* GTM Access */}
            {company.id && (
              <AdminGTMAccess companyId={company.id} companyName={company.name} />
            )}

            {/* Comment Routing */}
            {company.id && (
              <AdminCommentRouting companyId={company.id} companyName={company.name} />
            )}

            {/* Admin Guide */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Admin Guide</h3>
              </div>
              <div className="space-y-2">
                {[
                  "Add company-specific screenshots to each training module below.",
                  "Copy the shareable link above and send it to the company's team.",
                  "Employees open the link and see branded training with their own images.",
                  "Each company sees only their own images.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground"><strong>Step {i + 1}:</strong> {text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Image Manager */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Training Images for {company.name}
              </h3>
              <div className="space-y-2">
                {trainingCards.map(card => (
                  <TopicImageManager
                    key={card.id}
                    topicId={card.id}
                    topicTitle={`${card.number}. ${card.title}`}
                    companySlug={company.slug}
                    expanded={expandedTopic === card.id}
                    onToggle={() => setExpandedTopic(expandedTopic === card.id ? null : card.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Topic Image Manager ──────────────────────────────────────────────────────

const TopicImageManager = ({
  topicId, topicTitle, companySlug, expanded, onToggle,
}: {
  topicId: string; topicTitle: string; companySlug: string; expanded: boolean; onToggle: () => void;
}) => {
  const topic = trainingTopics[topicId];
  const [mediaMap, setMediaMap] = useState<Record<string, { id: string; url: string; caption?: string }[]>>({});

  const reload = async () => {
    const data = await fetchCompanyMedia(companySlug);
    const mapped: Record<string, { id: string; url: string; caption?: string }[]> = {};
    Object.entries(data).forEach(([key, items]) => {
      if (key.startsWith(topicId + "-")) mapped[key] = items.map(m => ({ id: m.id, url: m.url, caption: m.caption }));
    });
    setMediaMap(mapped);
  };

  useEffect(() => { if (expanded) reload(); }, [expanded, companySlug, topicId]);

  if (!topic) return null;
  const imageCount = Object.values(mediaMap).reduce((s, a) => s + a.length, 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={onToggle} className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{topicTitle}</span>
        </div>
        {imageCount > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{imageCount} image{imageCount !== 1 ? "s" : ""}</span>}
      </button>
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-4 bg-muted/20">
          {topic.steps.map((step, i) => {
            const stepKey = `${topicId}-${i}`;
            return (
              <StepImageEditor
                key={stepKey}
                stepIndex={i}
                stepTitle={step.title}
                media={mediaMap[stepKey] || []}
                onAdd={async (url, caption) => { await addCompanyMedia(companySlug, stepKey, url, caption || undefined); await reload(); }}
                onRemove={async (id) => { await removeCompanyMedia(id); await reload(); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Step Image Editor ────────────────────────────────────────────────────────

const StepImageEditor = ({
  stepIndex, stepTitle, media, onAdd, onRemove,
}: {
  stepIndex: number; stepTitle: string;
  media: { id: string; url: string; caption?: string }[];
  onAdd: (url: string, caption: string) => void;
  onRemove: (id: string) => void;
}) => {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Step {stepIndex + 1}: {stepTitle}</p>
      {media.map(m => (
        <div key={m.id} className="flex items-center gap-2 bg-background rounded-lg border border-border p-2">
          <img src={m.url} alt={m.caption || ""} className="w-16 h-10 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground truncate">{m.url}</p>
            {m.caption && <p className="text-xs text-muted-foreground truncate">{m.caption}</p>}
          </div>
          <button onClick={() => onRemove(m.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {!showInput ? (
        <button onClick={() => setShowInput(true)} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
          <Plus className="w-3 h-3" /> Add image
        </button>
      ) : (
        <div className="space-y-2 bg-background rounded-lg border border-border p-3">
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/image.png" className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex gap-2">
            <button onClick={() => { if (!url.trim()) return; onAdd(url.trim(), caption.trim()); setUrl(""); setCaption(""); setShowInput(false); }} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">Add</button>
            <button onClick={() => { setShowInput(false); setUrl(""); setCaption(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Manager Emails Editor ────────────────────────────────────────────────────

const ManagerEmailsEditor = ({ company, onUpdate }: { company: Company; onUpdate: (c: Company) => void }) => {
  const [newEmail, setNewEmail] = useState("");
  const emails = company.managerEmails || [];

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Manager / CEO Access</h3>
      </div>
      <p className="text-xs text-muted-foreground">Add emails of managers or CEOs who should see the <strong>Team Progress</strong> tab.</p>
      {emails.map(email => (
        <div key={email} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
          <span className="text-sm text-foreground flex-1">{email}</span>
          <button onClick={() => onUpdate({ ...company, managerEmails: emails.filter(e => e !== email) })} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              const email = newEmail.trim().toLowerCase();
              if (email && !emails.includes(email)) { onUpdate({ ...company, managerEmails: [...emails, email] }); setNewEmail(""); }
            }
          }}
          placeholder="manager@company.com"
          className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => {
            const email = newEmail.trim().toLowerCase();
            if (email && !emails.includes(email)) { onUpdate({ ...company, managerEmails: [...emails, email] }); setNewEmail(""); }
          }}
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// ─── Shell ────────────────────────────────────────────────────────────────────

const AdminPanelContent = () => (
  <div className="min-h-screen bg-background">
    <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="flex items-center gap-3">
        <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="h-10" />
        <div className="h-6 w-px bg-border" />
        <span className="text-sm font-semibold text-primary">Admin Panel</span>
      </div>
      <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Training</a>
    </header>

    <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Control Panel</h1>
      <p className="text-muted-foreground mb-8">Manage companies, team access, and training permissions.</p>

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Companies
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <CompaniesTab />
        </TabsContent>

        <TabsContent value="team">
          <AdminTeamTab />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

const AdminPanel = () => (
  <AdminPasswordGate>
    <AdminPanelContent />
  </AdminPasswordGate>
);

export default AdminPanel;
