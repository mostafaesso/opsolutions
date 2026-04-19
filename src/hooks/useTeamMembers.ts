import { useState, useEffect } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Cast to any: team_members table not yet in generated types
const supabase = supabaseClient as any;

export interface TeamMember {
  id: string;
  company_slug: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "employee";
  invited_by: string | null;
  invited_at: string;
  status: "invited" | "accepted";
}

export const useTeamMembers = (companySlug: string | undefined) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) return;
    fetchTeamMembers();
  }, [companySlug]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("team_members")
        .select("*")
        .eq("company_slug", companySlug)
        .order("invited_at", { ascending: false });

      if (err) throw err;
      setMembers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (
    email: string,
    fullName: string,
    role: "manager" | "employee",
    invitedBy: string
  ) => {
    try {
      const { data, error: err } = await supabase
        .from("team_members")
        .insert({
          company_slug: companySlug,
          email,
          full_name: fullName,
          role,
          invited_by: invitedBy,
          status: "invited",
        })
        .select()
        .single();

      if (err) throw err;
      setMembers([data, ...members]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const acceptInvite = async (memberId: string) => {
    try {
      const { data, error: err } = await supabase
        .from("team_members")
        .update({ status: "accepted" })
        .eq("id", memberId)
        .select()
        .single();

      if (err) throw err;
      setMembers(members.map(m => m.id === memberId ? data : m));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRole = async (memberId: string, role: "admin" | "manager" | "employee") => {
    try {
      const { data, error: err } = await supabase
        .from("team_members")
        .update({ role })
        .eq("id", memberId)
        .select()
        .single();

      if (err) throw err;
      setMembers(members.map(m => m.id === memberId ? data : m));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error: err } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (err) throw err;
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    fetchTeamMembers,
    inviteMember,
    acceptInvite,
    updateRole,
    removeMember,
  };
};
