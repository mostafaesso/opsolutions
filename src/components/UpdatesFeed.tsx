import { useState } from "react";
import { useUpdates, useUpdateComments } from "@/hooks/useUpdates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UpdatesFeedProps {
  companySlug: string;
  userEmail: string;
  userName: string;
  canCreate?: boolean;
}

export const UpdatesFeed = ({ companySlug, userEmail, userName, canCreate = false }: UpdatesFeedProps) => {
  const { updates, loading, createUpdate, deleteUpdate } = useUpdates(companySlug);
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"all" | "managers" | "admins">("all");
  const [submitting, setSubmitting] = useState(false);
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);

  const handleCreateUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createUpdate(title, content, visibility, userEmail);
      setTitle("");
      setContent("");
      setVisibility("all");
      toast({ title: "Success", description: "Update posted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;
    try {
      await deleteUpdate(id);
      toast({ title: "Success", description: "Update deleted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Post an Update</CardTitle>
            <CardDescription>Share updates with your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Update title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Update content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex items-center gap-2">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All (Employees, Managers, Admins)</option>
                <option value="managers">Managers & Admins Only</option>
                <option value="admins">Admins Only</option>
              </select>
              <Button
                onClick={handleCreateUpdate}
                disabled={submitting}
                className="ml-auto"
              >
                {submitting ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Updates</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading updates...</p>
        ) : updates.length === 0 ? (
          <p className="text-muted-foreground">No updates yet</p>
        ) : (
          updates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{update.title}</CardTitle>
                    <CardDescription>
                      Posted by {update.created_by} on {new Date(update.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {canCreate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(update.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{update.content}</p>
                <UpdateCommentSection updateId={update.id} userEmail={userEmail} userName={userName} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const UpdateCommentSection = ({ updateId, userEmail, userName }: any) => {
  const { comments, addComment } = useUpdateComments(updateId);
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(userEmail, userName, commentText);
      setCommentText("");
      toast({ title: "Success", description: "Comment added!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="w-4 h-4" />
        <span>{comments.length} comments</span>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/50 p-3 rounded text-sm">
            <p className="font-medium text-xs mb-1">{comment.author_name}</p>
            <p className="text-foreground">{comment.content}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(comment.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={submitting}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
