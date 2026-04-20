import { useState, useEffect, useCallback } from "react";
import { Users, Plus, X, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InternalUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

const AdminTeamTab = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("internal_users")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const inviteUser = async () => {
    if (!email.trim() || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("internal_users").insert({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: "internal_admin",
      });
      if (error) throw error;
      setEmail(""); setName(""); setShowForm(false);
      await fetchUsers();
      toast({ title: "Team member added!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (id: string, role: string) => {
    if (role === "super_admin") {
      toast({ title: "Cannot remove super admin", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any).from("internal_users").delete().eq("id", id);
    if (!error) { await fetchUsers(); toast({ title: "User removed" }); }
  };

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    internal_admin: "Internal Admin",
    company_admin: "Company Admin",
    manager: "Manager",
    employee: "Employee",
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading team…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Internal Team</h2>
          <p className="text-sm text-muted-foreground">Ops Solutions staff with platform access.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Invite Admin
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> New Internal Admin
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            onKeyDown={e => e.key === "Enter" && inviteUser()}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={inviteUser}
              disabled={saving}
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEmail(""); setName(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.map(u => (
          <div
            key={u.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{u.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                u.role === "super_admin"
                  ? "bg-[#1B2A4A]/10 text-[#1B2A4A]"
                  : "bg-primary/10 text-primary"
              }`}>
                {u.role === "super_admin" && <Shield className="w-3 h-3 inline mr-0.5" />}
                {roleLabel[u.role] ?? u.role}
              </span>
              {u.role !== "super_admin" && (
                <button
                  onClick={() => removeUser(u.id, u.role)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTeamTab;
