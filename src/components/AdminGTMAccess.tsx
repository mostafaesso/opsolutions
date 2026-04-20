import { useState, useEffect, useCallback } from "react";
import { BarChart2, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminGTMAccessProps {
  companyId: string;
  companyName: string;
}

type Tier = "free" | "mid" | "pro";
const ALL_TIERS: Tier[] = ["free", "mid", "pro"];
const TIER_LABELS: Record<Tier, string> = { free: "Free", mid: "$400/mo", pro: "$1,500/mo" };

interface GTMAccess {
  id?: string;
  is_active: boolean;
  tiers_visible: Tier[];
}

const AdminGTMAccess = ({ companyId, companyName }: AdminGTMAccessProps) => {
  const [expanded, setExpanded] = useState(false);
  const [access, setAccess] = useState<GTMAccess>({ is_active: false, tiers_visible: ["free", "mid", "pro"] });
  const [saving, setSaving] = useState(false);

  const fetchAccess = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("company_gtm_access")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();
    if (data) setAccess({ id: data.id, is_active: data.is_active, tiers_visible: data.tiers_visible });
  }, [companyId]);

  useEffect(() => { if (expanded) fetchAccess(); }, [expanded, fetchAccess]);

  const save = async (updated: GTMAccess) => {
    setSaving(true);
    try {
      if (updated.id) {
        const { error } = await (supabase as any)
          .from("company_gtm_access")
          .update({ is_active: updated.is_active, tiers_visible: updated.tiers_visible, updated_at: new Date().toISOString() })
          .eq("id", updated.id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("company_gtm_access")
          .insert({ company_id: companyId, is_active: updated.is_active, tiers_visible: updated.tiers_visible })
          .select()
          .single();
        if (error) throw error;
        updated.id = data.id;
      }
      setAccess(updated);
      toast({ title: "GTM access updated" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = () => save({ ...access, is_active: !access.is_active });

  const toggleTier = (tier: Tier) => {
    const current = access.tiers_visible;
    const next = current.includes(tier) ? current.filter(t => t !== tier) : [...current, tier];
    if (next.length === 0) return;
    save({ ...access, tiers_visible: next as Tier[] });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <BarChart2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">GTM Flow Access for {companyName}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${access.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
          {access.is_active ? "Active" : "Inactive"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/10 p-4 space-y-4">
          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable GTM Flow</p>
              <p className="text-xs text-muted-foreground">Show the GTM Flow tab to this company's employees</p>
            </div>
            <button
              onClick={toggleActive}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${access.is_active ? "bg-primary" : "bg-muted-foreground/30"} disabled:opacity-50`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${access.is_active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Tier visibility */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Visible Tiers</p>
            <p className="text-xs text-muted-foreground mb-3">Choose which pricing tiers this company can see in the GTM Flow.</p>
            <div className="flex gap-2 flex-wrap">
              {ALL_TIERS.map(tier => (
                <button
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 ${
                    access.tiers_visible.includes(tier)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {TIER_LABELS[tier]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGTMAccess;
