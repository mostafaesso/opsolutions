import { useState, useEffect, useCallback } from "react";
import { useHubSpotCredentials } from "@/hooks/useHubSpotCredentials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, RefreshCw, AlertCircle, Calendar, Users } from "lucide-react";

interface OwnerCount {
  name: string;
  count: number;
}

interface CallsData {
  total: number;
  byOwner: OwnerCount[];
}

interface Props {
  companySlug: string;
  permission: "view_only" | "edit";
}

const HUBSPOT = "https://api.hubapi.com";

const TotalCallsReport = ({ companySlug, permission }: Props) => {
  const { credential, loading: credLoading } = useHubSpotCredentials(companySlug);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [team, setTeam] = useState("");
  const [data, setData] = useState<CallsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = permission === "edit";

  const fetchData = useCallback(async () => {
    if (!credential?.private_app_token) return;
    setLoading(true);
    setError(null);
    try {
      const token = credential.private_app_token;
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. Get all owners (id → name map)
      const ownersRes = await fetch(`${HUBSPOT}/crm/v3/owners?limit=500`, { headers });
      if (!ownersRes.ok) throw new Error(`HubSpot owners API ${ownersRes.status}: ${await ownersRes.text()}`);
      const ownersJson = await ownersRes.json();
      const ownerMap: Record<string, string> = {};
      const ownerUserMap: Record<string, string> = {}; // userId → ownerId
      for (const o of ownersJson.results ?? []) {
        const name = [o.firstName, o.lastName].filter(Boolean).join(" ") || o.email || String(o.id);
        ownerMap[String(o.id)] = name;
        if (o.userId) ownerUserMap[String(o.userId)] = String(o.id);
      }

      // 2. Resolve team → owner IDs if team filter is set
      let teamOwnerIds: string[] | null = null;
      if (team.trim()) {
        const teamsRes = await fetch(`${HUBSPOT}/settings/v3/users/teams?includePublicTeams=true`, { headers });
        if (teamsRes.ok) {
          const teamsJson = await teamsRes.json();
          const matched = (teamsJson.results ?? []).find((t: any) =>
            t.name.toLowerCase().includes(team.trim().toLowerCase())
          );
          if (matched?.userIds?.length) {
            teamOwnerIds = matched.userIds
              .map((uid: string) => ownerUserMap[String(uid)])
              .filter(Boolean) as string[];
          }
        }
      }

      // 3. Build search filters
      const filters: any[] = [];
      if (dateFrom) {
        filters.push({
          propertyName: "hs_timestamp",
          operator: "GTE",
          value: String(new Date(dateFrom).getTime()),
        });
      }
      if (dateTo) {
        filters.push({
          propertyName: "hs_timestamp",
          operator: "LTE",
          value: String(new Date(dateTo + "T23:59:59").getTime()),
        });
      }
      if (teamOwnerIds && teamOwnerIds.length > 0) {
        filters.push({
          propertyName: "hubspot_owner_id",
          operator: "IN",
          values: teamOwnerIds,
        });
      }

      // 4. Paginate through calls
      let allCalls: any[] = [];
      let after: string | undefined;
      do {
        const body: any = {
          filterGroups: filters.length > 0 ? [{ filters }] : [],
          properties: ["hubspot_owner_id", "hs_timestamp", "hs_call_status"],
          limit: 200,
          sorts: [{ propertyName: "hs_timestamp", direction: "DESCENDING" }],
        };
        if (after) body.after = after;

        const res = await fetch(`${HUBSPOT}/crm/v3/objects/calls/search`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HubSpot calls API ${res.status}: ${await res.text()}`);
        const json = await res.json();
        allCalls = allCalls.concat(json.results ?? []);
        after = json.paging?.next?.after;
      } while (after && allCalls.length < 5000);

      // 5. Aggregate by owner
      const counts: Record<string, number> = {};
      for (const call of allCalls) {
        const oid = String(call.properties?.hubspot_owner_id || "");
        const name = oid ? (ownerMap[oid] ?? `Owner ${oid}`) : "Unassigned";
        counts[name] = (counts[name] ?? 0) + 1;
      }

      const byOwner = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setData({ total: allCalls.length, byOwner });
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch data from HubSpot.");
    } finally {
      setLoading(false);
    }
  }, [credential, dateFrom, dateTo, team]);

  // Auto-load when token available
  useEffect(() => {
    if (credential) fetchData();
  }, [credential?.id]);

  if (credLoading) {
    return <p className="text-sm text-muted-foreground py-4">Checking token…</p>;
  }

  if (!credential) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg border border-dashed border-border">
        <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          No HubSpot token connected for this company. Add it in the HubSpot Token section above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-end gap-3 flex-wrap p-4 bg-muted/30 rounded-lg border border-border">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground self-center mr-1">
          Filters
        </span>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-3 h-3" /> From
          </Label>
          <Input
            type="date"
            className="h-7 text-xs w-36"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-3 h-3" /> To
          </Label>
          <Input
            type="date"
            className="h-7 text-xs w-36"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" /> Team
          </Label>
          <Input
            className="h-7 text-xs w-32"
            placeholder="e.g. GCC"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <Button
          size="sm"
          className="h-7 gap-1.5"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Run"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {data && (
        <>
          {/* Total count */}
          <Card>
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Total Calls
                  </p>
                  <p className="text-5xl font-bold text-foreground leading-tight">
                    {data.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* By owner */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">By Activity Owner</CardTitle>
            </CardHeader>
            <CardContent>
              {data.byOwner.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No calls found for the selected filters.
                </p>
              ) : (
                <div className="space-y-1">
                  {data.byOwner.map((o) => (
                    <div
                      key={o.name}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm font-medium">{o.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${(o.count / data.byOwner[0].count) * 100}%` }}
                          />
                        </div>
                        <Badge
                          variant="secondary"
                          className="min-w-[2.5rem] justify-center text-xs font-bold tabular-nums"
                        >
                          {o.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && !error && (
        <div className="p-10 text-center border border-dashed rounded-lg">
          <Phone className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">
            Click <strong>Run</strong> to load call data from HubSpot.
          </p>
        </div>
      )}
    </div>
  );
};

export default TotalCallsReport;
