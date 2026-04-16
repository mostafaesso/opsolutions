import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Play, Check, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchCompanyBySlug, fetchCompanyMedia, Company } from "@/lib/companies";
import { trainingTopics, TrainingMedia } from "@/lib/trainingData";
import { useCompletions, useQuizScores, saveQuizScore } from "@/hooks/useTrainingUser";
import Quiz from "@/components/Quiz";

const MediaEmbed = ({ media }: { media: TrainingMedia }) => {
  const [playing, setPlaying] = useState(false);

  if (media.type === "video") {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-muted">
        {!playing ? (
          <div className="relative cursor-pointer group" onClick={() => setPlaying(true)}>
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors shadow-lg">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              </div>
            </div>
            {media.caption && (
              <p className="text-xs text-muted-foreground p-2 border-t border-border">{media.caption}</p>
            )}
          </div>
        ) : (
          <div>
            <video src={media.url} controls autoPlay className="w-full aspect-video" />
            {media.caption && (
              <p className="text-xs text-muted-foreground p-2 border-t border-border">{media.caption}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-muted">
      <img src={media.url} alt={media.caption || "Training screenshot"} className="w-full object-cover" loading="lazy" />
      {media.caption && (
        <p className="text-xs text-muted-foreground p-2 border-t border-border">{media.caption}</p>
      )}
    </div>
  );
};

const TrainingDetail = () => {
  const { topicId, companySlug } = useParams<{ topicId: string; companySlug?: string }>();
  const navigate = useNavigate();
  const topic = topicId ? trainingTopics[topicId] : null;

  const [company, setCompany] = useState<Company | null>(null);
  const [extraMedia, setExtraMedia] = useState<Record<string, TrainingMedia[]>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [latestScore, setLatestScore] = useState<number | null>(null);

  useEffect(() => {
    if (!companySlug) return;
    fetchCompanyBySlug(companySlug).then(setCompany);
    fetchCompanyMedia(companySlug).then((media) => {
      const mapped: Record<string, TrainingMedia[]> = {};
      Object.entries(media).forEach(([key, items]) => {
        mapped[key] = items.map((m) => ({ type: "image" as const, url: m.url, caption: m.caption }));
      });
      setExtraMedia(mapped);
    });
  }, [companySlug]);

  const savedUser = companySlug
    ? (() => { const s = localStorage.getItem(`training-user-${companySlug}`); return s ? JSON.parse(s) : null; })()
    : null;

  const { completions, toggleCompletion } = useCompletions(savedUser?.id);
  const { scores: quizScores } = useQuizScores(savedUser?.id);

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Training topic not found</p>
      </div>
    );
  }

  const topicIds = Object.keys(trainingTopics);
  const currentIdx = topicIds.indexOf(topic.id);
  const prevTopic = currentIdx > 0 ? trainingTopics[topicIds[currentIdx - 1]] : null;
  const nextTopic = currentIdx < topicIds.length - 1 ? trainingTopics[topicIds[currentIdx + 1]] : null;
  const nextTopicPath = nextTopic
    ? `${companySlug ? `/${companySlug}` : ""}/training/${nextTopic.id}`
    : null;

  const isCompleted = topicId ? completions.has(topicId) : false;
  const displayScore = latestScore ?? (topicId ? quizScores[topicId]?.percent ?? null : null);

  const handleQuizFinish = async (score: number, total: number, passed: boolean) => {
    if (!savedUser || !topicId) return;
    await saveQuizScore(savedUser.id, topicId, score, total, passed);
    if (passed && !completions.has(topicId)) {
      await toggleCompletion(topicId);
    }
    setLatestScore(Math.round((score / total) * 100));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(companySlug ? `/${companySlug}` : "/")} className="flex items-center gap-3">
            {company ? (
              <>
                <img src={company.logoUrl} alt={company.name} className="h-10 object-contain" />
                <div className="hidden sm:block h-6 w-px bg-border" />
                <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="hidden sm:block h-8 opacity-60" />
              </>
            ) : (
              <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="h-10" />
            )}
          </button>
        </div>
        {company ? (
          <span className="text-sm text-muted-foreground">Powered by Ops Solutions</span>
        ) : (
          <a href="https://www.opsolutionss.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 border border-border text-sm text-foreground px-4 py-2 rounded-full hover:border-primary/50 hover:bg-secondary transition-all">
            Visit Ops Solutions
          </a>
        )}
      </header>

      <div className="px-6 md:px-8 py-10 max-w-6xl mx-auto">
        <button onClick={() => navigate(companySlug ? `/${companySlug}` : "/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Training Overview
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold bg-primary text-primary-foreground">
            {topic.number}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{topic.title}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mb-10">{topic.overview}</p>

        <div className="space-y-8">
          {topic.steps.map((step, i) => {
            const stepKey = `${topicId}-${i}`;
            const savedMedia = extraMedia[stepKey] || [];
            const allMedia = [...(step.media || []), ...savedMedia];

            return (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">Step {i + 1}: {step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                </div>

                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
                        📋 How to do it
                      </h4>
                      <ol className="space-y-3">
                        {step.instructions.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center mt-0.5">
                              {j + 1}
                            </span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {step.mistakes.length > 0 && (
                      <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-4">
                        <h4 className="text-sm font-semibold text-destructive mb-3">
                          ⚠️ Common Mistakes
                        </h4>
                        <ul className="space-y-2">
                          {step.mistakes.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <span className="text-destructive shrink-0 mt-0.5">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {allMedia.length > 0 && (
                    <div className="lg:w-[380px] shrink-0 p-4 border-t lg:border-t-0 lg:border-l border-border bg-muted/30 space-y-3">
                      {allMedia.map((m, k) => (
                        <div key={k}><MediaEmbed media={m} /></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {savedUser && topicId && (
          <div className="pt-8 space-y-4">
            {showQuiz ? (
              <Quiz
                topicId={topicId}
                nextTopicPath={nextTopicPath}
                onFinish={handleQuizFinish}
              />
            ) : isCompleted ? (
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-green-50 border-2 border-green-200">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Module Completed</span>
                {displayScore !== null && (
                  <span className="ml-auto text-sm font-bold text-green-700">{displayScore}%</span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowQuiz(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Check className="w-4 h-4" /> Take Quiz to Complete Module
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-10 pb-16">
          {prevTopic ? (
            <button onClick={() => navigate(`${companySlug ? `/${companySlug}` : ""}/training/${prevTopic.id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> {prevTopic.number}. {prevTopic.title}
            </button>
          ) : <div />}
          {nextTopic ? (
            <button onClick={() => navigate(`${companySlug ? `/${companySlug}` : ""}/training/${nextTopic.id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {nextTopic.number}. {nextTopic.title} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => navigate(companySlug ? `/${companySlug}` : "/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Overview <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingDetail;
