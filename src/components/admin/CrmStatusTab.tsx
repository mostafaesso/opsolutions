import { useState } from "react";
import { useHubSpotCredentials } from "@/hooks/useHubSpotCredentials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Copy, ExternalLink, Eye, EyeOff, Lock, RefreshCw, Save, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DIAGNOSE_URL = "https://www-opsolutionss-diagnose.lovable.app";

interface Props {
  companySlug: string | undefined;
  companyName?: string;
}

const CrmStatusTab = ({ companySlug, companyName }: Props) => {
  const { credential, loading, saveCredential, deleteCredential } = useHubSpotCredentials(companySlug);
  const [tokenInput, setTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!companySlug) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground text-sm">
        Select a company first.
      </div>
    );
  }

  const handleSave = async () => {
    const value = tokenInput.trim();
    if (!value) {
      toast({ title: "Enter a token first", variant: "destructive" });
      return;
    }
    try {
      await saveCredential(value);
      setTokenInput("");
      toast({ title: "Token saved", description: `Saved for ${companyName ?? companySlug}` });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    }
  };

  const handleCopy = async () => {
    if (!credential?.private_app_token) return;
    try {
      await navigator.clipboard.writeText(credential.private_app_token);
      toast({
        title: "Token copied",
        description: "Paste it into the Diagnose form below to run the audit.",
      });
    } catch {
      toast({ title: "Copy failed", description: "Use the eye icon to reveal and copy manually.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove the saved HubSpot token for this company?")) return;
    try {
      await deleteCredential();
      toast({ title: "Token removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
    }
  };

  const masked = credential?.private_app_token
    ? credential.private_app_token.slice(0, 8) + "••••••••••••" + credential.private_app_token.slice(-4)
    : "";

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Current CRM Status</h3>
              <p className="text-xs text-muted-foreground">
                Live HubSpot diagnostic for <strong className="text-foreground">{companyName ?? companySlug}</strong>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIframeKey((k) => k + 1)}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload diagnostic
          </Button>
        </div>
      </div>

      {/* ── Token vault ────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground">HubSpot Private App Token</h4>
          {credential && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Saved
            </span>
          )}
        </div>

        {credential ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-foreground break-all">
                {showToken ? credential.private_app_token : masked}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0"
                onClick={() => setShowToken((s) => !s)}
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 gap-1.5 shrink-0"
                onClick={handleCopy}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              💡 Click <strong>Copy</strong> then paste into the Diagnose form below to run the audit.
              The token stays saved here for next time.
            </p>

            {/* Replace */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                Replace with a new token
              </summary>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
                <Button onClick={handleSave} disabled={loading} size="sm" className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  Update
                </Button>
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Save the HubSpot Private App Token once — it auto-fills next time you open this tab.
            </p>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Private App Token
              </Label>
              <div className="flex gap-2">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0"
                  onClick={() => setShowToken((s) => !s)}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button onClick={handleSave} disabled={loading} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
              </div>
              <a
                href="https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                How to get your HubSpot Private App token
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Diagnose embed ────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h4 className="text-sm font-bold text-foreground">CRM Diagnostic</h4>
            <p className="text-[11px] text-muted-foreground">
              Powered by Ops Solutions Diagnose · runs entirely in your browser
            </p>
          </div>
          <a
            href={DIAGNOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            Open in new tab
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <iframe
          key={iframeKey}
          src={DIAGNOSE_URL}
          title="CRM Diagnose"
          className="w-full bg-background"
          style={{ height: "calc(100vh - 220px)", minHeight: 720 }}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default CrmStatusTab;
