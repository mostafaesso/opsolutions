import { useEffect, useState } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Cast to any: company_admins/team_members tables not yet in generated types
const supabase = supabaseClient as any;

export type UserRole = "super_admin" | "company_admin" | "manager" | "employee" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session?.user?.email) {
        setRole(null);
        setLoading(false);
        return;
      }

      const userEmail = session.user.email.toLowerCase();
      const SUPER_ADMIN_EMAIL = "mostafamoh4mmed@gmail.com";

      // Check if super admin
      if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setRole("super_admin");
        setLoading(false);
        return;
      }

      // Check if company admin
      const { data: admin } = await supabase
        .from("company_admins")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle();

      if (admin) {
        setRole("company_admin");
        setLoading(false);
        return;
      }

      // Check if team member (manager or employee)
      const { data: member } = await supabase
        .from("team_members")
        .select("role")
        .eq("email", userEmail)
        .maybeSingle();

      if (member) {
        setRole(member.role as UserRole);
        setLoading(false);
        return;
      }

      // Default to null if no role found
      setRole(null);
      setLoading(false);
    };

    checkRole();

    const { data: subscription } = supabase.auth.onAuthStateChange(async () => {
      checkRole();
    });

    return () => subscription?.subscription.unsubscribe();
  }, []);

  return { role, loading, session };
};

/**
 * Hook to check if user can access a specific company
 */
export const useCanAccessCompany = (companySlug: string | undefined) => {
  const { role, session, loading: roleLoading } = useUserRole();
  const [canAccess, setCanAccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!companySlug || roleLoading) return;

      // Super admin can access any company
      if (role === "super_admin") {
        setCanAccess(true);
        setUserRole("super_admin");
        setLoading(false);
        return;
      }

      if (!session?.user?.email) {
        setCanAccess(false);
        setLoading(false);
        return;
      }

      const userEmail = session.user.email.toLowerCase();

      // Check if company admin
      const { data: admin } = await supabase
        .from("company_admins")
        .select("*")
        .eq("company_slug", companySlug)
        .eq("email", userEmail)
        .maybeSingle();

      if (admin) {
        setCanAccess(true);
        setUserRole("company_admin");
        setLoading(false);
        return;
      }

      // Check if team member
      const { data: member } = await supabase
        .from("team_members")
        .select("role")
        .eq("company_slug", companySlug)
        .eq("email", userEmail)
        .maybeSingle();

      if (member) {
        setCanAccess(true);
        setUserRole(member.role);
        setLoading(false);
        return;
      }

      setCanAccess(false);
      setLoading(false);
    };

    check();
  }, [companySlug, role, session, roleLoading]);

  return { canAccess, userRole, loading };
};
