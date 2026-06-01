"use client";

import { useEffect, useRef, useState } from "react";

interface NarrationButtonProps {
  text: string;
  choicesText: string;
  nodeId: string;
}

export default function NarrationButton({ text, choicesText, nodeId }: NarrationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Stop narration when the scene changes
  useEffect(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

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
