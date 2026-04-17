import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, Trophy } from "lucide-react";
import { quizData } from "@/lib/quizData";

interface QuizProps {
  topicId: string;
  onPass: (score: number) => Promise<void>;
  onNext?: () => void;
}

const PASS_COUNT = 3;
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

const Quiz = ({ topicId, onPass, onNext }: QuizProps) => {
  const questions = quizData[topicId];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"question" | "result">("question");
  const [saving, setSaving] = useState(false);
  const [passed, setPassed] = useState(false);

  if (!questions || questions.length === 0) return null;

  const question = questions[current];
  const total = questions.length;
  const isLast = current === total - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newCorrect = correctCount + (selected === question.correctIndex ? 1 : 0);
    if (isLast) {
      const score = Math.round((newCorrect / total) * 100);
      const didPass = newCorrect >= PASS_COUNT;
      setPassed(didPass);
      setCorrectCount(newCorrect);
      setPhase("result");
      if (didPass) {
        setSaving(true);
        onPass(score).finally(() => setSaving(false));
      }
    } else {
      setCorrectCount(newCorrect);
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase("question");
    setPassed(false);
  };

  if (phase === "result") {
    const finalCorrect = correctCount;
    const score = Math.round((finalCorrect / total) * 100);

    return (
      <div className={`rounded-2xl border p-8 text-center space-y-4 ${
        passed
          ? "border-green-200 bg-green-50/60"
          : "border-destructive/20 bg-destructive/5"
      }`}>
        {passed ? (
          <>
            <Trophy className="w-10 h-10 text-green-600 mx-auto" />
            <h3 className="text-xl font-bold text-green-800">Quiz Passed!</h3>
            <p className="text-green-700 text-sm">
              You scored <strong>{finalCorrect}/{total}</strong> ({score}%) — module complete.
            </p>
            <div className="pt-2">
              {onNext ? (
                <button
                  onClick={onNext}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  Next Module <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Back to Overview
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-10 h-10 text-destructive mx-auto" />
            <h3 className="text-xl font-bold text-foreground">Not quite</h3>
            <p className="text-muted-foreground text-sm">
              You scored <strong>{finalCorrect}/{total}</strong> ({score}%) — you need {PASS_COUNT}/{total} to pass.
            </p>
            <div className="pt-2">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Module Quiz
        </span>
        <span className="text-xs text-muted-foreground">
          Question {current + 1} of {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((current) / total) * 100}%` }}
        />
      </div>

      <p className="text-base font-semibold text-foreground">{question.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          let style =
            "rounded-xl border border-border bg-background p-4 text-left text-sm text-foreground transition-all cursor-pointer hover:border-primary/40 hover:bg-secondary/50";

          if (selected !== null) {
            if (idx === question.correctIndex) {
              style =
                "rounded-xl border-2 border-green-500 bg-green-50 p-4 text-left text-sm text-green-800 font-medium cursor-default";
            } else if (idx === selected && selected !== question.correctIndex) {
              style =
                "rounded-xl border-2 border-destructive bg-destructive/5 p-4 text-left text-sm text-destructive font-medium cursor-default";
            } else {
              style =
                "rounded-xl border border-border bg-background p-4 text-left text-sm text-muted-foreground cursor-default opacity-60";
            }
          }

          return (
            <button key={idx} className={style} onClick={() => handleSelect(idx)}>
              <span className="inline-flex items-center gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
                  {OPTION_LABELS[idx]}
                </span>
                {option}
                {selected !== null && idx === question.correctIndex && (
                  <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto shrink-0" />
                )}
                {selected !== null && idx === selected && selected !== question.correctIndex && (
                  <XCircle className="w-4 h-4 text-destructive ml-auto shrink-0" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {isLast ? "See Results" : "Next Question"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
