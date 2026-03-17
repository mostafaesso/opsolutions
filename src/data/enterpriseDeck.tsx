import { DeckData } from "./types";
import {
  TitleSlide,
  SectionSlide,
  StatsSlide,
  FeatureGridSlide,
  QuoteSlide,
  CTASlide,
} from "./slideComponents";

export const enterpriseDeck: DeckData = {
  id: "enterprise",
  title: "Enterprise",
  slides: [
    {
      id: "e1",
      content: (
        <TitleSlide
          headline={"Where HR and\nFinance move as one"}
          subtitle="A new-age platform for all Small, Medium, Enterprise and growing businesses to scale HR processes, manage talent and control spend."
          footer="trusted"
        />
      ),
    },
    {
      id: "e2",
      content: (
        <SectionSlide
          title="Enterprise challenges"
          items={[
            "Managing thousands of employees across multiple entities",
            "Complex payroll with allowances, deductions and compliance",
            "Lack of real-time visibility into workforce data",
            "Disconnected HR and Finance systems",
          ]}
        />
      ),
    },
    {
      id: "e3",
      content: (
        <StatsSlide
          title="The cost of outdated HR"
          stats={[
            { value: "SAR 5M+", label: "Average annual cost of manual HR errors" },
            { value: "30%", label: "Time wasted on repetitive admin tasks" },
            { value: "60+", label: "Days to onboard with legacy systems" },
          ]}
        />
      ),
    },
    {
      id: "e4",
      content: (
        <SectionSlide
          title="Jisr Enterprise Solution"
          items={[
            "Unified HR and Finance on a single platform",
            "Multi-entity management with consolidated reporting",
            "Role-based access for departments and locations",
            "Custom workflows for complex approval chains",
          ]}
        />
      ),
    },
    {
      id: "e5",
      content: (
        <FeatureGridSlide
          title="Core modules"
          features={[
            { icon: "💰", name: "Payroll Engine", desc: "WPS-compliant, multi-entity payroll with auto-calculations" },
            { icon: "👥", name: "Workforce Management", desc: "End-to-end employee lifecycle from hire to retire" },
            { icon: "📊", name: "Analytics & BI", desc: "Real-time dashboards and custom report builder" },
            { icon: "🔐", name: "Compliance Hub", desc: "Automated GOSI, Muqeem, Qiwa integrations" },
            { icon: "⏰", name: "Time & Attendance", desc: "Biometric, GPS and geofence-based tracking" },
            { icon: "🎯", name: "Performance", desc: "OKRs, 360 reviews and succession planning" },
          ]}
        />
      ),
    },
    {
      id: "e6",
      content: (
        <StatsSlide
          title="Platform performance"
          stats={[
            { value: "99.99%", label: "Uptime SLA" },
            { value: "<2s", label: "Average page load time" },
            { value: "ISO 27001", label: "Certified security" },
          ]}
        />
      ),
    },
    {
      id: "e7",
      content: (
        <SectionSlide
          title="Government integrations"
          items={[
            "GOSI — Automated monthly submissions",
            "Muqeem — Real-time visa and iqama tracking",
            "Qiwa — Contract management and compliance",
            "Mudad — Wage protection system integration",
          ]}
        />
      ),
    },
    {
      id: "e8",
      content: (
        <FeatureGridSlide
          title="Advanced capabilities"
          features={[
            { icon: "🏢", name: "Multi-Entity", desc: "Manage multiple companies from a single dashboard" },
            { icon: "🔄", name: "Workflow Engine", desc: "Custom approval chains and automated processes" },
            { icon: "📱", name: "Mobile App", desc: "Full employee self-service on iOS and Android" },
            { icon: "🔌", name: "Open API", desc: "RESTful APIs for ERP, accounting and custom integrations" },
            { icon: "🌐", name: "Multi-Language", desc: "Full Arabic and English support" },
            { icon: "☁️", name: "Cloud Native", desc: "Saudi-hosted with data residency compliance" },
          ]}
        />
      ),
    },
    {
      id: "e9",
      content: (
        <QuoteSlide
          quote="Jisr replaced 4 different systems for us and saved over SAR 2M annually in operational costs."
          author="Ahmed Al-Zahrani"
          role="CHRO, National Conglomerate"
        />
      ),
    },
    {
      id: "e10",
      content: (
        <SectionSlide
          title="Implementation & support"
          items={[
            "Dedicated implementation manager",
            "Data migration from any legacy system",
            "Custom training programs for all user levels",
            "24/7 priority support with dedicated CSM",
          ]}
        />
      ),
    },
    {
      id: "e11",
      content: (
        <StatsSlide
          title="Enterprise customers trust Jisr"
          stats={[
            { value: "500+", label: "Enterprise clients" },
            { value: "95%", label: "Customer retention rate" },
            { value: "4.8/5", label: "Customer satisfaction" },
          ]}
        />
      ),
    },
    {
      id: "e12",
      content: (
        <SectionSlide
          title="Security & compliance"
          items={[
            "ISO 27001 certified information security",
            "Data hosted in Saudi Arabia (data residency)",
            "SOC 2 Type II compliance",
            "End-to-end encryption at rest and in transit",
          ]}
        />
      ),
    },
    {
      id: "e13",
      content: (
        <QuoteSlide
          quote="The level of localization and compliance automation is unmatched in the market."
          author="Fatima Al-Harbi"
          role="CFO, Healthcare Group"
        />
      ),
    },
    {
      id: "e14",
      content: (
        <SectionSlide
          title="ROI you can measure"
          items={[
            "80% reduction in payroll processing time",
            "60% fewer compliance-related errors",
            "50% faster employee onboarding",
            "90% employee self-service adoption",
          ]}
        />
      ),
    },
    {
      id: "e15",
      content: (
        <FeatureGridSlide
          title="Coming soon"
          features={[
            { icon: "🤖", name: "AI Assistant", desc: "Natural language HR queries and automated insights" },
            { icon: "📈", name: "Predictive Analytics", desc: "Attrition prediction and workforce planning" },
            { icon: "💳", name: "Expense Management", desc: "Integrated travel and expense reporting" },
          ]}
        />
      ),
    },
    {
      id: "e16",
      content: (
        <SectionSlide
          title="Why enterprises choose Jisr"
          items={[
            "Purpose-built for the Saudi and MENA market",
            "Unified HR + Finance eliminates silos",
            "Fastest implementation in the category",
            "Continuously updated for regulatory changes",
          ]}
        />
      ),
    },
    {
      id: "e17",
      content: (
        <StatsSlide
          title="The Jisr difference"
          stats={[
            { value: "1", label: "Unified platform for HR & Finance" },
            { value: "100%", label: "Saudi labor law compliance" },
            { value: "24/7", label: "Enterprise-grade support" },
          ]}
        />
      ),
    },
    {
      id: "e18",
      content: (
        <CTASlide
          headline="Ready to transform your HR?"
          subtitle="Schedule a personalized enterprise demo at jisr.net"
        />
      ),
    },
  ],
};
