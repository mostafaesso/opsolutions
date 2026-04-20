import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Update {
  id: string;
  company_slug: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  visibility: "all" | "managers" | "admins";
}

export interface UpdateComment {
  id: string;
  update_id: string;
  author_email: string;
  author_name: string;
  content: string;
  created_at: string;
}

export const useUpdates = (companySlug: string | undefined) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug) return;
    fetchUpdates();
  }, [companySlug]);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("updates")
        .select("*")
        .eq("company_slug", companySlug)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setUpdates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async (title: string, content: string, visibility: "all" | "managers" | "admins", createdBy: string) => {
    try {
      const { data, error: err } = await supabase
        .from("updates")
        .insert({
          company_slug: companySlug,
          title,
          content,
          visibility,
          created_by: createdBy,
        })
        .select()
        .single();

      if (err) throw err;
      setUpdates([data, ...updates]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUpdate = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("updates")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setUpdates(updates.filter(u => u.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { updates, loading, error, createUpdate, deleteUpdate, fetchUpdates };
};

export const useUpdateComments = (updateId: string | undefined) => {
  const [comments, setComments] = useState<UpdateComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!updateId) return;
    fetchComments();
  }, [updateId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("update_comments")
        .select("*")
        .eq("update_id", updateId)
        .order("created_at", { ascending: true });

      if (err) throw err;
      setComments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (authorEmail: string, authorName: string, content: string) => {
    try {
      const { data, error: err } = await supabase
        .from("update_comments")
        .insert({
          update_id: updateId,
          author_email: authorEmail,
          author_name: authorName,
          content,
        })
        .select()
        .single();

      if (err) throw err;
      setComments([...comments, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { comments, loading, error, addComment, fetchComments };
};
