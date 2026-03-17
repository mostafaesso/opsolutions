import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface ScaledSlideProps {
  children: ReactNode;
  dir?: "ltr" | "rtl";
}

export const ScaledSlide = ({ children, dir = "ltr" }: ScaledSlideProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    const scaleX = parent.clientWidth / 1920;
    const scaleY = parent.clientHeight / 1080;
    setScale(Math.min(scaleX, scaleY));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className="slide-content relative overflow-hidden"
      dir={dir}
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        flexShrink: 0,
        background: "rgb(18, 18, 18)",
      }}
    >
      {children}
    </div>
  );
};
