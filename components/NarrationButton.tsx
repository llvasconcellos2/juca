"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface NarrationButtonProps {
  text: string;
  choicesText: string;
}

// speechSynthesis support never changes at runtime, so there's nothing to subscribe to —
// this only exists to read a client-only value without a hydration mismatch.
function subscribe() {
  return () => {};
}

export default function NarrationButton({ text, choicesText }: NarrationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = useSyncExternalStore(
    subscribe,
    () => "speechSynthesis" in window,
    () => false
  );

  // Cancel any ongoing narration when this instance unmounts. The parent remounts this
  // component (via `key`) on scene change, so unmount = scene change.
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!supported) return null;

  function handleClick() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const sceneUtterance = new SpeechSynthesisUtterance(text);
    sceneUtterance.lang = "pt-BR";
    sceneUtterance.rate = 0.92;
    sceneUtterance.pitch = 1;

    const choicesUtterance = new SpeechSynthesisUtterance(choicesText);
    choicesUtterance.lang = "pt-BR";
    choicesUtterance.rate = 0.92;
    choicesUtterance.pitch = 1;
    choicesUtterance.onend = () => setSpeaking(false);
    choicesUtterance.onerror = () => setSpeaking(false);

    sceneUtterance.onend = () => {
      window.speechSynthesis.speak(choicesUtterance);
    };
    sceneUtterance.onerror = () => setSpeaking(false);

    utteranceRef.current = sceneUtterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(sceneUtterance);
    setSpeaking(true);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={speaking ? "Parar narração" : "Ouvir esta cena em voz alta"}
      className="
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
        border border-emerald-400/60 text-emerald-300
        hover:bg-emerald-400/10 focus-visible:outline-none
        focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
        focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer
        select-none
      "
    >
      <span aria-hidden="true">{speaking ? "⏹" : "▶"}</span>
      {speaking ? "Parar narração" : "Ouvir cena"}
    </button>
  );
}
