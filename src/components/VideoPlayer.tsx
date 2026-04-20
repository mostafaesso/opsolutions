import { useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  userId: string;
  isCompleted: boolean;
  onComplete: () => void;
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let vid = "";
      if (u.hostname.includes("youtu.be")) {
        vid = u.pathname.slice(1);
      } else if (u.pathname.includes("/embed/")) {
        return url;
      } else {
        vid = u.searchParams.get("v") || "";
      }
      return vid ? `https://www.youtube.com/embed/${vid}?rel=0` : null;
    }

    // Loom
    if (u.hostname.includes("loom.com")) {
      const parts = u.pathname.split("/");
      const shareIdx = parts.indexOf("share");
      const embedIdx = parts.indexOf("embed");
      const id = shareIdx !== -1 ? parts[shareIdx + 1] : embedIdx !== -1 ? parts[embedIdx + 1] : "";
      return id ? `https://www.loom.com/embed/${id}` : null;
    }

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop() || "";
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    // Already an embed URL
    if (url.includes("/embed/")) return url;

    return null;
  } catch {
    return null;
  }
}

const VideoPlayer = ({
  videoId,
  title,
  description,
  videoUrl,
  userId,
  isCompleted,
  onComplete,
}: VideoPlayerProps) => {
  const [marking, setMarking] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);

  const markComplete = async () => {
    if (isCompleted || marking) return;
    setMarking(true);
    try {
      const { error } = await supabase.from("video_completions").insert({
        user_id: userId,
        video_id: videoId,
      } as any);
      if (error && !error.message.includes("duplicate")) throw error;
      onComplete();
      toast({ title: "Video marked as complete!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>

      {/* 16:9 video container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-border bg-black" style={{ paddingTop: "56.25%" }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60">
            <PlayCircle className="w-12 h-12" />
            <p className="text-sm">Unable to embed this video URL.</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline text-primary"
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>

      {/* Completion trigger */}
      <div className="flex items-center gap-3 pt-1">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Completed
          </div>
        ) : (
          <button
            onClick={markComplete}
            disabled={marking}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            {marking ? "Saving..." : "Mark as Complete"}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
