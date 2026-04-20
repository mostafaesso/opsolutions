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
    <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-left w-full hover:opacity-80 transition-opacity"
        >
          <img
            src={companyLogoUrl}
            alt={companyName}
            className="h-9 w-9 object-contain rounded"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{companyName}</p>
            <p className="text-[11px] text-muted-foreground truncate">Client Portal</p>
          </div>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => {
                onSelect(item.key);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-accent" />
              )}
              <span className={`shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        {userName && (
          <p className="text-[11px] text-muted-foreground truncate">👋 {userName}</p>
        )}
        <a
          href="https://www.opsolutionss.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group"
        >
          <img
            src="https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"
            alt="Ops Solutions"
            className="h-5 opacity-60 group-hover:opacity-100 transition-opacity"
          />
          <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
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
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src={companyLogoUrl} alt={companyName} className="h-8 w-8 object-contain" />
          <span className="font-semibold text-sm">{companyName}</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md hover:bg-muted"
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
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 shadow-xl">{sidebar}</div>
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
