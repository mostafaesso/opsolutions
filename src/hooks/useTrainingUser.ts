import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingUser {
  id: string;
  email: string;
  full_name: string;
  company_slug: string;
}

export interface QuizScore {
  score: number;
  total: number;
  passed: boolean;
  percent: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from("training_completions")
      .select("card_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setCompletions(new Set(data.map((d) => d.card_id)));
        setLoading(false);
      });
  }, [userId]);

  const toggleCompletion = async (cardId: string) => {
    if (!userId) return;

    if (completions.has(cardId)) {
      await supabase
        .from("training_completions")
        .delete()
        .eq("user_id", userId)
        .eq("card_id", cardId);
      setCompletions((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    } else {
      await supabase
        .from("training_completions")
        .insert({ user_id: userId, card_id: cardId });
      setCompletions((prev) => new Set(prev).add(cardId));
    }
  };

  return { completions, loading, toggleCompletion };
};

export const saveQuizScore = async (
  userId: string,
  cardId: string,
  score: number,
  total: number,
  passed: boolean
) => {
  await supabase
    .from("quiz_scores")
    .upsert(
      { user_id: userId, card_id: cardId, score, total, passed, attempted_at: new Date().toISOString() },
      { onConflict: "user_id,card_id" }
    );
};

export const useQuizScores = (userId: string | undefined) => {
  const [scores, setScores] = useState<Record<string, QuizScore>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from("quiz_scores")
      .select("card_id, score, total, passed")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, QuizScore> = {};
          data.forEach((d) => {
            map[d.card_id] = {
              score: d.score,
              total: d.total,
              passed: d.passed,
              percent: Math.round((d.score / d.total) * 100),
            };
          });
          setScores(map);
        }
        setLoading(false);
      });
  }, [userId]);

  return { scores, loading };
};

export const useTeamProgress = (companySlug: string) => {
  const [members, setMembers] = useState<
    {
      id: string;
      email: string;
      full_name: string;
      created_at: string;
      completedCards: string[];
      avgScore: number | null;
      scoreMap: Record<string, number>;
    }[]
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

      const userIds = users.map((u) => u.id);

      const [{ data: completions }, { data: quizScores }] = await Promise.all([
        supabase
          .from("training_completions")
          .select("user_id, card_id")
          .in("user_id", userIds),
        supabase
          .from("quiz_scores")
          .select("user_id, card_id, score, total")
          .in("user_id", userIds),
      ]);

      const completionMap: Record<string, string[]> = {};
      (completions || []).forEach((c) => {
        if (!completionMap[c.user_id]) completionMap[c.user_id] = [];
        completionMap[c.user_id].push(c.card_id);
      });

      const scoreMap: Record<string, Record<string, number>> = {};
      (quizScores || []).forEach((s) => {
        if (!scoreMap[s.user_id]) scoreMap[s.user_id] = {};
        scoreMap[s.user_id][s.card_id] = Math.round((s.score / s.total) * 100);
      });

      setMembers(
        users.map((u) => {
          const userScoreValues = Object.values(scoreMap[u.id] || {});
          const avgScore =
            userScoreValues.length > 0
              ? Math.round(userScoreValues.reduce((a, b) => a + b, 0) / userScoreValues.length)
              : null;
          return {
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            created_at: u.created_at,
            completedCards: completionMap[u.id] || [],
            avgScore,
            scoreMap: scoreMap[u.id] || {},
          };
        })
      );
      setLoading(false);
    };

    fetch();
  }, [companySlug]);

  return { members, loading };
};
