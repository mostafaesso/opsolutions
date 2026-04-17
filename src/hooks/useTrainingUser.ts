import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingUser {
  id: string;
  email: string;
  full_name: string;
  company_slug: string;
}

const STORAGE_KEY = "training-user";

export const useTrainingUser = (companySlug: string) => {
  const [user, setUser] = useState<TrainingUser | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-${companySlug}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const register = async (email: string, fullName: string) => {
    setLoading(true);
    try {
      // Try to find existing user
      const { data: existing } = await supabase
        .from("training_users")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("company_slug", companySlug)
        .maybeSingle();

      if (existing) {
        const u: TrainingUser = {
          id: existing.id,
          email: existing.email,
          full_name: existing.full_name,
          company_slug: existing.company_slug,
        };
        localStorage.setItem(`${STORAGE_KEY}-${companySlug}`, JSON.stringify(u));
        setUser(u);
        return u;
      }

      // Create new user
      const { data, error } = await supabase
        .from("training_users")
        .insert({ email: email.toLowerCase(), full_name: fullName, company_slug: companySlug })
        .select()
        .single();

      if (error) throw error;

      const u: TrainingUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        company_slug: data.company_slug,
      };
      localStorage.setItem(`${STORAGE_KEY}-${companySlug}`, JSON.stringify(u));
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, register };
};

export const useCompletions = (userId: string | undefined) => {
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from("training_completions")
      .select("card_id, quiz_score")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) {
          setCompletions(new Set(data.map((d) => d.card_id)));
          const scoreMap: Record<string, number> = {};
          data.forEach((d) => {
            if (d.quiz_score !== null) scoreMap[d.card_id] = d.quiz_score;
          });
          setScores(scoreMap);
        }
        setLoading(false);
      });
  }, [userId]);

  const markComplete = async (cardId: string, score: number) => {
    if (!userId) return;

    if (completions.has(cardId)) {
      await supabase
        .from("training_completions")
        .update({ quiz_score: score })
        .eq("user_id", userId)
        .eq("card_id", cardId);
    } else {
      await supabase
        .from("training_completions")
        .insert({ user_id: userId, card_id: cardId, quiz_score: score });
      setCompletions((prev) => new Set(prev).add(cardId));
    }
    setScores((prev) => ({ ...prev, [cardId]: score }));
  };

  return { completions, scores, loading, markComplete };
};

export const useTeamProgress = (companySlug: string) => {
  const [members, setMembers] = useState<
    { id: string; email: string; full_name: string; created_at: string; completedCards: string[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: users } = await supabase
        .from("training_users")
        .select("*")
        .eq("company_slug", companySlug)
        .order("created_at", { ascending: false });

      if (!users || users.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data: completions } = await supabase
        .from("training_completions")
        .select("user_id, card_id")
        .in("user_id", users.map((u) => u.id));

      const completionMap: Record<string, string[]> = {};
      (completions || []).forEach((c) => {
        if (!completionMap[c.user_id]) completionMap[c.user_id] = [];
        completionMap[c.user_id].push(c.card_id);
      });

      setMembers(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          created_at: u.created_at,
          completedCards: completionMap[u.id] || [],
        }))
      );
      setLoading(false);
    };

    fetch();
  }, [companySlug]);

  return { members, loading };
};
