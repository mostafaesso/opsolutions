import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Company } from "@/lib/companies";
import CrmStatusTab from "./CrmStatusTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  companies: Company[];
}

const CrmStatusSection = ({ companies }: Props) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(companies[0]?.slug ?? "");

  useEffect(() => {
    if (!selectedSlug && companies[0]) setSelectedSlug(companies[0].slug);
  }, [companies, selectedSlug]);

  const company = companies.find((c) => c.slug === selectedSlug);

  return (
    <div className="space-y-4">
      {/* Company picker */}
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
  );
};

export default CrmStatusSection;
