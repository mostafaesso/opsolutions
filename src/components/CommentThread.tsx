import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Pin, CornerDownRight, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  module_id: string;
  module_type: string;
  company_id: string;
  author_name: string;
  author_email: string;
  content: string;
  parent_id: string | null;
  is_pinned: boolean;
  created_at: string;
  replies?: Comment[];
}

interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
}

interface CommentThreadProps {
  moduleId: string;
  moduleType: "doc" | "video" | "gtm";
  companyId: string;
  currentUser: CurrentUser;
  canComment: boolean;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const CommentThread = ({ moduleId, moduleType, companyId, currentUser, canComment }: CommentThreadProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("module_comments")
      .select("*")
      .eq("module_id", moduleId)
      .eq("module_type", moduleType)
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (error) { setLoading(false); return; }

    const all: Comment[] = data || [];
    const top = all.filter(c => !c.parent_id);
    const nested = top.map(c => ({
      ...c,
      replies: all.filter(r => r.parent_id === c.id),
    }));
    // Pinned first
    nested.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    setComments(nested);
    setLoading(false);
  }, [moduleId, moduleType, companyId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const notifyRouting = async () => {
    try {
      const { data } = await (supabase as any)
        .from("comment_routing")
        .select("route_to, additional_emails")
        .eq("company_id", companyId)
        .maybeSingle();
      if (!data) return;
      const LABELS: Record<string, string> = {
        super_admin: "Super Admin",
        company_owner: "Company Owner",
        admins: "Admins",
        managers: "Managers",
        all: "All Users",
      };
      const targets = [
        ...(data.route_to || []).map((r: string) => LABELS[r] ?? r),
        ...(data.additional_emails || []),
      ];
      if (targets.length > 0) {
        toast({ title: "Comment notification sent", description: `Notified: ${targets.join(", ")}` });
      }
    } catch {
      // silent — routing is non-critical
    }
  };

  const submitComment = async () => {
    if (!newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("module_comments").insert({
        module_id: moduleId,
        module_type: moduleType,
        company_id: companyId,
        author_name: currentUser.full_name,
        author_email: currentUser.email,
        content: newText.trim(),
        parent_id: null,
        is_pinned: false,
      });
      if (error) throw error;
      setNewText("");
      await fetchComments();
      notifyRouting();
    } catch (e: any) {
      toast({ title: "Error posting comment", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyText.trim() || replySubmitting) return;
    setReplySubmitting(true);
    try {
      const { error } = await (supabase as any).from("module_comments").insert({
        module_id: moduleId,
        module_type: moduleType,
        company_id: companyId,
        author_name: currentUser.full_name,
        author_email: currentUser.email,
        content: replyText.trim(),
        parent_id: parentId,
        is_pinned: false,
      });
      if (error) throw error;
      setReplyText("");
      setReplyingTo(null);
      await fetchComments();
    } catch (e: any) {
      toast({ title: "Error posting reply", description: e.message, variant: "destructive" });
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Discussion {comments.length > 0 && <span className="text-muted-foreground font-normal">({comments.length})</span>}
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground py-2">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className={`rounded-xl border p-4 space-y-3 ${comment.is_pinned ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">{comment.author_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                {comment.is_pinned && (
                  <div className="flex items-center gap-1 text-xs text-primary font-medium">
                    <Pin className="w-3 h-3" /> Pinned
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>

              {/* Replies */}
              {(comment.replies?.length ?? 0) > 0 && (
                <div className="pl-4 border-l-2 border-border space-y-3 mt-2">
                  {comment.replies!.map((reply) => (
                    <div key={reply.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-muted-foreground">
                            {reply.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">{reply.author_name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-sm text-foreground pl-8 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {canComment && (
                replyingTo === comment.id ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      autoFocus
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitReply(comment.id)}
                      placeholder="Write a reply…"
                      className="flex-1 text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => submitReply(comment.id)}
                      disabled={replySubmitting || !replyText.trim()}
                      className="text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setReplyingTo(comment.id); setReplyText(""); }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Reply
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* New comment input */}
      {canComment && (
        <div className="flex gap-2 pt-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
            <span className="text-xs font-bold text-primary">
              {currentUser.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <button
              onClick={submitComment}
              disabled={submitting || !newText.trim()}
              className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      )}

      {!canComment && (
        <p className="text-xs text-muted-foreground italic">Comments are view-only for your role.</p>
      )}
    </div>
  );
};

export default CommentThread;
