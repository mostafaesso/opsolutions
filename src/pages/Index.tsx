import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ChevronRight, Presentation } from "lucide-react";

type Lang = "en" | "ar";

const presentations = [
  { id: "story", emoji: "📖", title: { en: "Our Story", ar: "قصتنا" }, subtitle: { en: "The Jisr journey", ar: "رحلة جسر" }, slides: 13, route: "/present/story" },
  { id: "enterprise", emoji: "🏢", title: { en: "Enterprise", ar: "المؤسسات" }, subtitle: { en: "For large organizations", ar: "للمؤسسات الكبيرة" }, slides: 18, route: "/present/enterprise" },
  { id: "smb", emoji: "🏪", title: { en: "SMB", ar: "الشركات المتوسطة" }, subtitle: { en: "Small & medium businesses", ar: "الشركات الصغيرة والمتوسطة" }, slides: 17, route: "/present/smb" },
  { id: "ops", emoji: "📋", title: { en: "Ops Solutions", ar: "حلول العمليات" }, subtitle: { en: "Internal collateral & training", ar: "المواد الداخلية والتدريب" }, slides: 0, route: "/ops" },
];

const Index = () => {
  const [lang, setLang] = useState<Lang>("en");
  const navigate = useNavigate();
  const isRtl = lang === "ar";

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-background relative"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgb(255, 255, 255) 1px, transparent 0px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all border border-border bg-card hover:bg-secondary"
        >
          <Globe className="w-4 h-4" />
          {lang === "en" ? "العربية" : "English"}
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl w-full px-8">
        <div className="flex flex-col items-center gap-4">
          <img src="/images/jisr-logo.png" alt="Jisr" className="h-12 mb-2" />
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            {lang === "en" ? "Select a Presentation" : "اختر عرضاً تقديمياً"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {lang === "en" ? "Choose a deck tailored to your audience" : "اختر عرضاً مناسباً لجمهورك"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {presentations.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.route)}
              className="group relative flex items-center gap-5 rounded-2xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_30px_-8px_hsl(var(--accent)/0.25)]"
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-3xl">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground">
                  {p.title[lang]}
                </div>
                <div className="text-sm text-muted-foreground">
                  {p.subtitle[lang]}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Presentation className="w-3.5 h-3.5" />
                  {p.slides} {lang === "en" ? "slides" : "شريحة"}
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform group-hover:text-accent ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
