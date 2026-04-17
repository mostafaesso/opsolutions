import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const SUPER_ADMIN_EMAIL = "mostafamoh4mmed@gmail.com";

export const useSuperAdmin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    // THEN check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isSuperAdmin =
    !!session?.user?.email &&
    session.user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  return { session, loading, isSuperAdmin };
};
