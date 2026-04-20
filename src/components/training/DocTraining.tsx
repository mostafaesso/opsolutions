import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCompanyMedia, CompanyMedia } from "@/lib/companies";
import { HUBSPOT_JOURNEY } from "@/lib/hubspotJourney";
import { Progress } from "@/components/ui/progress";

interface DocTrainingProps {
  companySlug: string;
  userId?: string; // when present, completions are tracked
  completions: Set<string>;
  onMarkDone: (stepKey: string) => void;
}

const DocTraining = ({ companySlug, userId, completions, onMarkDone }: DocTrainingProps) => {
  const [media, setMedia] = useState<Record<string, CompanyMedia[]>>({});
  const [openStep, setOpenStep] = useState<string | null>(HUBSPOT_JOURNEY[0]?.key ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyMedia(companySlug).then((m) => {
      setMedia(m);
      setLoading(false);
    });
  }, [companySlug]);

  const doneCount = useMemo(
    () => HUBSPOT_JOURNEY.filter((s) => completions.has(s.key)).length,
    [completions]
  );
  const pct = Math.round((doneCount / HUBSPOT_JOURNEY.length) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">HubSpot Journey</h3>
            <p className="text-xs text-muted-foreground">
              From form submission to deal closed.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary leading-none">{pct}%</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {doneCount}/{HUBSPOT_JOURNEY.length} steps
            </p>
          </div>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <ol className="relative border-l-2 border-border ml-3 space-y-4">
        {HUBSPOT_JOURNEY.map((step) => {
          const isOpen = openStep === step.key;
          const isDone = completions.has(step.key);
          const stepMedia = media[step.key] ?? [];

          return (
            <li key={step.key} className="ml-6">
              <span
                className={`absolute -left-[15px] flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-background text-xs font-bold ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
              </span>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenStep(isOpen ? null : step.key)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      Step {step.number}: {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">
                    {isOpen ? "Hide" : "View"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border bg-muted/10">
                    <p className="text-sm text-foreground pt-4">{step.description}</p>

                    <ul className="space-y-1.5">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Screenshots
                      </p>
                      {loading ? (
                        <p className="text-xs text-muted-foreground">Loading…</p>
                      ) : stepMedia.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border bg-background p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <ImageIcon className="w-5 h-5" />
                          <p className="text-xs">No screenshots yet for this step</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {stepMedia.map((m) => (
                            <a
                              key={m.id}
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg border border-border bg-background overflow-hidden hover:border-primary/40 transition-colors"
                            >
                              <img
                                src={m.url}
                                alt={m.caption ?? step.title}
                                className="w-full h-40 object-cover"
                              />
                              {m.caption && (
                                <p className="text-xs text-muted-foreground px-3 py-2 line-clamp-2">
                                  {m.caption}
                                </p>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {userId && (
                      <div className="flex justify-end pt-2">
                        {isDone ? (
                          <span className="text-xs flex items-center gap-1.5 text-green-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Marked as done
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onMarkDone(step.key)}
                            className="text-xs"
                          >
                            Mark as done
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default DocTraining;
