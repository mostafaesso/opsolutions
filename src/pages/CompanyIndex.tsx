import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GraduationCap, Bell, Rocket, FileText, Video, BarChart2 } from "lucide-react";
import { fetchCompanyBySlug, Company } from "@/lib/companies";
import { useTrainingUser, useCompletions, TrainingUser } from "@/hooks/useTrainingUser";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RegistrationGate from "@/components/RegistrationGate";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import { getImpersonation } from "@/lib/impersonation";
import CompanyShell, { SidebarItem } from "@/components/CompanyShell";
import DocTraining from "@/components/training/DocTraining";
import VideoTraining from "@/components/training/VideoTraining";
import CrmUpdatesFeed from "@/components/crm/CrmUpdatesFeed";
import GtmModule from "@/components/gtm/GtmModule";
import DashboardCompanyView from "@/components/dashboard/DashboardCompanyView";

const IMPERSONATE_USER: TrainingUser = {
  id: "impersonate",
  email: "ops-admin@opsolutions.com",
  full_name: "Ops Admin (Preview)",
  company_slug: "",
};

type ModuleKey = "training" | "crm" | "gtm" | "dashboard_reports";

const CompanyIndex = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleKey>("training");

  const impersonation = getImpersonation();
  const isImpersonating = !!impersonation && impersonation.companySlug === companySlug;
  const { isSuperAdmin } = useSuperAdmin();

  useEffect(() => {
    if (!companySlug) {
      setCompanyLoading(false);
      return;
    }
    fetchCompanyBySlug(companySlug).then((c) => {
      setCompany(c);
      setCompanyLoading(false);
    });
  }, [companySlug]);

  const { user: realUser, loading: regLoading, register } = useTrainingUser(companySlug || "");
  const user = isImpersonating
    ? { ...IMPERSONATE_USER, company_slug: companySlug || "" }
    : realUser;
  const { completions, markComplete } = useCompletions(isImpersonating ? undefined : realUser?.id);
  const { settings } = useCompanySettings(companySlug);

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Company not found</h1>
          <p className="text-muted-foreground">This training portal doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (company.isActive === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            This portal is currently unavailable
          </h1>
          <p className="text-muted-foreground">
            Access to this training portal has been temporarily disabled. Please contact your
            administrator.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <RegistrationGate
        companyName={company.name}
        companyLogo={company.logoUrl}
        loading={regLoading}
        onRegister={register}
      />
    );
  }

  const isManager = isImpersonating
    ? impersonation!.role === "manager" || impersonation!.role === "admin"
    : (company.managerEmails?.some((e) => e.toLowerCase() === user.email.toLowerCase()) ??
        false);

  const canSeeCrmUpdates = isManager || isSuperAdmin || settings.crm_updates_employee_visible;
  const canSeeGtm = isManager || isSuperAdmin || !!company.gtmEnabled;

  // Build sidebar items based on visibility
  const sidebarItems: SidebarItem[] = [
    { key: "training", label: "Training", icon: <GraduationCap className="w-4 h-4" /> },
  ];
  if (canSeeCrmUpdates) {
    sidebarItems.push({ key: "crm", label: "CRM Updates", icon: <Bell className="w-4 h-4" /> });
  }
  if (canSeeGtm) {
    sidebarItems.push({ key: "gtm", label: "GTM", icon: <Rocket className="w-4 h-4" /> });
  }
  if (isSuperAdmin || settings.dashboards_enabled) {
    sidebarItems.push({
      key: "dashboard_reports",
      label: "Dashboards & Reports",
      icon: <BarChart2 className="w-4 h-4" />,
    });
  }

  // Training sub-tab default
  const docOn = settings.training_doc_enabled;
  const videoOn = settings.training_video_enabled;
  const defaultTrainingTab = docOn ? "doc" : videoOn ? "video" : "doc";

  // Wrap markComplete for journey steps
  const handleMarkDone = (stepKey: string) => {
    if (!realUser?.id) return;
    markComplete(stepKey, 100);
  };

  return (
    <CompanyShell
      companyName={company.name}
      companyLogoUrl={company.logoUrl}
      userName={user.full_name}
      items={sidebarItems}
      activeKey={activeModule}
      onSelect={(k) => setActiveModule(k as ModuleKey)}
      topBanner={isImpersonating ? <ImpersonationBanner state={impersonation!} /> : undefined}
    >
      {activeModule === "training" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Training</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Step-by-step guidance built for {company.name}.
            </p>
          </div>

          {!docOn && !videoOn ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Training is not enabled for this portal yet.
              </p>
            </div>
          ) : (
            <Tabs defaultValue={defaultTrainingTab}>
              <TabsList>
                {docOn && (
                  <TabsTrigger value="doc">
                    <FileText className="w-4 h-4 mr-2" />
                    Doc Training
                  </TabsTrigger>
                )}
                {videoOn && (
                  <TabsTrigger value="video">
                    <Video className="w-4 h-4 mr-2" />
                    Video Training
                  </TabsTrigger>
                )}
              </TabsList>

              {docOn && (
                <TabsContent value="doc" className="mt-6">
                  <DocTraining
                    companySlug={companySlug!}
                    userId={realUser?.id}
                    completions={completions}
                    onMarkDone={handleMarkDone}
                  />
                </TabsContent>
              )}
              {videoOn && (
                <TabsContent value="video" className="mt-6">
                  <VideoTraining companySlug={companySlug!} />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      )}

      {activeModule === "crm" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">CRM Updates</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Recent changes Ops Solutions has shipped in your HubSpot.
            </p>
          </div>
          <CrmUpdatesFeed companySlug={companySlug!} />
        </div>
      )}

      {activeModule === "gtm" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Go-to-Market</h1>
            <p className="text-muted-foreground text-sm mt-1">
              ICP definition and the 8-layer GTM stack tailored to {company.name}.
            </p>
          </div>
          <GtmModule companySlug={companySlug!} canEdit={isSuperAdmin} />
        </div>
      )}

      {activeModule === "dashboard_reports" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Dashboards & Reports
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Live data dashboards and reports for {company.name}.
            </p>
          </div>
          <DashboardCompanyView
            companySlug={companySlug!}
            permission={settings.dashboards_permission}
            canAdmin={isSuperAdmin}
          />
        </div>
      )}
    </CompanyShell>
  );
};

export default CompanyIndex;
