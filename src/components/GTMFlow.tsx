import { CheckCircle2, Lock } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Core HubSpot setup to get your team started.",
    features: [
      "HubSpot CRM onboarding",
      "Contact & deal pipeline setup",
      "Basic training access",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$400/mo",
    description: "Hands-on optimization for growing teams.",
    features: [
      "Everything in Free",
      "Monthly strategy sessions",
      "Custom pipeline configuration",
      "Marketing automation setup",
      "Reporting dashboards",
    ],
    highlight: true,
  },
  {
    name: "Scale",
    price: "$1,500/mo",
    description: "Full-service GTM execution and ongoing support.",
    features: [
      "Everything in Growth",
      "Dedicated ops specialist",
      "Weekly check-ins",
      "Sales enablement content",
      "Advanced integrations",
      "Priority support",
    ],
  },
];

interface GTMFlowProps {
  isAdmin: boolean;
  activeAccess?: "free" | "growth" | "scale" | null;
}

const tierOrder = ["free", "growth", "scale"];

const GTMFlow = ({ isAdmin, activeAccess }: GTMFlowProps) => {
  const activeTierIndex = activeAccess ? tierOrder.indexOf(activeAccess) : -1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">GTM Flow</h2>
        <p className="text-sm text-muted-foreground">
          Choose the engagement level that fits your team's goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier, idx) => {
          const tierKey = tierOrder[idx] as "free" | "growth" | "scale";
          const isUnlocked = isAdmin || activeTierIndex >= idx;

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all ${
                tier.highlight
                  ? "border-primary/60 bg-primary/5 shadow-sm"
                  : "border-border bg-card"
              } ${!isUnlocked ? "opacity-60" : ""}`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary text-primary-foreground px-3 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-foreground">{tier.name}</h3>
                  {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <p className="text-2xl font-bold text-primary">{tier.price}</p>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
              </div>

              <ul className="space-y-2 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: isUnlocked ? "hsl(160, 84%, 39%)" : undefined }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {!isUnlocked && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Contact your manager to unlock this tier.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GTMFlow;
