import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const ACADEMY_ADMIN_EMAIL = "mostafamoh4mmed@gmail.com";

export type UserRole = "academy_admin" | "company_admin" | "employee" | null;

export interface AuthState {
  user: User | null;
  role: UserRole;
  companySlug: string | null;
  loading: boolean;
}

export async function resolveUserRole(
  user: User
): Promise<{ role: UserRole; companySlug: string | null }> {
  const email = user.email?.toLowerCase() || "";

  if (email === ACADEMY_ADMIN_EMAIL.toLowerCase()) {
    return { role: "academy_admin", companySlug: null };
  }

  const { data: companyAdmin } = await supabase
    .from("company_admins" as any)
    .select("company_slug")
    .eq("email", email)
    .maybeSingle();

  if (companyAdmin) {
    return { role: "company_admin", companySlug: (companyAdmin as any).company_slug };
  }

  const { data: trainingUser } = await supabase
    .from("training_users")
    .select("company_slug")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (trainingUser) {
    return { role: "employee", companySlug: trainingUser.company_slug };
  }

  return { role: null, companySlug: null };
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    companySlug: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session?.user) {
        setState({ user: null, role: null, companySlug: null, loading: false });
        return;
      }
      const { role, companySlug } = await resolveUserRole(session.user);
      if (mounted) setState({ user: session.user, role, companySlug, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setState({ user: null, role: null, companySlug: null, loading: false });
        return;
      }
      const { role, companySlug } = await resolveUserRole(session.user);
      if (mounted) setState({ user: session.user, role, companySlug, loading: false });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}