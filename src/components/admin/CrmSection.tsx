import { useState, useEffect } from "react";
import { Bell, Activity, Building2 } from "lucide-react";
import { Company } from "@/lib/companies";
import CrmUpdatesPanel from "./CrmUpdatesPanel";
import CrmStatusTab from "./CrmStatusTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubTab = "updates" | "status";

interface Props {
  companies: Company[];
}

const SUB_TABS: { key: SubTab; label: string; icon: any }[] = [
  { key: "updates", label: "Updates Feed",       icon: Bell },
  { key: "status",  label: "Current CRM Status", icon: Activity },
];

const CrmSection = ({ companies }: Props) => {
  const [tab, setTab] = useState<SubTab>("updates");
  const [selectedSlug, setSelectedSlug] = useState<string>(companies[0]?.slug ?? "");

  useEffect(() => {
    if (!selectedSlug && companies[0]) setSelectedSlug(companies[0].slug);
  }, [companies, selectedSlug]);

  const company = companies.find((c) => c.slug === selectedSlug);

  return (
    <div className="space-y-5">
      {/* Sub-tab nav */}
      <div className="rounded-xl border border-border bg-card p-1.5 inline-flex flex-wrap gap-1">
        {SUB_TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "updates" && <CrmUpdatesPanel companies={companies} />}

      {tab === "status" && (
        <div className="space-y-4">
          {/* Company picker for status tab */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Company
              </p>
              <p className="text-sm font-bold text-foreground">
                {company?.name ?? "Select a company"}
              </p>
            </div>
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CrmStatusTab companySlug={selectedSlug} companyName={company?.name} />
        </div>
      )}
    </div>
  );
};

export default CrmSection;
