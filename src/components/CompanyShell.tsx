import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export interface SidebarItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface CompanyShellProps {
  companyName: string;
  companyLogoUrl: string;
  userName?: string;
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  topBanner?: ReactNode;
  children: ReactNode;
}

const CompanyShell = ({
  companyName,
  companyLogoUrl,
  userName,
  items,
  activeKey,
  onSelect,
  topBanner,
  children,
}: CompanyShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const sidebar = (
    <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col h-full shadow-[1px_0_0_0_hsl(var(--border))]">
      {/* Brand header */}
      <div className="px-5 py-4 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-left w-full group"
        >
          <div className="h-9 w-9 rounded-lg border border-border bg-muted/50 overflow-hidden flex items-center justify-center shrink-0 transition-shadow duration-200 group-hover:shadow-glow-sm">
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate font-display leading-tight">
              {companyName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">Client Portal</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => {
                onSelect(item.key);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                active
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />
              )}
              <span
                className={`shrink-0 transition-colors duration-150 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2.5">
        {userName && (
          <p className="text-[11px] text-muted-foreground truncate">
            Signed in as <span className="font-medium text-foreground/70">{userName}</span>
          </p>
        )}
        <a
          href="https://www.opsolutionss.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group w-fit"
        >
          <img
            src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
            alt="Ops Solutions"
            className="h-4 opacity-50 group-hover:opacity-80 transition-opacity duration-150"
          />
          <span className="text-[10px] text-muted-foreground group-hover:text-foreground/60 transition-colors duration-150">
            Powered by Ops Solutions
          </span>
        </a>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {topBanner}

      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
            <img src={companyLogoUrl} alt={companyName} className="h-full w-full object-contain" />
          </div>
          <span className="font-semibold text-sm font-display">{companyName}</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex sticky top-0 h-screen">{sidebar}</div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 shadow-xl animate-slide-in-right">
              {sidebar}
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default CompanyShell;
