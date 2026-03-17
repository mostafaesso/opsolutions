import { ReactNode } from "react";

export interface SlideData {
  id: string;
  content: ReactNode;
  contentAr?: ReactNode;
}

export interface DeckData {
  id: string;
  title: string;
  slides: SlideData[];
}
