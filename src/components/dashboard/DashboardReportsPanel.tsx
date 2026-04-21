import { useState } from "react";
import {
  Building2,
  LayoutDashboard,
  FileBarChart2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Users,
  MapPin,
  Filter,
  ExternalLink,
} from "lucide-react";
import { Company } from "@/lib/companies";
import { useDashboardItems, DashboardItem, ReportItem } from "@/hooks/useDashboardItems";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { LogicEditorDialog, LogicFormData } from "./LogicEditorDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  companies: Company[];
}

const FilterBadges = ({ item }: { item: DashboardItem | ReportItem }) => {
  const badges: { label: string; icon: React.ReactNode }[] = [];
  if (item.filter_date) badges.push({ label: "Date", icon: <Calendar className="w-2.5 h-2.5" /> });
  if (item.filter_team) badges.push({ label: "Team", icon: <Users className="w-2.5 h-2.5" /> });
  if (item.filter_region) badges.push({ label: "Region", icon: <MapPin className="w-2.5 h-2.5" /> });
  if (badges.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      <Filter className="w-3 h-3 text-muted-foreground" />
      {badges.map((b) => (
        <Badge key={b.label} variant="secondary" className="text-[10px] gap-1 px-1.5 py-0 h-4">
          {b.icon} {b.label}
        </Badge>
      ))}
    </div>
  );
};

interface ItemCardProps {
  item: DashboardItem | ReportItem;
  type: "dashboard" | "report";
  companySlug: string;
  onUpdate: (id: string, data: LogicFormData) => Promise<void>;
  onDelete: (id: string) => void;
}

const ItemCard = ({ item, type, companySlug, onUpdate, onDelete }: ItemCardProps) => (
  <div className="flex items-start gap-3 p-3 border border-border rounded-lg bg-background hover:bg-muted/20 transition-colors">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold">{item.name}</p>
        {item.iframe_url && (
          <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0">
            <ExternalLink className="w-2.5 h-2.5" /> Embed
          </Badge>
        )}
      </div>
      {item.description && (
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
      )}
      {item.logic_prompt && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
          &ldquo;{item.logic_prompt}&rdquo;
        </p>
      )}
      <FilterBadges item={item} />
    </div>

    <div className="flex items-center gap-1 shrink-0">
      <LogicEditorDialog
        type={type}
        companySlug={companySlug}
        initialData={item}
        onSave={(data) => onUpdate(item.id, data)}
        trigger={
          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
            <Pencil className="w-3 h-3" />
          </Button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{item.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);

const DashboardReportsPanel = ({ companies }: Props) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(companies[0]?.slug ?? "");
  const { toast } = useToast();

  const company = companies.find((c) => c.slug === selectedSlug);
  const { settings, update: updateSettings } = useCompanySettings(selectedSlug);
  const {
    dashboards,
    reports,
    loading,
    addDashboard,
    updateDashboard,
    deleteDashboard,
    addReport,
    updateReport,
    deleteReport,
  } = useDashboardItems(selectedSlug);

  const handleAddDashboard = async (data: LogicFormData) => {
    try {
      await addDashboard({
        ...data,
        company_slug: selectedSlug,
        sort_order: dashboards.length,
        data_definition: null,
      });
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

  const handleDeleteDashboard = async (id: string) => {
    try {
      await deleteDashboard(id);
      toast({ title: "Dashboard removed" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAddReport = async (data: LogicFormData) => {
    try {
      await addReport({
        ...data,
        company_slug: selectedSlug,
        sort_order: reports.length,
        data_definition: null,
      });
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

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      toast({ title: "Report removed" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Company picker */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Company
          </p>
          <p className="text-sm font-bold text-foreground">
            {company?.name ?? "Select a company"}
          </p>
        </div>
        <Select value={selectedSlug} onValueChange={setSelectedSlug}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSlug && (
        <>
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibility & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Show Dashboard & Reports</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adds this section to the company portal sidebar
                  </p>
                </div>
                <Switch
                  checked={settings.dashboards_enabled}
                  onCheckedChange={(v) => updateSettings({ dashboards_enabled: v })}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Permission Level</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <strong>View Only</strong> — users see dashboards/reports but cannot change
                    filters.
                    <br />
                    <strong>Edit</strong> — users can change date, team, and region filter values.
                  </p>
                </div>
                <Select
                  value={settings.dashboards_permission}
                  onValueChange={(v) =>
                    updateSettings({ dashboards_permission: v as "view_only" | "edit" })
                  }
                >
                  <SelectTrigger className="w-36 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view_only">View Only</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dashboards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Dashboards</CardTitle>
                {!loading && (
                  <span className="text-xs text-muted-foreground">({dashboards.length})</span>
                )}
              </div>
              <LogicEditorDialog
                type="dashboard"
                companySlug={selectedSlug}
                onSave={handleAddDashboard}
                trigger={
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Write Dashboard Logic
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : dashboards.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <LayoutDashboard className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No dashboards yet. Click{" "}
                    <span className="font-medium">Write Dashboard Logic</span> to add one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboards.map((d) => (
                    <ItemCard
                      key={d.id}
                      item={d}
                      type="dashboard"
                      companySlug={selectedSlug}
                      onUpdate={handleUpdateDashboard}
                      onDelete={handleDeleteDashboard}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileBarChart2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Reports</CardTitle>
                {!loading && (
                  <span className="text-xs text-muted-foreground">({reports.length})</span>
                )}
              </div>
              <LogicEditorDialog
                type="report"
                companySlug={selectedSlug}
                onSave={handleAddReport}
                trigger={
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Write Report Logic
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : reports.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <FileBarChart2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No reports yet. Click{" "}
                    <span className="font-medium">Write Report Logic</span> to add one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((r) => (
                    <ItemCard
                      key={r.id}
                      item={r}
                      type="report"
                      companySlug={selectedSlug}
                      onUpdate={handleUpdateReport}
                      onDelete={handleDeleteReport}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardReportsPanel;
