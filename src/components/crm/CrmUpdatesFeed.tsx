import { useState } from "react";
import { useImprovements } from "@/hooks/useImprovements";
import { Improvement } from "@/integrations/supabase/phase2_types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface CrmUpdatesFeedProps {
  companySlug: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  property: "bg-blue-100 text-blue-700",
  report: "bg-purple-100 text-purple-700",
  dashboard: "bg-amber-100 text-amber-700",
  lifecycle: "bg-pink-100 text-pink-700",
  general: "bg-slate-100 text-slate-700",
  other: "bg-slate-100 text-slate-700",
};

const CATEGORY_LABEL: Record<string, string> = {
  property: "Property",
  report: "Report",
  dashboard: "Dashboard",
  lifecycle: "Lifecycle Stage",
  general: "General",
  other: "Other",
};

const CrmUpdatesFeed = ({ companySlug }: CrmUpdatesFeedProps) => {
  const { improvements, loading } = useImprovements(companySlug);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading updates…</p>;
  }

  if (improvements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <p className="text-sm font-medium">No CRM updates yet</p>
        <p className="text-xs">Updates from your Ops Solutions team will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {improvements.map((u: any) => {
        const isOpen = expandedId === u.id;
        const cat = (u.category as string) ?? "other";

        return (
          <Card key={u.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedId(isOpen ? null : u.id)}
              className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge
                    className={`${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other} border-0 font-medium`}
                  >
                    {CATEGORY_LABEL[cat] ?? cat}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(u.implemented_date ?? u.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{u.title}</h3>
                {u.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {u.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 mt-1 text-muted-foreground">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 border-t border-border bg-muted/10 space-y-5 pt-5">
                {(u.before_image_url || u.after_image_url) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {u.before_image_url && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Before
                        </p>
                        <a
                          href={u.before_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-border overflow-hidden bg-background"
                        >
                          <img
                            src={u.before_image_url}
                            alt="Before"
                            className="w-full h-48 object-cover"
                          />
                        </a>
                      </div>
                    )}
                    {u.after_image_url && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          After
                        </p>
                        <a
                          href={u.after_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-border overflow-hidden bg-background"
                        >
                          <img
                            src={u.after_image_url}
                            alt="After"
                            className="w-full h-48 object-cover"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <DetailBlock label="Goal" value={u.goal} />
                <DetailBlock label="Issue Solved" value={u.issue_solved} />
                <DetailBlock
                  label="In Plain English"
                  value={u.simple_explanation ?? u.impact_summary}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

const DetailBlock = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{value}</p>
    </div>
  );
};

export default CrmUpdatesFeed;
