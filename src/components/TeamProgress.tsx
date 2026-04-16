import { useTeamProgress } from "@/hooks/useTrainingUser";
import { trainingCards } from "@/lib/trainingData";
import { CheckCircle2, Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  companySlug: string;
  companyName: string;
}

const ScoreBadge = ({ score }: { score: number | null }) => {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const cls =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 60
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {score}%
    </span>
  );
};

const TeamProgress = ({ companySlug, companyName }: Props) => {
  const { members, loading } = useTeamProgress(companySlug);
  const totalCards = trainingCards.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading team progress...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Users className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">No team members yet</p>
        <p className="text-xs">Members will appear here once they register and start training</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-foreground">{companyName} Team Progress</h2>
        <span className="text-xs text-muted-foreground">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Member</span>
          <span className="text-center w-20">Avg Score</span>
          <span className="text-center w-24">Progress</span>
          <span className="text-right w-20">Completed</span>
        </div>

        {members.map((member) => {
          const completed = member.completedCards.length;
          const percent = Math.round((completed / totalCards) * 100);

          return (
            <div
              key={member.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{member.full_name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="w-20 flex justify-center">
                <ScoreBadge score={member.avgScore} />
              </div>
              <div className="w-24">
                <Progress value={percent} className="h-2" />
                <p className="text-xs text-muted-foreground text-center mt-1">{percent}%</p>
              </div>
              <div className="w-20 text-right">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  {completed === totalCards && (
                    <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(160, 84%, 39%)" }} />
                  )}
                  {completed}/{totalCards}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card-level breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Completion by Module</h3>
        <div className="space-y-2">
          {trainingCards.map((card) => {
            const completedCount = members.filter((m) =>
              m.completedCards.includes(card.id)
            ).length;
            const pct = Math.round((completedCount / members.length) * 100);
            const avgModuleScore =
              members.filter((m) => m.scoreMap[card.id] !== undefined).length > 0
                ? Math.round(
                    members
                      .filter((m) => m.scoreMap[card.id] !== undefined)
                      .reduce((sum, m) => sum + m.scoreMap[card.id], 0) /
                      members.filter((m) => m.scoreMap[card.id] !== undefined).length
                  )
                : null;

            return (
              <div key={card.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                  {card.number}.
                </span>
                <span className="text-sm text-foreground flex-1">{card.title}</span>
                {avgModuleScore !== null && (
                  <ScoreBadge score={avgModuleScore} />
                )}
                <Progress value={pct} className="h-1.5 w-20" />
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {completedCount}/{members.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamProgress;
