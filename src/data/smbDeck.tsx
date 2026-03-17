import { DeckData } from "./types";
import {
  TitleSlide,
  SectionSlide,
  StatsSlide,
  FeatureGridSlide,
  QuoteSlide,
  CTASlide,
} from "./slideComponents";

export const smbDeck: DeckData = {
  id: "smb",
  title: "SMB",
  slides: [
    {
      id: "smb1",
      content: (
        <TitleSlide
          headline={"Where HR and\nFinance move as one"}
          subtitle={"Meet Jisr: A new-age platform for growing businesses\nto scale HR processes, manage talent and control spend."}
          footer="trusted"
        />
      ),
    },
    {
      id: "smb2",
      content: (
        <SectionSlide
          title="Growing pains of SMBs"
          items={[
            "Outgrowing spreadsheets but not ready for complex ERP",
            "HR team of 1-3 handling everything manually",
            "Payroll mistakes causing employee dissatisfaction",
            "Government compliance is time-consuming and error-prone",
          ]}
        />
      ),
    },
    {
      id: "smb3",
      content: (
        <StatsSlide
          title="SMB reality check"
          stats={[
            { value: "12hrs", label: "Average time to run payroll manually" },
            { value: "SAR 50K", label: "Average annual cost of payroll errors" },
            { value: "35%", label: "HR time on government portal updates" },
          ]}
        />
      ),
    },
    {
      id: "smb4",
      content: (
        <SectionSlide
          title="Jisr for growing businesses"
          items={[
            "Get started in days, not months",
            "All-in-one platform — no IT team needed",
            "Pricing that scales with your team",
          ]}
        />
      ),
    },
    {
      id: "smb5",
      content: (
        <FeatureGridSlide
          title="Everything you need"
          features={[
            { icon: "💰", name: "Smart Payroll", desc: "Run payroll in minutes, not hours. WPS-compliant." },
            { icon: "📋", name: "Employee Records", desc: "Digital files, documents and contracts in one place" },
            { icon: "🏖️", name: "Leave & Attendance", desc: "Automated policies, mobile check-in, real-time tracking" },
            { icon: "🔗", name: "Gov Integrations", desc: "GOSI, Muqeem, Qiwa — all automated" },
            { icon: "📱", name: "Employee App", desc: "Self-service for payslips, requests and approvals" },
            { icon: "📊", name: "Reports", desc: "Ready-made reports for every HR metric" },
          ]}
        />
      ),
    },
    {
      id: "smb6",
      content: (
        <QuoteSlide
          quote="We went from 2 days of payroll processing to 30 minutes. Jisr paid for itself in the first month."
          author="Khalid Al-Mutairi"
          role="Operations Manager, Retail SMB (85 employees)"
        />
      ),
    },
    {
      id: "smb7",
      content: (
        <StatsSlide
          title="Results SMBs see with Jisr"
          stats={[
            { value: "90%", label: "Reduction in payroll processing time" },
            { value: "0", label: "GOSI submission errors" },
            { value: "3 days", label: "Average setup time" },
          ]}
        />
      ),
    },
    {
      id: "smb8",
      content: (
        <SectionSlide
          title="Built for simplicity"
          items={[
            "Intuitive interface — no training needed",
            "Arabic and English fully supported",
            "Guided setup wizard gets you started fast",
          ]}
        />
      ),
    },
    {
      id: "smb9",
      content: (
        <FeatureGridSlide
          title="Compliance made easy"
          features={[
            { icon: "🏛️", name: "GOSI", desc: "Automatic monthly submissions and reconciliation" },
            { icon: "🛂", name: "Muqeem", desc: "Visa and iqama expiry alerts and tracking" },
            { icon: "📝", name: "Qiwa", desc: "Contract management and Saudization compliance" },
          ]}
        />
      ),
    },
    {
      id: "smb10",
      content: (
        <QuoteSlide
          quote="Finally, an HR system that understands the Saudi market. No more workarounds."
          author="Noura Al-Subaie"
          role="Founder & CEO, F&B Chain"
        />
      ),
    },
    {
      id: "smb11",
      content: (
        <SectionSlide
          title="Pricing that makes sense"
          items={[
            "Per-employee pricing — pay only for what you use",
            "No setup fees or hidden costs",
            "Free trial to experience the full platform",
            "Upgrade as you grow — no migration needed",
          ]}
        />
      ),
    },
    {
      id: "smb12",
      content: (
        <StatsSlide
          title="Join thousands of SMBs"
          stats={[
            { value: "3,500+", label: "SMB customers" },
            { value: "4.7/5", label: "App store rating" },
            { value: "97%", label: "Would recommend Jisr" },
          ]}
        />
      ),
    },
    {
      id: "smb13",
      content: (
        <SectionSlide
          title="Onboarding support"
          items={[
            "Dedicated onboarding specialist",
            "Data import from spreadsheets or any system",
            "Live chat and phone support",
            "Knowledge base and video tutorials",
          ]}
        />
      ),
    },
    {
      id: "smb14",
      content: (
        <FeatureGridSlide
          title="Coming soon for SMBs"
          features={[
            { icon: "🤖", name: "AI HR Assistant", desc: "Ask questions in natural language, get instant answers" },
            { icon: "💳", name: "Expense Tracking", desc: "Capture receipts and automate reimbursements" },
            { icon: "📈", name: "Growth Insights", desc: "Benchmarks and recommendations as you scale" },
          ]}
        />
      ),
    },
    {
      id: "smb15",
      content: (
        <SectionSlide
          title="Why SMBs choose Jisr"
          items={[
            "Built specifically for the Saudi market",
            "All-in-one solution replaces 5+ tools",
            "Fastest time-to-value in the category",
          ]}
        />
      ),
    },
    {
      id: "smb16",
      content: (
        <QuoteSlide
          quote="Jisr is the backbone of our HR operations. We couldn't imagine going back."
          author="Abdulrahman Al-Shehri"
          role="HR Manager, Construction SMB"
        />
      ),
    },
    {
      id: "smb17",
      content: (
        <CTASlide
          headline="Start your free trial today"
          subtitle="Join 3,500+ SMBs already using Jisr — jisr.net"
        />
      ),
    },
  ],
};
