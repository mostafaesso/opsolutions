import { Video, ExternalLink } from "lucide-react";
import { useCompanyVideos } from "@/hooks/useCompanyVideos";

interface VideoTrainingProps {
  companySlug: string;
}

const toEmbed = (url: string): string | null => {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // Loom
    if (u.hostname.includes("loom.com") && u.pathname.startsWith("/share/")) {
      return url.replace("/share/", "/embed/");
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
};

const VideoTraining = ({ companySlug }: VideoTrainingProps) => {
  const { videos, loading } = useCompanyVideos(companySlug);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading videos…</p>;
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Video className="w-8 h-8" />
        <p className="text-sm font-medium">No video training added yet</p>
        <p className="text-xs">Your Ops Solutions admin will add training videos here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {videos.map((v) => {
        const embed = toEmbed(v.url);
        return (
          <div
            key={v.id}
            className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
          >
            {embed ? (
              <div className="aspect-video bg-muted">
                <iframe
                  src={embed}
                  title={v.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-video bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
              >
                <ExternalLink className="w-6 h-6 text-muted-foreground" />
              </a>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground">{v.title}</h3>
              {v.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {v.description}
                </p>
              )}
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open original <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VideoTraining;
