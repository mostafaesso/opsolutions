import { useState } from "react";
import {
  LayoutDashboard,
  FileBarChart2,
  Calendar,
  Users,
  MapPin,
  Filter,
  ExternalLink,
  Info,
  Plus,
} from "lucide-react";
import { useDashboardItems, DashboardItem, ReportItem } from "@/hooks/useDashboardItems";
import { LogicEditorDialog, LogicFormData } from "./LogicEditorDialog";
import TotalCallsReport from "./reports/TotalCallsReport";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FilterState {
  dateFrom: string;
  dateTo: string;
  team: string;
  region: string;
}

const EMPTY_FILTER: FilterState = { dateFrom: "", dateTo: "", team: "", region: "" };

interface DashboardCompanyViewProps {
  companySlug: string;
  permission: "view_only" | "edit";
  canAdmin?: boolean;
}

const buildIframeUrl = (
  baseUrl: string,
  filters: FilterState,
  item: DashboardItem | ReportItem
): string => {
  try {
    const url = new URL(baseUrl);
    if (item.filter_date && filters.dateFrom) url.searchParams.set("dateFrom", filters.dateFrom);
    if (item.filter_date && filters.dateTo) url.searchParams.set("dateTo", filters.dateTo);
    if (item.filter_team && filters.team) url.searchParams.set("team", filters.team);
    if (item.filter_region && filters.region) url.searchParams.set("region", filters.region);
    return url.toString();
  } catch {
    return baseUrl;
  }
};

interface ItemViewerProps {
  item: DashboardItem | ReportItem;
  permission: "view_only" | "edit";
  filters: FilterState;
  onFilterChange: (patch: Partial<FilterState>) => void;
  type: "dashboard" | "report";
  canAdmin?: boolean;
  companySlug: string;
  onUpdate: (id: string, data: LogicFormData) => Promise<void>;
}

