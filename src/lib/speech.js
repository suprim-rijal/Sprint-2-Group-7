// Text-to-speech using the browser's built-in voices (Web Speech API).
// Converted from storyteller-s-library. The Lovable AI voice was removed
// because it needs a server. Order we try:
//   1. a Nepali voice
//   2. a Hindi / Marathi / Bengali voice (same Devanagari script, close enough)
//   3. read the English fallback text aloud
//   4. tell the page that sound is unavailable

let cachedVoices = [];

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function loadVoices() {
  if (!speechSupported()) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length) {
    cachedVoices = now;
    return Promise.resolve(now);
  }
  // Some browsers load voices a moment after the page opens.
  return new Promise((resolve) => {
    const done = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 1200);
  });
}

function pickVoice(lang, voices) {
  const wanted = lang.toLowerCase();
  const order = wanted.startsWith("ne") ? ["ne", "hi", "mr", "bn"] : [wanted.slice(0, 2), "en"];
  for (const prefix of order) {
    const match = voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
    if (match) return match;
  }
  return null;
}

export async function speak(text, options = {}) {
  const { lang = "ne-NP", rate = 0.9, onStart, onEnd, onUnavailable } = options;
  if (!speechSupported() || !text.trim()) {
    onUnavailable?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = await loadVoices();
  const voice = pickVoice(lang, voices);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? lang;
  if (voice) utterance.voice = voice;
  utterance.rate = rate;

  let started = false;
  utterance.onstart = () => {
    started = true;
    onStart?.();
  };
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => {
    onEnd?.();
    if (!started) onUnavailable?.();
  };
  if (synth.paused) synth.resume();
  synth.speak(utterance);
  window.setTimeout(() => {
    if (!started && !synth.speaking) onUnavailable?.();
  }, 1500);
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

async function hasDevanagariVoice() {
  const voices = await loadVoices();
  return voices.some((v) => /^(ne|hi|mr|bn)/i.test(v.lang.replace("_", "-")));
}

// Say a Nepali word. Falls back to English if the device has no Devanagari voice.
export async function speakWord(text, options = {}) {
  const { englishFallback, ...rest } = options;
  if (!text.trim()) {
    rest.onUnavailable?.();
    return;
  }
  stopSpeaking();
  if (await hasDevanagariVoice()) {
    await speak(text, rest);
    return;
  }
  if (englishFallback) {
    await speak(englishFallback, { ...rest, lang: "en-US" });
    return;
  }
  rest.onUnavailable?.();
}
