import { useState } from "react";
import { Building2, Plus, X, Copy, Link as LinkIcon, ImageIcon, ChevronRight, ChevronDown, ExternalLink, Trash2, CheckCircle2, BookOpen, Share2, Info } from "lucide-react";
import { getCompanies, addCompany, removeCompany, getMediaKey, Company } from "@/lib/companies";
import { trainingTopics, trainingCards, TrainingMedia } from "@/lib/trainingData";
import { toast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const [companies, setCompanies] = useState<Company[]>(getCompanies);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Add company form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleAddCompany = () => {
    if (!name.trim() || !slug.trim() || !logoUrl.trim()) return;
    const updated = addCompany({ name: name.trim(), slug: slug.trim(), logoUrl: logoUrl.trim() });
    setCompanies([...updated]);
    setName(""); setSlug(""); setLogoUrl(""); setShowAddForm(false);
  };

  const handleRemoveCompany = (s: string) => {
    const updated = removeCompany(s);
    setCompanies([...updated]);
    if (selectedCompany === s) setSelectedCompany(null);
  };

  const copyLink = (s: string) => {
    const url = `${window.location.origin}/${s}`;
    navigator.clipboard.writeText(url);
  };

  const company = selectedCompany ? companies.find(c => c.slug === selectedCompany) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="h-10" />
          <div className="h-6 w-px bg-border" />
          <span className="text-sm font-semibold text-primary">Admin Panel</span>
        </div>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Training
        </a>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Control Panel</h1>
        <p className="text-muted-foreground mb-8">Manage companies, generate links, and update training images.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left: Company List */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Companies ({companies.length})
            </h2>

            <div className="space-y-2">
              {companies.map((c) => (
                <div
                  key={c.slug}
                  onClick={() => setSelectedCompany(c.slug)}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedCompany === c.slug
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/30"
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
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            ) : (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="w-4 h-4" />
                  New Company
                </div>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Company Name" className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Slug:</span>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Company logo URL" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddCompany} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add</button>
                  <button onClick={() => { setShowAddForm(false); setName(""); setSlug(""); setLogoUrl(""); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Company Detail / Media Manager */}
          <div className="rounded-2xl border border-border bg-card p-6 min-h-[400px]">
            {!company ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <p>Select a company to manage its training images</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Company Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={company.logoUrl} alt={company.name} className="h-10 object-contain" />
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{company.name}</h2>
                      <p className="text-xs text-muted-foreground">/{company.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyLink(company.slug)} className="flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </button>
                    <a href={`/${company.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview
                    </a>
                    <button onClick={() => handleRemoveCompany(company.slug)} className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Training Topics with Image Manager */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Training Images
                  </h3>
                  <div className="space-y-2">
                    {trainingCards.map((card) => (
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
      </div>
    </div>
  );
};

const TopicImageManager = ({
  topicId, topicTitle, companySlug, expanded, onToggle,
}: {
  topicId: string; topicTitle: string; companySlug: string; expanded: boolean; onToggle: () => void;
}) => {
  const topic = trainingTopics[topicId];
  const mediaStorageKey = getMediaKey(companySlug);

  const [extraMedia, setExtraMedia] = useState<Record<string, TrainingMedia[]>>(() => {
    const saved = localStorage.getItem(mediaStorageKey);
    return saved ? JSON.parse(saved) : {};
  });

  const addMedia = (stepKey: string, url: string, caption: string) => {
    const saved = localStorage.getItem(mediaStorageKey);
    const all = saved ? JSON.parse(saved) : {};
    if (!all[stepKey]) all[stepKey] = [];
    all[stepKey].push({ type: "image" as const, url, caption: caption || undefined });
    localStorage.setItem(mediaStorageKey, JSON.stringify(all));
    setExtraMedia({ ...all });
  };

  const removeMedia = (stepKey: string, index: number) => {
    const saved = localStorage.getItem(mediaStorageKey);
    const all = saved ? JSON.parse(saved) : {};
    if (all[stepKey]) {
      all[stepKey] = all[stepKey].filter((_: TrainingMedia, i: number) => i !== index);
      if (all[stepKey].length === 0) delete all[stepKey];
    }
    localStorage.setItem(mediaStorageKey, JSON.stringify(all));
    setExtraMedia({ ...all });
  };

  if (!topic) return null;

  // Count total images for this topic
  const imageCount = topic.steps.reduce((sum, _, i) => {
    const key = `${topicId}-${i}`;
    return sum + (extraMedia[key]?.length || 0);
  }, 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={onToggle} className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{topicTitle}</span>
        </div>
        {imageCount > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{imageCount} image{imageCount !== 1 ? "s" : ""}</span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-4 bg-muted/20">
          {topic.steps.map((step, i) => {
            const stepKey = `${topicId}-${i}`;
            const media = extraMedia[stepKey] || [];

            return (
              <StepImageEditor
                key={stepKey}
                stepIndex={i}
                stepTitle={step.title}
                media={media}
                onAdd={(url, caption) => addMedia(stepKey, url, caption)}
                onRemove={(idx) => removeMedia(stepKey, idx)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const StepImageEditor = ({
  stepIndex, stepTitle, media, onAdd, onRemove,
}: {
  stepIndex: number; stepTitle: string; media: TrainingMedia[];
  onAdd: (url: string, caption: string) => void;
  onRemove: (index: number) => void;
}) => {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  const handleAdd = () => {
    if (!url.trim()) return;
    onAdd(url.trim(), caption.trim());
    setUrl(""); setCaption(""); setShowInput(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Step {stepIndex + 1}: {stepTitle}</p>

      {media.length > 0 && (
        <div className="space-y-2">
          {media.map((m, k) => (
            <div key={k} className="flex items-center gap-2 bg-background rounded-lg border border-border p-2">
              <img src={m.url} alt={m.caption || ""} className="w-16 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{m.url}</p>
                {m.caption && <p className="text-xs text-muted-foreground truncate">{m.caption}</p>}
              </div>
              <button onClick={() => onRemove(k)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!showInput ? (
        <button onClick={() => setShowInput(true)} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
          <Plus className="w-3 h-3" />
          Add image
        </button>
      ) : (
        <div className="space-y-2 bg-background rounded-lg border border-border p-3">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/image.png" className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">Add</button>
            <button onClick={() => { setShowInput(false); setUrl(""); setCaption(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
