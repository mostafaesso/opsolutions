import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, CheckCircle2, Lock, PlayCircle, BarChart2 } from "lucide-react";
import { fetchCompanyBySlug, Company } from "@/lib/companies";
import { trainingCards } from "@/lib/trainingData";
import { useTrainingUser, useCompletions } from "@/hooks/useTrainingUser";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationGate from "@/components/RegistrationGate";
import TeamProgress from "@/components/TeamProgress";
import CertificateDownload from "@/components/CertificateDownload";
import VideoPlayer from "@/components/VideoPlayer";
import CommentThread from "@/components/CommentThread";
import GTMFlow from "@/components/GTMFlow";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration: number | null;
  thumbnail_url: string | null;
  order_index: number;
}

const CompanyIndex = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    if (!companySlug) { setCompanyLoading(false); return; }
    fetchCompanyBySlug(companySlug).then(c => { setCompany(c); setCompanyLoading(false); });
  }, [companySlug]);

  const { user, loading: regLoading, register } = useTrainingUser(companySlug || "");
  const { completions, scores } = useCompletions(user?.id);

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

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

  if (company.isActive === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">This portal is currently unavailable</h1>
          <p className="text-muted-foreground">Access has been temporarily disabled. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <RegistrationGate
        companyName={company.name}
        companyLogo={company.logoUrl}
        loading={regLoading}
        onRegister={register}
      />
    );
  }

  const [gtmActive, setGtmActive] = useState(false);
  useEffect(() => {
    if (!company.id) return;
    (supabase as any)
      .from("company_gtm_access")
      .select("is_active")
      .eq("company_id", company.id)
      .maybeSingle()
      .then(({ data }: any) => { if (data?.is_active) setGtmActive(true); });
  }, [company.id]);

  const completedCount = completions.size;
  const totalCards = trainingCards.length;
  const progressPercent = Math.round((completedCount / totalCards) * 100);
  const isManager = company.managerEmails?.some(e => e.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <img src={company.logoUrl} alt={company.name} className="h-10 object-contain" />
          <div className="hidden sm:block h-6 w-px bg-border" />
          <img src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png" alt="Ops Solutions" className="hidden sm:block h-8 opacity-60" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">👋 {user.full_name}</span>
          <span className="text-sm text-muted-foreground">Powered by Ops Solutions</span>
        </div>
      </header>

      <div className="px-6 md:px-8 py-12 md:py-16 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Training for {company.name}</h1>
        <p className="text-muted-foreground text-lg mb-6 max-w-2xl">Complete HubSpot CRM training modules. Click any card to explore step-by-step guidance.</p>

        <Tabs defaultValue="training" className="space-y-6">
          <TabsList>
            <TabsTrigger value="training">My Training</TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4" /> Videos
            </TabsTrigger>
            {gtmActive && (
              <TabsTrigger value="gtm" className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" /> GTM Flow
              </TabsTrigger>
            )}
            {isManager && <TabsTrigger value="team">Team Progress</TabsTrigger>}
          </TabsList>

          {/* ── Training Tab ─────────────────────────────────────────────── */}
          <TabsContent value="training">
            <div className="rounded-xl border border-border bg-card p-4 mb-6 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">Your Progress</span>
                  <span className="text-sm text-muted-foreground">{completedCount}/{totalCards} completed</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>
              <span className="text-lg font-bold text-primary">{progressPercent}%</span>
            </div>

            <CertificateDownload
              userName={user.full_name}
              companyName={company.name}
              completedCount={completedCount}
              totalCount={totalCards}
            />

            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingCards.map((card, idx) => {
                  const isCompleted = completions.has(card.id);
                  const isLocked = idx > 0 && !completions.has(trainingCards[idx - 1].id);
                  const score = scores[card.id];

                  if (isLocked) {
                    return (
                      <button
                        key={card.id}
                        onClick={() => toast({ title: `Complete module ${trainingCards[idx - 1].number} first`, description: `Finish "${trainingCards[idx - 1].title}" to unlock this module.` })}
                        className="group flex items-center justify-between rounded-xl border border-border bg-muted/40 p-5 text-left opacity-60 cursor-not-allowed"
                      >
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-muted-foreground mb-1">{card.number}. {card.title}</h3>
                          <p className="text-sm text-muted-foreground">{card.desc}</p>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0 ml-3" />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={card.id}
                      onClick={() => navigate(`/${companySlug}/training/${card.id}`)}
                      className={`group flex items-center justify-between rounded-xl border p-5 text-left transition-all hover:shadow-md ${
                        isCompleted ? "border-green-200 bg-green-50/50" : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-foreground mb-1">{card.number}. {card.title}</h3>
                        <p className="text-sm text-muted-foreground">{card.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(160, 84%, 39%)" }} />
                            {score !== undefined && <span className="text-xs font-semibold text-green-600">{score}%</span>}
                          </>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── Videos Tab ───────────────────────────────────────────────── */}
          <TabsContent value="videos">
            {company.id ? (
              <VideosSection companyId={company.id} userId={user.id} userName={user.full_name} userEmail={user.email} />
            ) : (
              <p className="text-sm text-muted-foreground">Videos unavailable.</p>
            )}
          </TabsContent>

          {/* ── GTM Flow Tab ─────────────────────────────────────────────── */}
          {gtmActive && company.id && (
            <TabsContent value="gtm">
              <GTMFlow
                companyId={company.id}
                currentUser={{ id: user.id, full_name: user.full_name, email: user.email }}
              />
            </TabsContent>
          )}

          {/* ── Team Tab ─────────────────────────────────────────────────── */}
          {isManager && (
            <TabsContent value="team">
              <TeamProgress companySlug={companySlug!} companyName={company.name} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

// ─── Videos Section ───────────────────────────────────────────────────────────

interface VideosSectionProps {
  companyId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

const VideosSection = ({ companyId, userId, userName, userEmail }: VideosSectionProps) => {
  const [videos, setVideos] = useState<VideoModule[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<VideoModule | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [{ data: vids }, { data: comps }] = await Promise.all([
      (supabase as any).from("video_modules").select("*").eq("is_published", true).order("order_index"),
      (supabase as any).from("video_completions").select("video_id").eq("user_id", userId),
    ]);
    const list: VideoModule[] = vids || [];
    setVideos(list);
    setCompletedIds(new Set((comps || []).map((c: any) => c.video_id)));
    if (list.length > 0 && !selected) setSelected(list[0]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading videos…</p>;

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <PlayCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No videos available yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Check back soon — new training videos are on the way.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar: video list */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {videos.length} Video{videos.length !== 1 ? "s" : ""}
        </h3>
        {videos.map((v, i) => {
          const done = completedIds.has(v.id);
          return (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                selected?.id === v.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                done ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${selected?.id === v.id ? "text-primary" : "text-foreground"}`}>{v.title}</p>
                {v.duration && (
                  <p className="text-xs text-muted-foreground mt-0.5">{Math.floor(v.duration / 60)}m {v.duration % 60}s</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main: player + comments */}
      {selected && (
        <div className="space-y-8">
          <VideoPlayer
            videoId={selected.id}
            title={selected.title}
            description={selected.description}
            videoUrl={selected.video_url}
            userId={userId}
            isCompleted={completedIds.has(selected.id)}
            onComplete={() => {
              setCompletedIds(prev => new Set([...prev, selected.id]));
            }}
          />
          <div className="h-px bg-border" />
          <CommentThread
            moduleId={selected.id}
            moduleType="video"
            companyId={companyId}
            currentUser={{ id: userId, full_name: userName, email: userEmail }}
            canComment={true}
          />
        </div>
      )}
    </div>
  );
};

export default CompanyIndex;
