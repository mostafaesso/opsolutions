import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { fetchCompanyBySlug, Company } from "@/lib/companies";
import { trainingCards } from "@/lib/trainingData";
import { useTrainingUser, useCompletions } from "@/hooks/useTrainingUser";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationGate from "@/components/RegistrationGate";
import TeamProgress from "@/components/TeamProgress";
import { useEffect, useState } from "react";

const CompanyIndex = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    if (!companySlug) { setCompanyLoading(false); return; }
    fetchCompanyBySlug(companySlug).then((c) => {
      setCompany(c);
      setCompanyLoading(false);
    });
  }, [companySlug]);

  const { user, loading: regLoading, register } = useTrainingUser(companySlug || "");
  const { completions } = useCompletions(user?.id);

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

  const completedCount = completions.size;
  const totalCards = trainingCards.length;
  const progressPercent = Math.round((completedCount / totalCards) * 100);

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
            {company.managerEmails?.some(e => e.toLowerCase() === user.email.toLowerCase()) && (
              <TabsTrigger value="team">Team Progress</TabsTrigger>
            )}
          </TabsList>

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

            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingCards.map((card) => {
                  const isCompleted = completions.has(card.id);
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
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 ml-3" style={{ color: "hsl(160, 84%, 39%)" }} />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {company.managerEmails?.some(e => e.toLowerCase() === user.email.toLowerCase()) && (
            <TabsContent value="team">
              <TeamProgress companySlug={companySlug!} companyName={company.name} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyIndex;
