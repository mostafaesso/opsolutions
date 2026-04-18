import { useState } from "react";
import { useEnhancements } from "@/hooks/useEnhancements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EnhancementsModuleProps {
  companySlug: string;
  userEmail: string;
  canCreate?: boolean;
}

export const EnhancementsModule = ({ companySlug, userEmail, canCreate = false }: EnhancementsModuleProps) => {
  const { enhancements, loading, createEnhancement, deleteEnhancement } = useEnhancements(companySlug);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !beforeUrl.trim() || !afterUrl.trim()) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createEnhancement(
        title,
        beforeUrl,
        afterUrl,
        userEmail,
        description,
        category,
        "all"
      );
      setTitle("");
      setDescription("");
      setBeforeUrl("");
      setAfterUrl("");
      setCategory("");
      setIsOpen(false);
      toast({ title: "Success", description: "Enhancement added!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enhancement?")) return;
    try {
      await deleteEnhancement(id);
      toast({ title: "Success", description: "Enhancement deleted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {canCreate && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Add Before/After Enhancement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Enhancement</DialogTitle>
              <DialogDescription>
                Upload before and after screenshots of enhancements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enhancement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                placeholder="Category (e.g., HubSpot Setup, Dashboard)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input
                placeholder="Before image URL"
                value={beforeUrl}
                onChange={(e) => setBeforeUrl(e.target.value)}
              />
              <Input
                placeholder="After image URL"
                value={afterUrl}
                onChange={(e) => setAfterUrl(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting ? "Adding..." : "Add Enhancement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Before & After Enhancements</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : enhancements.length === 0 ? (
          <p className="text-muted-foreground">No enhancements yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enhancements.map((enhancement) => (
              <Card key={enhancement.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{enhancement.title}</CardTitle>
                      {enhancement.category && (
                        <CardDescription>{enhancement.category}</CardDescription>
                      )}
                    </div>
                    {canCreate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enhancement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enhancement.description && (
                    <p className="text-sm text-muted-foreground">{enhancement.description}</p>
                  )}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium mb-1 text-muted-foreground">Before</p>
                      <img
                        src={enhancement.before_url}
                        alt="Before"
                        className="w-full rounded border border-border max-h-[200px] object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1 text-muted-foreground">After</p>
                      <img
                        src={enhancement.after_url}
                        alt="After"
                        className="w-full rounded border border-border max-h-[200px] object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
