import { useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";

interface CertificateDownloadProps {
  userName: string;
  companyName: string;
  companyLogoUrl: string;
  completedCount: number;
  totalCount: number;
  averageScore: number;
}

const loadImage = (url: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const CertificateDownload = ({
  userName,
  companyName,
  companyLogoUrl,
  completedCount,
  totalCount,
  averageScore,
}: CertificateDownloadProps) => {
  const [generating, setGenerating] = useState(false);
  const isComplete = completedCount >= totalCount;

  const generateCertificate = async () => {
    if (!isComplete || generating) return;
    setGenerating(true);

    try {
      const W = 2000, H = 1414;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      const [companyImg, opsImg] = await Promise.all([
        loadImage(companyLogoUrl),
        loadImage("https://www.opsolutionss.com/hubfs/Logos/transparent%20black.png"),
      ]);

      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      // Orange top bar
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(0, 0, W, 10);

      // Orange bottom bar
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(0, H - 10, W, 10);

      // Company logo — top left
      if (companyImg) {
        const maxW = 280, maxH = 80;
        const ratio = Math.min(maxW / companyImg.width, maxH / companyImg.height);
        const w = companyImg.width * ratio, h = companyImg.height * ratio;
        ctx.drawImage(companyImg, 70, 20, w, h);
      }

      // Ops Solutions logo — top right
      if (opsImg) {
        const maxW = 220, maxH = 70;
        const ratio = Math.min(maxW / opsImg.width, maxH / opsImg.height);
        const w = opsImg.width * ratio, h = opsImg.height * ratio;
        ctx.drawImage(opsImg, W - 70 - w, 22, w, h);
      }

      // Divider under logos
      ctx.fillStyle = "#E5E7EB";
      ctx.fillRect(70, 115, W - 140, 1);

      // "CERTIFICATE OF COMPLETION"
      ctx.fillStyle = "#FF6B35";
      ctx.font = "700 22px Arial, sans-serif";
      ctx.textAlign = "center";
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
      ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 175);
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

      // "This is to certify that"
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "400 20px Arial, sans-serif";
      ctx.fillText("This is to certify that", W / 2, 240);

      // Learner name
      ctx.fillStyle = "#2C3E50";
      ctx.font = "700 72px Arial, sans-serif";
      ctx.fillText(userName, W / 2, 345);

      // Orange line under name
      const nameMetrics = ctx.measureText(userName);
      const lineHalf = Math.min(nameMetrics.width / 2 + 40, 700);
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(W / 2 - lineHalf, 368, lineHalf * 2, 3);

      // "from [Company]"
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 24px Arial, sans-serif";
      ctx.fillText(`from ${companyName}`, W / 2, 428);

      // "has successfully completed"
      ctx.fillStyle = "#4B5563";
      ctx.font = "400 22px Arial, sans-serif";
      ctx.fillText("has successfully completed", W / 2, 488);

      // Course title
      ctx.fillStyle = "#2C3E50";
      ctx.font = "700 36px Arial, sans-serif";
      ctx.fillText("HubSpot CRM Sales Training Program", W / 2, 554);

      // Score badge
      const grade =
        averageScore >= 85 ? "Distinction" : averageScore >= 70 ? "Merit" : "Pass";
      const badgeText = `Score: ${averageScore}% — ${grade}`;
      ctx.font = "600 20px Arial, sans-serif";
      const badgeW = ctx.measureText(badgeText).width + 64;
      const badgeH = 46;
      const badgeX = W / 2 - badgeW / 2;
      const badgeY = 592;
      ctx.fillStyle = "#FF6B35";
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(badgeText, W / 2, badgeY + 31);

      // Completion date
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 20px Arial, sans-serif";
      ctx.fillText(`Completed: ${date}`, W / 2, 675);

      // Navy divider line
      ctx.fillStyle = "#2C3E50";
      ctx.fillRect(70, 726, W - 140, 3);

      // ── Signature area ──
      const sigLineY = 870;

      // Left: Mostafa Ali
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(180, sigLineY, 420, 2);
      ctx.textAlign = "left";
      ctx.fillStyle = "#1F2937";
      ctx.font = "700 20px Arial, sans-serif";
      ctx.fillText("Mostafa Ali", 180, sigLineY + 38);
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 16px Arial, sans-serif";
      ctx.fillText("Revenue Architect", 180, sigLineY + 62);
      ctx.fillText("Ops Solutions Group LLC", 180, sigLineY + 84);

      // Right: Completion Date
      ctx.fillStyle = "#FF6B35";
      ctx.fillRect(1400, sigLineY, 420, 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#1F2937";
      ctx.font = "700 20px Arial, sans-serif";
      ctx.fillText(date, 1820, sigLineY + 38);
      ctx.fillStyle = "#6B7280";
      ctx.font = "400 16px Arial, sans-serif";
      ctx.fillText("Completion Date", 1820, sigLineY + 62);

      // Center stamp
      const stampX = W / 2;
      const stampY = sigLineY + 20;
      const outerR = 88, innerR = 70;

      ctx.strokeStyle = "#FF6B35";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(stampX, stampY, outerR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(stampX, stampY, innerR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#FF6B35";
      ctx.font = "700 13px Arial, sans-serif";
      ctx.textAlign = "center";
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
      ctx.fillText("OPS SOLUTIONS", stampX, stampY - 10);
      ctx.fillText("CERTIFIED", stampX, stampY + 10);
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

      ctx.font = "bold 32px Arial, sans-serif";
      ctx.fillText("✓", stampX, stampY + 42);

      // Footer
      ctx.fillStyle = "#E5E7EB";
      ctx.fillRect(70, H - 58, W - 140, 1);
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "400 16px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Ops Solutions Group LLC  ·  Registered: Texas, United States  ·  opsolutionss.com",
        W / 2,
        H - 28
      );

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
    <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-6 text-center space-y-4 mb-6">
      <Award className="w-12 h-12 mx-auto" style={{ color: "hsl(160, 84%, 39%)" }} />
      <div>
        <h3 className="text-lg font-bold text-foreground">🎉 Congratulations!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You've completed all {totalCount} modules with an average score of{" "}
          <span className="font-semibold text-foreground">{averageScore}%</span>. Download your
          certificate below.
        </p>
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
