import { SlideData } from "./types";

// Shared title slide component
export const TitleSlide = ({
  headline,
  subtitle,
  footer,
}: {
  headline: string;
  subtitle: string;
  footer?: string;
}) => (
  <>
    <div
      className="absolute opacity-[0.04] pointer-events-none"
      style={{ right: 80, top: "50%", transform: "translateY(-50%)" }}
    >
      <img src="/images/jisr-logo.png" alt="" style={{ width: 600 }} />
    </div>
    <div className="absolute inset-0 flex flex-col justify-center px-[120px]">
      <img src="/images/jisr-logo.png" alt="Jisr" style={{ width: 280, marginBottom: 60 }} />
      <h1
        className="whitespace-pre-line"
        style={{ fontSize: 76, lineHeight: 1.08, color: "#fff", fontWeight: 700 }}
      >
        {headline}
      </h1>
      <p
        className="whitespace-pre-line mt-10"
        style={{ fontSize: 28, maxWidth: 900, color: "rgb(166,166,166)" }}
      >
        {subtitle}
      </p>
    </div>
    {footer && (
      <div className="absolute bottom-10 left-[120px] text-[16px]" style={{ color: "rgb(102,102,102)" }}>
        Trusted by <strong style={{ color: "#fff" }}>5000+ companies</strong>
      </div>
    )}
  </>
);

// Section slide
export const SectionSlide = ({ title, items }: { title: string; items?: string[] }) => (
  <>
    <div
      className="absolute opacity-[0.04] pointer-events-none"
      style={{ right: 80, top: "50%", transform: "translateY(-50%)" }}
    >
      <img src="/images/jisr-logo.png" alt="" style={{ width: 600 }} />
    </div>
    <div className="absolute inset-0 flex flex-col justify-center px-[120px]">
      <h2 style={{ fontSize: 64, lineHeight: 1.1, color: "#fff", fontWeight: 700, marginBottom: 48 }}>
        {title}
      </h2>
      {items && (
        <div className="flex flex-col gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "hsl(221, 83%, 53%)",
                  marginTop: 14,
                  flexShrink: 0,
                }}
              />
              <p style={{ fontSize: 28, color: "rgb(200,200,200)", lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);

// Stats slide
export const StatsSlide = ({
  title,
  stats,
}: {
  title: string;
  stats: { value: string; label: string }[];
}) => (
  <>
    <div className="absolute inset-0 flex flex-col justify-center px-[120px]">
      <h2 style={{ fontSize: 56, lineHeight: 1.1, color: "#fff", fontWeight: 700, marginBottom: 80 }}>
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-16">
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 72, fontWeight: 700, color: "hsl(221, 83%, 53%)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 24, color: "rgb(166,166,166)", marginTop: 16 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </>
);

// Feature grid slide
export const FeatureGridSlide = ({
  title,
  features,
}: {
  title: string;
  features: { icon: string; name: string; desc: string }[];
}) => (
  <>
    <div className="absolute inset-0 flex flex-col justify-center px-[120px]">
      <h2 style={{ fontSize: 56, lineHeight: 1.1, color: "#fff", fontWeight: 700, marginBottom: 60 }}>
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: "rgb(28,28,28)",
              borderRadius: 16,
              padding: 32,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{f.name}</div>
            <div style={{ fontSize: 18, color: "rgb(166,166,166)", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </>
);

// Quote slide
export const QuoteSlide = ({ quote, author, role }: { quote: string; author: string; role: string }) => (
  <>
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[200px] text-center">
      <div style={{ fontSize: 64, color: "hsl(221, 83%, 53%)", marginBottom: 32 }}>"</div>
      <p style={{ fontSize: 36, color: "#fff", lineHeight: 1.5, fontWeight: 500 }}>{quote}</p>
      <div style={{ marginTop: 48 }}>
        <div style={{ fontSize: 24, color: "#fff", fontWeight: 600 }}>{author}</div>
        <div style={{ fontSize: 20, color: "rgb(166,166,166)", marginTop: 8 }}>{role}</div>
      </div>
    </div>
  </>
);

// CTA / Thank you slide
export const CTASlide = ({ headline, subtitle }: { headline: string; subtitle: string }) => (
  <>
    <div
      className="absolute opacity-[0.04] pointer-events-none"
      style={{ right: 80, top: "50%", transform: "translateY(-50%)" }}
    >
      <img src="/images/jisr-logo.png" alt="" style={{ width: 600 }} />
    </div>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[120px]">
      <img src="/images/jisr-logo.png" alt="Jisr" style={{ width: 200, marginBottom: 48 }} />
      <h2 style={{ fontSize: 64, color: "#fff", fontWeight: 700, lineHeight: 1.1 }}>{headline}</h2>
      <p style={{ fontSize: 28, color: "rgb(166,166,166)", marginTop: 24, maxWidth: 800 }}>{subtitle}</p>
    </div>
  </>
);