const ItemViewer = ({
  item,
  permission,
  filters,
  onFilterChange,
  type,
  canAdmin,
  companySlug,
  onUpdate,
}: ItemViewerProps) => {
  const hasFilters = item.filter_date || item.filter_team || item.filter_region;
  const iframeUrl = item.iframe_url ? buildIframeUrl(item.iframe_url, filters, item) : null;
  const canEdit = permission === "edit";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{item.name}</CardTitle>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.iframe_url && (
              <a href={item.iframe_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <ExternalLink className="w-3 h-3" /> Open
                </Button>
              </a>
            )}
            {canAdmin && (
              <LogicEditorDialog
                type={type}
                companySlug={companySlug}
                initialData={item}
                onSave={(data) => onUpdate(item.id, data)}
                trigger={
                  <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                    {type === "dashboard" ? "Dashboard Logic" : "Report Logic"}
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Filter bar */}
      {hasFilters && (
        <div className="px-6 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Filters
            </span>
            {!canEdit && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                View Only
              </Badge>
            )}
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            {item.filter_date && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" /> From
                  </Label>
                  <Input
                    type="date"
                    className="h-7 text-xs w-36"
                    value={filters.dateFrom}
                    onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
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
                    value={filters.dateTo}
                    onChange={(e) => onFilterChange({ dateTo: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
              </>
            )}
            {item.filter_team && (
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" /> Team
                </Label>
                <Input
                  className="h-7 text-xs w-36"
                  placeholder="All teams"
                  value={filters.team}
                  onChange={(e) => onFilterChange({ team: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            )}
            {item.filter_region && (
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" /> Region
                </Label>
                <Input
                  className="h-7 text-xs w-36"
                  placeholder="All regions"
                  value={filters.region}
                  onChange={(e) => onFilterChange({ region: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <CardContent className="p-0">
        {item.data_definition?.type === "hubspot_calls" ? (
          <div className="p-4">
            <TotalCallsReport companySlug={companySlug} permission={permission} />
          </div>
        ) : iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="w-full border-0"
            style={{ minHeight: 500 }}
            title={item.name}
            allow="fullscreen"
            loading="lazy"
          />
        ) : item.logic_prompt ? (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-dashed border-border">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2 min-w-0">
                <p className="text-xs font-semibold text-foreground">Logic Definition</p>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {item.logic_prompt}
                </p>
                {hasFilters && (
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    {item.filter_date && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Calendar className="w-2.5 h-2.5" /> Date
                      </Badge>
                    )}
                    {item.filter_team && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Users className="w-2.5 h-2.5" /> Team
                      </Badge>
                    )}
                    {item.filter_region && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <MapPin className="w-2.5 h-2.5" /> Region
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            {canAdmin && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No embed URL set. Add one via the logic editor to display data here.
              </p>
            )}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No logic defined for this item yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardCompanyView = ({
  companySlug,
  permission,
  canAdmin,
}: DashboardCompanyViewProps) => {
  const { toast } = useToast();
  const {
    dashboards,
    reports,
    loading,
    refresh,
    addDashboard,
    updateDashboard,
    addReport,
    updateReport,
  } = useDashboardItems(companySlug);

  const [dbFilters, setDbFilters] = useState<Record<string, FilterState>>({});
  const [rpFilters, setRpFilters] = useState<Record<string, FilterState>>({});

  const getF = (id: string, map: Record<string, FilterState>) => map[id] ?? EMPTY_FILTER;
  const setF = (
    id: string,
    patch: Partial<FilterState>,
    setter: React.Dispatch<React.SetStateAction<Record<string, FilterState>>>
  ) => setter((prev) => ({ ...prev, [id]: { ...getF(id, prev), ...patch } }));

  const handleAddDashboard = async (data: LogicFormData) => {
    try {
      await addDashboard({ ...data, company_slug: companySlug, sort_order: dashboards.length, data_definition: null });
      toast({ title: "Dashboard added" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateDashboard = async (id: string, data: LogicFormData) => {
    try {
      await updateDashboard(id, data);
      toast({ title: "Dashboard updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAddReport = async (data: LogicFormData) => {
    try {
      await addReport({ ...data, company_slug: companySlug, sort_order: reports.length, data_definition: null });
      toast({ title: "Report added" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateReport = async (id: string, data: LogicFormData) => {
    try {
      await updateReport(id, data);
      toast({ title: "Report updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList>
        <TabsTrigger value="dashboard" className="gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-2">
          <FileBarChart2 className="w-4 h-4" />
          Reports
        </TabsTrigger>
      </TabsList>

      {/* Dashboard tab */}
      <TabsContent value="dashboard" className="space-y-4 mt-0">
        {canAdmin && (
          <div className="flex justify-end">
            <LogicEditorDialog
              type="dashboard"
              companySlug={companySlug}
              onSave={handleAddDashboard}
              trigger={
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Write Dashboard Logic
                </Button>
              }
            />
          </div>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : dashboards.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <LayoutDashboard className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No dashboards configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboards.map((d) => (
              <ItemViewer
                key={d.id}
                item={d}
                type="dashboard"
                permission={permission}
                filters={getF(d.id, dbFilters)}
                onFilterChange={(patch) => setF(d.id, patch, setDbFilters)}
                canAdmin={canAdmin}
                companySlug={companySlug}
                onUpdate={handleUpdateDashboard}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Reports tab */}
      <TabsContent value="reports" className="space-y-4 mt-0">
        {canAdmin && (
          <div className="flex justify-end">
            <LogicEditorDialog
              type="report"
              companySlug={companySlug}
              onSave={handleAddReport}
              trigger={
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Write Report Logic
                </Button>
              }
            />
          </div>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <FileBarChart2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No reports configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <ItemViewer
                key={r.id}
                item={r}
                type="report"
                permission={permission}
                filters={getF(r.id, rpFilters)}
                onFilterChange={(patch) => setF(r.id, patch, setRpFilters)}
                canAdmin={canAdmin}
                companySlug={companySlug}
                onUpdate={handleUpdateReport}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default DashboardCompanyView;
