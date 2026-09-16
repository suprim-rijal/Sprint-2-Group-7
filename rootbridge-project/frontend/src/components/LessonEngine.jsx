import { useEffect, useState } from "react";
import { AudioLines, Keyboard, Lightbulb, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import PushToTalk from "./PushToTalk.jsx";
import { speakWord, stopSpeaking } from "../lib/speech.js";

// Plays a list of exercises one step at a time.
// Converted from storyteller-s-library (TypeScript + Tailwind -> JSX + Elearn CSS).
//
// Props:
//   exercises     array from buildLesson() or buildTest() in lib/exercises.js
//   romanization  show latin spelling under Nepali words
//   quiet         quest mode: do not reveal right/wrong colours
//   reducedMotion slower speech
//   onFinish      called with { flowers, hintsUsed, scores } after the last step
//
// Exercise kinds: "hear-find", "meaning", "match", "matra" (choose a card),
// "typing" (type the word), "echo" (say the word).

const emptyScores = { accuracy: 0, independence: 0, matraPlacement: 0, strokeOrder: 0, retries: 0 };

//   allowMic      false = a parent turned the microphone off

export default function LessonEngine({
  exercises,
  romanization = true,
  quiet = false,
  reducedMotion = false,
  allowMic = true,
  onFinish,
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null); // index of the chosen card
  const [typed, setTyped] = useState("");
  const [echoDone, setEchoDone] = useState(false);
  const [echoTries, setEchoTries] = useState(0);
  const [hint, setHint] = useState(0); // 0 = no hint open, 1-4 = hint level
  const [flowers, setFlowers] = useState(0); // one flower per solved step
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioNote, setAudioNote] = useState("");
  const [scores, setScores] = useState(emptyScores);
  const [solved, setSolved] = useState(() => exercises.map(() => false));

  const ex = exercises[step];

  // Stop any speech when leaving the page.
  useEffect(() => () => stopSpeaking(), []);

  // Keyboard: number keys 1-4 pick a card.
  useEffect(() => {
    const onKey = (event) => {
      if (!ex || ex.kind === "typing" || ex.kind === "echo") return;
      if (event.target instanceof HTMLInputElement) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < ex.options.length) pick(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!ex) return <p className="ln-muted">This lesson has no practice steps yet.</p>;

  const chosen = selected === null ? null : ex.options[selected];
  const isCorrect =
    ex.kind === "typing" ? typed.trim() === ex.target.np : ex.kind === "echo" ? echoDone : chosen?.np === ex.target.np;
  const isLast = step === exercises.length - 1;
  // For listening tasks we hide the word, so the child has to use their ears.
  const listening = ex.kind === "hear-find" || ex.kind === "typing";

  // ----- audio -----
  const speak = (text = ex.target.np, lang = "ne-NP") => {
    setAudioNote("");
    speakWord(text, {
      lang,
      englishFallback: lang === "ne-NP" ? `${ex.target.rom}. It means ${ex.target.en}.` : text,
      rate: reducedMotion ? 0.75 : Math.max(0.65, 0.9 - hint * 0.06),
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
      onUnavailable: () => {
        setPlaying(false);
        setAudioNote("This device cannot play sound right now. Read the word and its spelling instead.");
      },
    });
  };
  const stop = () => {
    stopSpeaking();
    setPlaying(false);
  };

  // ----- scoring -----
  const markSolved = () => {
    if (solved[step]) return; // only count each step once
    setFlowers((f) => f + 1);
    setSolved((list) => list.map((value, i) => (i === step ? true : value)));
    setScores((s) => ({
      ...s,
      accuracy: s.accuracy + 1,
      independence: s.independence + (hint === 0 ? 1 : 0),
      matraPlacement: s.matraPlacement + (ex.dimensions.includes("matraPlacement") ? 1 : 0),
      strokeOrder: s.strokeOrder + (ex.dimensions.includes("strokeOrder") ? 1 : 0),
    }));
  };
  const addRetry = () => setScores((s) => ({ ...s, retries: s.retries + 1 }));

  // ----- answering -----
  function pick(index) {
    setSelected(index);
    setAttempts((n) => n + 1);
    if (ex.options[index]?.np === ex.target.np) markSolved();
    else addRetry();
  }
  const submitTyped = () => {
    setAttempts((n) => n + 1);
    if (typed.trim() === ex.target.np) markSolved();
    else addRetry();
  };
  const onSpoken = (matched) => {
    setEchoTries((n) => n + 1);
    setAttempts((n) => n + 1);
    if (matched) {
      setEchoDone(true);
      markSolved();
    } else addRetry();
  };

  const next = () => {
    if (isLast) {
      onFinish({ flowers, hintsUsed, scores });
      return;
    }
    stop();
    setStep((n) => n + 1);
    setSelected(null);
    setTyped("");
    setEchoDone(false);
    setEchoTries(0);
    setHint(0);
    setAttempts(0);
  };

  const hintText = [
    "Replay the model and listen for the first sound.",
    `Look closely at: ${ex.options
      .slice(0, 2)
      .map((o) => o.np)
      .join(" / ")}`,
    `The word sounds like “${ex.target.rom}”.`,
    `Model answer: ${ex.target.np}, ${ex.target.rom}, ${ex.target.en}.`,
  ];

  // Colour for a choice card after it was picked.
  const optionClass = (index, option) => {
    if (selected !== index) return "ln-option";
    if (quiet) return "ln-option picked";
    return option.np === ex.target.np ? "ln-option right" : "ln-option wrong";
  };

  return (
    <div>
      {/* Progress dots + flower counter */}
      <div className="ln-row">
        <span className="ln-steps" aria-label={`Step ${step + 1} of ${exercises.length}`}>
          {exercises.map((_, i) => (
            <span key={i} className={i < step ? "past" : i === step ? "now" : ""} />
          ))}
        </span>
        <span className="ln-badge gold">{flowers} ✿ flowers</span>
        <span className="ln-badge track">{ex.mechanic}</span>
      </div>

      <p className="ln-instructions">
        <Keyboard size={17} aria-hidden="true" />
        {ex.instructions_text}
      </p>
      <h2 className="ln-prompt">{ex.prompt}</h2>

      {/* Show the word, except in listening tasks */}
      {!listening ? (
        <div className="ln-card bold ln-big-word">
          <span lang="ne">{ex.target.np}</span>
          {romanization ? <span className="ln-muted">{ex.target.rom}</span> : null}
        </div>
      ) : null}

      {/* Audio controls */}
      <div className="ln-row" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-green btn-sm" onClick={() => speak()}>
          <AudioLines size={17} />
          Replay word
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={playing ? stop : () => speak(ex.instructions_audio, "en-US")}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Pause" : "Instructions"}
        </button>
        <span className="ln-muted" aria-live="polite">
          {playing ? "Audio is playing" : ""}
        </span>
      </div>
      {audioNote ? (
        <p className="ln-instructions">
          {audioNote}
          {listening ? ` The word is ${ex.target.np} (${ex.target.rom}).` : ""}
        </p>
      ) : null}

      {/* Answer area: typing, speaking, or choice cards */}
      {ex.kind === "typing" ? (
        <div className="ln-type-row">
          <input
            lang="ne"
            className="ln-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitTyped()}
            aria-label="Type your answer"
            placeholder="Type in Nepali"
          />
          <button type="button" className="btn btn-track" onClick={submitTyped}>
            Check
          </button>
        </div>
      ) : ex.kind === "echo" ? (
        <div>
          <PushToTalk key={ex.id} target={ex.target} onResult={onSpoken} allowMic={allowMic} />
          {!echoDone && echoTries >= 3 ? (
            <div className="ln-row" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={next}>
                Move on for now
              </button>
              <span className="ln-muted">You can come back to this word later.</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="ln-options">
          {ex.options.map((option, i) => (
            <div key={option.np + i} className={optionClass(i, option)}>
              <button type="button" className="ln-option-main" onClick={() => pick(i)}>
                <span className="num">{i + 1}</span>
                <span className="word" lang={ex.show === "np" ? "ne" : undefined}>
                  {ex.show === "np" ? option.np : option.en}
                </span>
                {romanization && ex.show === "np" ? <small>{option.rom}</small> : null}
              </button>
              <button
                type="button"
                className="ln-icon-btn"
                aria-label={`Hear option ${i + 1}`}
                onClick={() => speak(option.np)}
              >
                <Volume2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hints and retry */}
      <div className="ln-row" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setHint((h) => Math.min(h + 1, 4));
            setHintsUsed((h) => h + 1);
          }}
        >
          <Lightbulb size={16} />
          Hint {Math.min(hint + 1, 4)}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setSelected(null);
            setTyped("");
            setEchoDone(false);
          }}
        >
          <RotateCcw size={16} />
          Try again
        </button>
        <span className="ln-muted">Unlimited tries. Hints never cost anything.</span>
      </div>
      {hint > 0 ? (
        <div className="ln-card" style={{ marginTop: 14, background: "var(--bg)" }}>
          <b>Hint {hint}</b>
          <p className="ln-muted" style={{ margin: "4px 0 0" }}>
            {hintText[hint - 1]}
          </p>
        </div>
      ) : null}

      {/* Feedback */}
      <div className="ln-feedback" aria-live="polite">
        {isCorrect ? (
          <div className="ln-card success">
            <p>{quiet ? "Answer saved." : `Shabash! ${ex.target.np} means ${ex.target.en}.`}</p>
            <button type="button" className="btn btn-green btn-sm" onClick={next}>
              {isLast ? "Finish" : "Next step"}
            </button>
          </div>
        ) : attempts > 0 ? (
          <div className="ln-card warn">
            <p>Not yet. Replay the model or open a hint, then try again.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
