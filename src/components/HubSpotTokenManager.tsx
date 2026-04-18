import { useState } from "react";
import { useHubSpotCredentials } from "@/hooks/useHubSpotCredentials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface HubSpotTokenManagerProps {
  companySlug: string;
  canManage?: boolean;
}

export const HubSpotTokenManager = ({ companySlug, canManage = false }: HubSpotTokenManagerProps) => {
  const { credential, loading, saveCredential, deleteCredential } = useHubSpotCredentials(companySlug);
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!token.trim()) {
      toast({ title: "Error", description: "Token cannot be empty", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await saveCredential(token);
      setToken("");
      setIsEditing(false);
      toast({ title: "Success", description: "HubSpot token saved securely!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this HubSpot token?")) return;
    try {
      await deleteCredential();
      toast({ title: "Success", description: "Token deleted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HubSpot Private App Token</CardTitle>
        <CardDescription>
          Securely store your HubSpot private app token for integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!credential ? (
          <div className="space-y-4">
            {!isEditing ? (
              <p className="text-muted-foreground text-sm">No token configured yet</p>
            ) : (
              <>
                <Input
                  placeholder="Paste your HubSpot private app token"
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={submitting}>
                    {submitting ? "Saving..." : "Save Token"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setToken("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </>
            )}
            {canManage && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Add Token
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Token saved</p>
                <p className="text-sm font-medium">••••••••••••••••{credential.private_app_token.slice(-4)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(credential.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Update Token
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {isEditing && (
              <div className="space-y-4 p-3 border border-border rounded bg-muted/50">
                <Input
                  placeholder="Paste your new HubSpot private app token"
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={submitting}>
                    {submitting ? "Saving..." : "Update Token"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setToken("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
