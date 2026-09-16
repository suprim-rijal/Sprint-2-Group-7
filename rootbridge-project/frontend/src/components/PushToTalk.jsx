import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Square } from "lucide-react";

// Speaking practice ("Echo Studio").
// Converted from storyteller-s-library. The original sent the recording to an
// AI transcription server. Sprint 2 has no server, so this version uses the
// browser's built-in SpeechRecognition (Chrome and Edge support it).
// If the browser has no speech recognition, the child says the word out loud
// and taps "I said it out loud". Speaking never blocks progress.

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Keep only Devanagari letters / only a-z letters, so we can compare fairly.
const onlyDevanagari = (text) => text.replace(/[^\u0900-\u097F]/g, "");
const onlyLatin = (text) => text.toLowerCase().replace(/[^a-z]/g, "");

// Edit distance: how many single-letter changes turn a into b.
function distance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
    }
  }
  return rows[a.length][b.length];
}

// A near match counts, so a small accent difference never blocks a right answer.
function isMatch(said, target) {
  const deva = onlyDevanagari(said);
  const wantDeva = onlyDevanagari(target.np);
  if (deva && wantDeva && (deva.includes(wantDeva) || distance(deva, wantDeva) <= 1)) return true;

  const latin = onlyLatin(said);
  const wantLatin = onlyLatin(target.rom);
  if (latin && wantLatin) {
    if (latin.includes(wantLatin)) return true;
    if (distance(latin, wantLatin) <= Math.max(1, Math.floor(wantLatin.length / 4))) return true;
  }
  return false;
}

const BARS = 12;

export default function PushToTalk({ target, onResult, allowMic = true }) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | match | miss
  const [heard, setHeard] = useState("");
  const [note, setNote] = useState("");
  const recognition = useRef(null);

  // Stop listening if the page changes.
  useEffect(() => () => recognition.current?.abort(), []);

  const start = () => {
    setNote("");
    setHeard("");
    setStatus("idle");
    if (!SpeechRecognition) {
      setNote("This browser cannot listen. Say the word out loud, then tap “I said it out loud”.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "ne-NP";
    rec.interimResults = false;
    rec.maxAlternatives = 5;

    rec.onresult = (event) => {
      // Check every guess the browser made, not only the first one.
      const guesses = Array.from(event.results[0]).map((alt) => alt.transcript);
      const matched = guesses.some((g) => isMatch(g, target));
      setHeard(guesses[0] || "");
      setStatus(matched ? "match" : "miss");
      onResult(matched);
    };
    rec.onerror = (event) => {
      setNote(
        event.error === "not-allowed"
          ? "Microphone access is off. That is fine. Say the word out loud, then tap “I said it out loud”."
          : "We could not hear a word that time. Try once more, closer to the microphone.",
      );
    };
    rec.onend = () => setListening(false);

    recognition.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => recognition.current?.stop();

  const message = listening
    ? "Listening. Say the word clearly."
    : status === "match"
      ? `That matched ${target.np}. Well said.`
      : status === "miss"
        ? `Not quite yet. We heard “${heard || "nothing clear"}”. Replay the model and try again.`
        : `Tap the button and say ${target.np} (${target.rom}).`;

  return (
    <div className="ln-card ln-mic">
      <div className="ln-row">
        {allowMic ? (
          <button
            type="button"
            className={`btn ${listening ? "btn-terracotta" : "btn-green"}`}
            onClick={listening ? stop : start}
            aria-pressed={listening}
          >
            {listening ? <Square size={18} /> : <Mic size={18} />}
            {listening ? "Stop listening" : `Say ${target.rom}`}
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            // Self-check: saying it aloud counts as practice.
            setStatus("match");
            onResult(true);
          }}
        >
          <MicOff size={16} />I said it out loud
        </button>
      </div>

      {!allowMic ? (
        <p className="ln-muted">The microphone is turned off. Say the word out loud, then tap the button.</p>
      ) : null}
      <div className="ln-meter" aria-hidden="true">
        {Array.from({ length: BARS }).map((_, i) => (
          <span
            key={i}
            className={listening ? "on" : ""}
            style={listening ? { height: `${12 + ((i * 7) % 24)}px` } : undefined}
          />
        ))}
      </div>

      <p className="ln-muted" aria-live="polite">
        {message}
      </p>
      {note ? <p className="ln-instructions">{note}</p> : null}
    </div>
  );
}
