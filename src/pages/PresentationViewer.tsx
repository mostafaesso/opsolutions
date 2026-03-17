import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Globe, House } from "lucide-react";
import { ScaledSlide } from "@/components/ScaledSlide";
import { DeckData } from "@/data/types";
import { storyDeck } from "@/data/storyDeck";
import { enterpriseDeck } from "@/data/enterpriseDeck";
import { smbDeck } from "@/data/smbDeck";
import { microDeck } from "@/data/microDeck";

const decks: Record<string, DeckData> = {
  story: storyDeck,
  enterprise: enterpriseDeck,
  smb: smbDeck,
  micro: microDeck,
};

const PresentationViewer = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const deck = deckId ? decks[deckId] : null;
  const totalSlides = deck?.slides.length ?? 0;

  const goNext = useCallback(() => {
    setCurrentSlide((s) => Math.min(s + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, navigate]);

  if (!deck) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Deck not found</p>
      </div>
    );
  }

  const slide = deck.slides[currentSlide];

  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col" style={{ background: "rgb(10,10,10)" }}>
      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <ScaledSlide dir={lang === "ar" ? "rtl" : "ltr"}>
          {lang === "ar" && slide.contentAr ? slide.contentAr : slide.content}
        </ScaledSlide>

        {/* Navigation arrows */}
        {currentSlide > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 transition-all opacity-70 hover:opacity-100 z-10"
            style={{
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}
        {currentSlide < totalSlides - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 transition-all opacity-70 hover:opacity-100 z-10"
            style={{
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="h-12 flex items-center justify-between px-6 shrink-0"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: "#fff" }}>
            {currentSlide + 1} / {totalSlides}
          </span>
          <div className="flex items-center gap-1">
            {deck.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="transition-all"
                style={{
                  width: i === currentSlide ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === currentSlide ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
          >
            <Globe className="w-4 h-4" />
            {lang === "en" ? "AR" : "EN"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
          >
            <House className="w-4 h-4" />
            Decks
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;
