import { DeckData } from "./types";
import {
  TitleSlide,
  SectionSlide,
  StatsSlide,
  FeatureGridSlide,
  QuoteSlide,
  CTASlide,
} from "./slideComponents";

export const microDeck: DeckData = {
  id: "micro",
  title: "Micro",
  slides: [
    {
      id: "m1",
      content: (
        <TitleSlide
          headline={"Your one-stop shop for HR,\npayroll and compliance"}
          subtitle={"Meet Jisr 2.0: A new-age platform for growing businesses\nto scale HR processes, manage talent and control spend."}
          footer="trusted"
        />
      ),
    },
    {
      id: "m2",
      content: (
        <SectionSlide
          title="Startup HR headaches"
          items={[
            "Founders doing HR on Google Sheets",
            "Missing GOSI deadlines and getting fines",
            "No time to learn complex HR software",
          ]}
        />
      ),
    },
    {
      id: "m3",
      content: (
        <StatsSlide
          title="The startup reality"
          stats={[
            { value: "8hrs", label: "Monthly time wasted on manual payroll" },
            { value: "SAR 15K", label: "Average fines from missed GOSI filings" },
            { value: "67%", label: "of startups have no formal HR system" },
          ]}
        />
      ),
    },
    {
      id: "m4",
      content: (
        <FeatureGridSlide
          title="Jisr for startups"
          features={[
            { icon: "⚡", name: "Quick Setup", desc: "Up and running in under 1 hour" },
            { icon: "💰", name: "Easy Payroll", desc: "One-click WPS-compliant payroll" },
            { icon: "🔗", name: "Auto Compliance", desc: "GOSI, Muqeem — fully automated" },
            { icon: "📱", name: "Mobile First", desc: "Manage your team from your phone" },
            { icon: "🆓", name: "Free to Start", desc: "No cost for small teams getting started" },
            { icon: "📈", name: "Scale Ready", desc: "Grows with you — no switching platforms" },
          ]}
        />
      ),
    },
    {
      id: "m5",
      content: (
        <QuoteSlide
          quote="As a 10-person startup, Jisr gave us enterprise-level HR without the complexity."
          author="Omar Al-Dosari"
          role="Founder, Fintech Startup"
        />
      ),
    },
    {
      id: "m6",
      content: (
        <SectionSlide
          title="Perfect for teams of 1-49"
          items={[
            "No HR expertise required",
            "Guided workflows for every process",
            "Built-in Saudi labor law compliance",
          ]}
        />
      ),
    },
    {
      id: "m7",
      content: (
        <StatsSlide
          title="Micro plan results"
          stats={[
            { value: "95%", label: "Less time on payroll" },
            { value: "0", label: "Compliance fines" },
            { value: "1hr", label: "Setup time" },
          ]}
        />
      ),
    },
    {
      id: "m8",
      content: (
        <SectionSlide
          title="Everything included"
          items={[
            "Employee records and document management",
            "Payroll with bank file generation",
            "Leave management with auto-calculations",
            "Government portal integrations",
          ]}
        />
      ),
    },
    {
      id: "m9",
      content: (
        <QuoteSlide
          quote="I used to dread the 10th of every month. Now payroll takes 5 minutes."
          author="Lina Al-Qahtani"
          role="Co-founder, E-commerce Startup"
        />
      ),
    },
    {
      id: "m10",
      content: (
        <SectionSlide
          title="Startup-friendly pricing"
          items={[
            "Free plan for teams up to 10",
            "Affordable per-employee pricing after that",
            "No contracts — cancel anytime",
          ]}
        />
      ),
    },
    {
      id: "m11",
      content: (
        <StatsSlide
          title="Trusted by startups"
          stats={[
            { value: "1,500+", label: "Startups on Jisr" },
            { value: "4.8/5", label: "Startup founder rating" },
            { value: "50%", label: "Come from referrals" },
          ]}
        />
      ),
    },
    {
      id: "m12",
      content: (
        <CTASlide
          headline="Start free today"
          subtitle="No credit card required — jisr.net"
        />
      ),
    },
  ],
};
