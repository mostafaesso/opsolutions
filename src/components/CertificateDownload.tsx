import { useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";

interface CertificateDownloadProps {
  userName: string;
  companyName: string;
  completedCount: number;
  totalCount: number;
}

const CertificateDownload = ({ userName, companyName, completedCount, totalCount }: CertificateDownloadProps) => {
  const [generating, setGenerating] = useState(false);
  const isComplete = completedCount >= totalCount;

  const generateCertificate = async () => {
    if (!isComplete || generating) return;
    setGenerating(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1130;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1600, 1130);

      // Border
      ctx.strokeStyle = "#1E3A5F";
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, 1520, 1050);

      // Inner border
      ctx.strokeStyle = "#D4A853";
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, 1490, 1020);

      // Top decorative line
      ctx.fillStyle = "#1E3A5F";
      ctx.fillRect(100, 130, 1400, 4);

      // "CERTIFICATE OF COMPLETION" header
      ctx.fillStyle = "#D4A853";
      ctx.font = "600 16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "8px";
      ctx.fillText("CERTIFICATE OF COMPLETION", 800, 110);

      // Award icon placeholder
      ctx.fillStyle = "#D4A853";
      ctx.beginPath();
      ctx.arc(800, 220, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px serif";
      ctx.fillText("★", 800, 234);

      // "This certifies that"
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 18px Inter, sans-serif";
      ctx.fillText("This is to certify that", 800, 310);

      // User name
      ctx.fillStyle = "#1E3A5F";
      ctx.font = "bold 48px Inter, sans-serif";
      ctx.fillText(userName, 800, 380);

      // Decorative line under name
      ctx.fillStyle = "#D4A853";
      ctx.fillRect(500, 400, 600, 2);

      // Company
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 18px Inter, sans-serif";
      ctx.fillText(`from ${companyName}`, 800, 450);

      // "has successfully completed"
      ctx.fillStyle = "#374151";
      ctx.font = "400 20px Inter, sans-serif";
      ctx.fillText("has successfully completed all modules of the", 800, 510);

      // Course name
      ctx.fillStyle = "#1E3A5F";
      ctx.font = "bold 32px Inter, sans-serif";
      ctx.fillText("HubSpot CRM Sales Training Program", 800, 560);

      // Modules count
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 16px Inter, sans-serif";
      ctx.fillText(`${totalCount} training modules completed`, 800, 600);

      // Date
      const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      ctx.fillStyle = "#374151";
      ctx.font = "400 18px Inter, sans-serif";
      ctx.fillText(date, 800, 660);

      // Bottom decorative line
      ctx.fillStyle = "#1E3A5F";
      ctx.fillRect(100, 720, 1400, 4);

      // Signatures area
      // Left: Ops Solutions
      ctx.fillStyle = "#D4A853";
      ctx.fillRect(250, 820, 300, 2);
      ctx.fillStyle = "#374151";
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.fillText("Ops Solutions", 400, 855);
      ctx.font = "400 14px Inter, sans-serif";
      ctx.fillStyle = "#6B7280";
      ctx.fillText("Training Provider", 400, 878);

      // Right: Program
      ctx.fillStyle = "#D4A853";
      ctx.fillRect(1050, 820, 300, 2);
      ctx.fillStyle = "#374151";
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.fillText("HubSpot CRM Academy", 1200, 855);
      ctx.font = "400 14px Inter, sans-serif";
      ctx.fillStyle = "#6B7280";
      ctx.fillText("Sales Training Program", 1200, 878);

      // Footer
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "400 12px Inter, sans-serif";
      ctx.fillText("Powered by Ops Solutions • www.opsolutionss.com", 800, 1040);

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate-${userName.replace(/\s+/g, "-")}-${companyName.replace(/\s+/g, "-")}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setGenerating(false);
      }, "image/png");
    } catch {
      setGenerating(false);
    }
  };

  if (!isComplete) return null;

  return (
    <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-6 text-center space-y-4">
      <Award className="w-12 h-12 mx-auto" style={{ color: "hsl(160, 84%, 39%)" }} />
      <div>
        <h3 className="text-lg font-bold text-foreground">🎉 Congratulations!</h3>
        <p className="text-sm text-muted-foreground mt-1">You've completed all {totalCount} training modules. Download your certificate below.</p>
      </div>
      <button
        onClick={generateCertificate}
        disabled={generating}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {generating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Download className="w-4 h-4" /> Download Certificate</>
        )}
      </button>
    </div>
  );
};

export default CertificateDownload;
