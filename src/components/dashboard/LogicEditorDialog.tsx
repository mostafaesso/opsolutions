import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardItem, ReportItem } from "@/hooks/useDashboardItems";

export interface LogicFormData {
  name: string;
  description: string;
  logic_prompt: string;
  filter_team: boolean;
  filter_date: boolean;
  filter_region: boolean;
  iframe_url: string;
}

interface LogicEditorDialogProps {
  type: "dashboard" | "report";
  companySlug: string;
  initialData?: DashboardItem | ReportItem;
  onSave: (data: LogicFormData) => Promise<void>;
  trigger: React.ReactNode;
}

const EMPTY: LogicFormData = {
  name: "",
  description: "",
  logic_prompt: "",
  filter_team: false,
  filter_date: false,
  filter_region: false,
  iframe_url: "",
};

const fromItem = (item: DashboardItem | ReportItem): LogicFormData => ({
  name: item.name,
  description: item.description ?? "",
  logic_prompt: item.logic_prompt ?? "",
  filter_team: item.filter_team,
  filter_date: item.filter_date,
  filter_region: item.filter_region,
  iframe_url: item.iframe_url ?? "",
});

export const LogicEditorDialog = ({
  type,
  initialData,
  onSave,
  trigger,
}: LogicEditorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LogicFormData>(initialData ? fromItem(initialData) : EMPTY);
  const [saving, setSaving] = useState(false);

  const label = type === "dashboard" ? "Dashboard" : "Report";

  const reset = () => setForm(initialData ? fromItem(initialData) : EMPTY);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v) setForm(initialData ? fromItem(initialData) : EMPTY);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      setOpen(false);
      reset();
    } finally {
      setSaving(false);
    }
  };

  const dashboardPlaceholder = `Example:
Show total deals closed this month from HubSpot CRM, broken down by sales rep. Include a pipeline funnel showing deals at each stage.

Metrics: closed-won count, total revenue, avg deal size
Data source: HubSpot Deals API (use the company's private app token)
Filters: date range (deal close date), team (sales team name), region (territory)`;

  const reportPlaceholder = `Example:
Weekly pipeline report showing all open deals by stage, expected close date, and assigned rep. Highlight deals with no activity in 7+ days.

Data source: HubSpot Deals + Activities API
Output: table with columns — Deal Name, Stage, Owner, Close Date, Last Activity
Filters: date range (creation date), team, region`;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? `Edit ${label}` : `Write ${label} Logic`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              placeholder={
                type === "dashboard"
                  ? "e.g. Sales Performance Dashboard"
                  : "e.g. Monthly Pipeline Report"
              }
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              placeholder="Brief summary shown to users"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Logic Prompt */}
          <div className="space-y-1.5">
            <Label>{label} Logic</Label>
            <p className="text-xs text-muted-foreground">
              Describe what data this {label.toLowerCase()} should display, which HubSpot objects
              to query (using the company's private app token), and how data should be aggregated.
            </p>
            <Textarea
              rows={7}
              placeholder={type === "dashboard" ? dashboardPlaceholder : reportPlaceholder}
              value={form.logic_prompt}
              onChange={(e) => setForm((f) => ({ ...f, logic_prompt: e.target.value }))}
              className="font-mono text-xs resize-y"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <Label>Supported Filters</Label>
            <p className="text-xs text-muted-foreground">
              Choose which filters users can apply. With "Edit" permission they can change these
              values; with "View Only" the filters are static.
            </p>
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={form.filter_date}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, filter_date: !!v }))}
                />
                <span className="text-sm">Date Range</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={form.filter_team}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, filter_team: !!v }))}
                />
                <span className="text-sm">Team</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={form.filter_region}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, filter_region: !!v }))}
                />
                <span className="text-sm">Region</span>
              </label>
            </div>
          </div>

          {/* Embed URL */}
          <div className="space-y-1.5">
            <Label>Embed URL (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Paste an embed/iframe URL from HubSpot, Looker Studio, Tableau, or any other BI
              tool. Leave blank to display the logic definition only.
            </p>
            <Input
              placeholder="https://lookerstudio.google.com/embed/reporting/..."
              value={form.iframe_url}
              onChange={(e) => setForm((f) => ({ ...f, iframe_url: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : initialData ? "Save Changes" : `Add ${label}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
