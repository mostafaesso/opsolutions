import { DeckData } from "./types";
import {
  TitleSlide,
  SectionSlide,
  StatsSlide,
  FeatureGridSlide,
  QuoteSlide,
  CTASlide,
} from "./slideComponents";

export const storyDeck: DeckData = {
  id: "story",
  title: "Our Story",
  slides: [
    {
      id: "s1",
      content: (
        <TitleSlide
          headline={"Where HR and\nFinance move as one"}
          subtitle={"Meet Jisr: A new-age platform for growing businesses\nto scale HR processes, manage talent and control spend."}
          footer="trusted"
        />
      ),
    },
    {
      id: "s2",
      content: (
        <SectionSlide
          title="The Problem"
          items={[
            "HR teams drown in spreadsheets and manual processes",
            "Payroll errors cost businesses millions in compliance fines",
            "No single platform designed for the Saudi market",
          ]}
        />
      ),
    },
    {
      id: "s3",
      content: (
        <StatsSlide
          title="The HR landscape in Saudi Arabia"
          stats={[
            { value: "70%", label: "of companies still use manual HR processes" },
            { value: "SAR 2.1B", label: "lost annually to payroll errors" },
            { value: "45%", label: "of HR time spent on admin tasks" },
          ]}
        />
      ),
    },
    {
      id: "s4",
      content: (
        <SectionSlide
          title="Our Mission"
          items={[
            "Automate every HR process end-to-end",
            "Ensure 100% compliance with Saudi labor law",
            "Empower employees with self-service tools",
          ]}
        />
      ),
    },
    {
      id: "s5",
      content: (
        <StatsSlide
          title="Jisr by the numbers"
          stats={[
            { value: "5,000+", label: "Companies trust Jisr" },
            { value: "500K+", label: "Employees managed" },
            { value: "99.9%", label: "Uptime guarantee" },
          ]}
        />
      ),
    },
    {
      id: "s6",
      content: (
        <FeatureGridSlide
          title="What we offer"
          features={[
            { icon: "💰", name: "Payroll", desc: "Automated WPS-compliant payroll processing" },
            { icon: "📋", name: "HR Management", desc: "Complete employee lifecycle management" },
            { icon: "⏰", name: "Attendance", desc: "Smart time tracking and shift management" },
            { icon: "🏖️", name: "Leave Management", desc: "Automated leave policies and approvals" },
            { icon: "🔗", name: "Integrations", desc: "GOSI, Muqeem, Qiwa and more" },
            { icon: "📊", name: "Analytics", desc: "Real-time workforce insights and reports" },
          ]}
        />
      ),
    },
    {
      id: "s7",
      content: (
        <SectionSlide
          title="Founded in 2016"
          items={[
            "Started with a simple payroll solution",
            "Grew to a full HR suite in 2019",
            "Launched Jisr 2.0 with Finance integration in 2023",
          ]}
        />
      ),
    },
    {
      id: "s8",
      content: (
        <QuoteSlide
          quote="Jisr transformed how we manage our 2,000+ employees across 15 locations."
          author="Mohammed Al-Rashid"
          role="VP of People, Leading Saudi Retail Chain"
        />
      ),
    },
    {
      id: "s9",
      content: (
        <SectionSlide
          title="Our values"
          items={[
            "Customer obsession — every feature starts with a real problem",
            "Local first — built for the Saudi market, not adapted",
            "Simplicity — complex problems, simple solutions",
          ]}
        />
      ),
    },
    {
      id: "s10",
      content: (
        <StatsSlide
          title="Growth trajectory"
          stats={[
            { value: "10x", label: "Revenue growth since 2020" },
            { value: "200+", label: "Team members" },
            { value: "3", label: "Office locations" },
          ]}
        />
      ),
    },
    {
      id: "s11",
      content: (
        <SectionSlide
          title="What's next"
          items={[
            "AI-powered HR insights and predictions",
            "Expanded MENA market coverage",
            "Advanced financial planning tools",
          ]}
        />
      ),
    },
    {
      id: "s12",
      content: (
        <QuoteSlide
          quote="The best HR decision we ever made was switching to Jisr."
          author="Sarah Al-Otaibi"
          role="HR Director, Tech Startup"
        />
      ),
    },
    {
      id: "s13",
      content: (
        <CTASlide headline="Let's build the future of HR together" subtitle="Request a demo at jisr.net" />
      ),
    },
  ],
};
