import { useState, useEffect, useCallback } from "react";
import { Bell, ChevronDown, ChevronRight, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminCommentRoutingProps {
  companyId: string;
  companyName: string;
}

const ROUTE_OPTIONS = [
  { key: "super_admin",    label: "Super Admin" },
  { key: "company_owner",  label: "Company Owner" },
  { key: "admins",         label: "Company Admins" },
  { key: "managers",       label: "Managers" },
  { key: "all",            label: "All Users" },
];

interface Routing {
  id?: string;
  route_to: string[];
  additional_emails: string[];
}

const AdminCommentRouting = ({ companyId, companyName }: AdminCommentRoutingProps) => {
  const [expanded, setExpanded] = useState(false);
  const [routing, setRouting] = useState<Routing>({ route_to: ["super_admin"], additional_emails: [] });
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRouting = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("comment_routing")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();
    if (data) setRouting({ id: data.id, route_to: data.route_to, additional_emails: data.additional_emails });
  }, [companyId]);

  useEffect(() => { if (expanded) fetchRouting(); }, [expanded, fetchRouting]);

  const save = async (updated: Routing) => {
    setSaving(true);
    try {
      if (updated.id) {
        const { error } = await (supabase as any)
          .from("comment_routing")
          .update({ route_to: updated.route_to, additional_emails: updated.additional_emails, updated_at: new Date().toISOString() })
          .eq("id", updated.id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("comment_routing")
          .insert({ company_id: companyId, route_to: updated.route_to, additional_emails: updated.additional_emails })
          .select()
          .single();
        if (error) throw error;
        updated.id = data.id;
      }
      setRouting(updated);
      toast({ title: "Routing saved" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleRoute = (key: string) => {
    const current = routing.route_to;
    const next = current.includes(key) ? current.filter(r => r !== key) : [...current, key];
    const updated = { ...routing, route_to: next };
    setRouting(updated);
    save(updated);
  };

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || routing.additional_emails.includes(email)) return;
    const updated = { ...routing, additional_emails: [...routing.additional_emails, email] };
    setRouting(updated);
    setNewEmail("");
    save(updated);
  };

  const removeEmail = (email: string) => {
    const updated = { ...routing, additional_emails: routing.additional_emails.filter(e => e !== email) };
    setRouting(updated);
    save(updated);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Comment Routing for {companyName}</span>
        </div>
        <span className="text-xs text-muted-foreground">{routing.route_to.length} target{routing.route_to.length !== 1 ? "s" : ""}</span>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/10 p-4 space-y-5">
          <p className="text-xs text-muted-foreground">When a comment is posted in this company's portal, notify:</p>

          {/* Role targets */}
          <div className="space-y-2">
            {ROUTE_OPTIONS.map(opt => (
              <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => toggleRoute(opt.key)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    routing.route_to.includes(opt.key) ? "bg-primary border-primary" : "bg-background border-border group-hover:border-primary/50"
                  } ${saving ? "opacity-50" : ""}`}
                >
                  {routing.route_to.includes(opt.key) && (
                    <svg viewBox="0 0 10 10" className="w-full h-full p-0.5">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Additional emails */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Additional email recipients</p>
            {routing.additional_emails.map(email => (
              <div key={email} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                <span className="text-sm text-foreground flex-1">{email}</span>
                <button onClick={() => removeEmail(email)} disabled={saving} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addEmail()}
                placeholder="notify@example.com"
                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={addEmail}
                disabled={saving}
                className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommentRouting;
