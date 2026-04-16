import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { quizData } from "@/lib/quizData";

interface QuizProps {
  topicId: string;
  nextTopicPath: string | null;
  onFinish: (score: number, total: number, passed: boolean) => void;
}

const Quiz = ({ topicId, nextTopicPath, onFinish }: QuizProps) => {
  const navigate = useNavigate();
  const questions = quizData[topicId] || [];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (!questions.length) return null;

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLast) {
      const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
      const passed = score / questions.length >= 0.6;
      setResult({ score, passed });
      onFinish(score, questions.length, passed);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setResult(null);
  };

  if (result) {
    const pct = Math.round((result.score / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6">
        {result.passed ? (
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
        ) : (
          <XCircle className="w-16 h-16 mx-auto text-destructive" />
        )}
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            {result.passed ? "Quiz Passed!" : "Not quite there"}
          </h3>
          <p className="text-muted-foreground mt-1">
            You scored{" "}
            <span className="font-semibold text-foreground">
              {result.score}/{questions.length}
            </span>{" "}
            ({pct}%){result.passed ? " — module completed!" : " — you need 60% to pass."}
          </p>
        </div>
        {result.passed ? (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {nextTopicPath && (
              <button
                onClick={() => navigate(nextTopicPath)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Continue to Next Module <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border bg-primary/5 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Module Quiz</span>
        <span className="text-xs text-muted-foreground">
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-base font-semibold text-foreground">{question.question}</p>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let cls =
              "border-border bg-background hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
            if (selected !== null) {
              if (idx === question.correctIndex) {
                cls = "border-green-400 bg-green-50 text-green-800 cursor-default";
              } else if (idx === selected) {
                cls = "border-destructive/50 bg-destructive/5 text-destructive cursor-default";
              } else {
                cls = "border-border bg-background opacity-40 cursor-default";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full text-left px-5 py-3 rounded-xl border text-sm transition-all ${cls}`}
              >
                <span className="font-semibold mr-2 text-muted-foreground">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isLast ? "See Results" : "Next Question"}{" "}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
