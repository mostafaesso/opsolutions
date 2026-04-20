import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trainingCards } from "@/lib/trainingData";
import { toast } from "@/hooks/use-toast";

interface PermRow {
  id?: string;
  can_view: boolean;
  can_comment: boolean;
  can_edit: boolean;
}

type RoleKey = "employee" | "manager" | "company_admin";

const ROLES: { key: RoleKey; label: string }[] = [
  { key: "employee", label: "Employee" },
  { key: "manager", label: "Manager" },
  { key: "company_admin", label: "Company Admin" },
];

const DEFAULT_PERMS: Record<RoleKey, PermRow> = {
  employee:      { can_view: true,  can_comment: false, can_edit: false },
  manager:       { can_view: true,  can_comment: true,  can_edit: false },
  company_admin: { can_view: true,  can_comment: true,  can_edit: true  },
};

interface AdminPermissionsPanelProps {
  companyId: string;
  companyName: string;
}

const AdminPermissionsPanel = ({ companyId, companyName }: AdminPermissionsPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  // moduleId -> role -> perm row
  const [perms, setPerms] = useState<Record<string, Record<RoleKey, PermRow>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchPerms = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("module_permissions")
      .select("*")
      .eq("company_id", companyId);

    const map: Record<string, Record<RoleKey, PermRow>> = {};
    (data || []).forEach((row: any) => {
      if (!map[row.module_id]) map[row.module_id] = {} as Record<RoleKey, PermRow>;
      map[row.module_id][row.role as RoleKey] = {
        id: row.id,
        can_view: row.can_view,
        can_comment: row.can_comment,
        can_edit: row.can_edit,
      };
    });
    setPerms(map);
  }, [companyId]);

  useEffect(() => {
    if (expanded) fetchPerms();
  }, [expanded, fetchPerms]);

  const getRow = (moduleId: string, role: RoleKey): PermRow =>
    perms[moduleId]?.[role] ?? { ...DEFAULT_PERMS[role] };

  const togglePerm = async (
    moduleId: string,
    role: RoleKey,
    field: "can_view" | "can_comment" | "can_edit"
  ) => {
    const key = `${moduleId}-${role}`;
    setSaving(key);
    const current = getRow(moduleId, role);
    const updated = { ...current, [field]: !current[field] };
    try {
      if (current.id) {
        const { error } = await (supabase as any)
          .from("module_permissions")
          .update({ [field]: updated[field], updated_at: new Date().toISOString() })
          .eq("id", current.id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("module_permissions")
          .insert({
            company_id: companyId,
            module_id: moduleId,
            role,
            ...updated,
          })
          .select()
          .single();
        if (error) throw error;
        updated.id = data.id;
      }
      setPerms(prev => ({
        ...prev,
        [moduleId]: { ...(prev[moduleId] ?? {}), [role]: updated },
      }));
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Module Permissions for {companyName}</span>
        </div>
        <span className="text-xs text-muted-foreground">can_view / can_comment / can_edit</span>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/10 p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Toggle access per training module per role. Defaults: Employee=view, Manager=view+comment, Company Admin=all.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground w-40">Module</th>
                  {ROLES.map(r => (
                    <th key={r.key} className="text-center py-2 px-2 font-semibold text-muted-foreground" colSpan={3}>
                      {r.label}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <th />
                  {ROLES.map(r => (
                    ["View", "Comment", "Edit"].map(f => (
                      <th key={`${r.key}-${f}`} className="text-center py-1.5 px-1 text-muted-foreground/70 font-normal">
                        {f}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainingCards.map(card => (
                  <tr key={card.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-2 pr-4 text-foreground font-medium truncate max-w-[160px]">
                      {card.number}. {card.title}
                    </td>
                    {ROLES.map(r => {
                      const row = getRow(card.id, r.key);
                      const isLoading = saving === `${card.id}-${r.key}`;
                      return (
                        ["can_view", "can_comment", "can_edit"].map(f => (
                          <td key={`${r.key}-${f}`} className="text-center py-2 px-1">
                            <button
                              disabled={!!isLoading}
                              onClick={() => togglePerm(card.id, r.key, f as any)}
                              className={`w-5 h-5 rounded border transition-colors mx-auto block ${
                                row[f as keyof PermRow]
                                  ? "bg-primary border-primary"
                                  : "bg-background border-border hover:border-primary/50"
                              } ${isLoading ? "opacity-50" : ""}`}
                            >
                              {row[f as keyof PermRow] && (
                                <svg viewBox="0 0 10 10" className="w-full h-full p-0.5">
                                  <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          </td>
                        ))
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsPanel;
