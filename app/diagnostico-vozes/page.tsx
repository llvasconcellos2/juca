"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// speechSynthesis support never changes at runtime, so there's nothing to subscribe to —
// this only exists to read a client-only value without a hydration mismatch.
function subscribe() {
  return () => {};
}

interface VoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  isPortuguese: boolean;
}

function toVoiceInfo(voice: SpeechSynthesisVoice): VoiceInfo {
  return {
    name: voice.name,
    lang: voice.lang,
    default: voice.default,
    isPortuguese: voice.lang.toLowerCase().startsWith("pt"),
  };
}

function TestButton({ voiceName }: { voiceName: string }) {
  function handleClick() {
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.name === voiceName);
    if (!voice) return;
    const utterance = new SpeechSynthesisUtterance(
      `Olá! Esta é a voz chamada ${voice.name}.`,
    );
    utterance.voice = voice;
    utterance.lang = voice.lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`Testar a voz ${voiceName}`}
      className="
        px-3 py-1.5 rounded-full text-xs font-medium
        border border-emerald-400/60 text-emerald-300
        hover:bg-emerald-400/10 focus-visible:outline-none
        focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
        focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer select-none
      "
    >
      ▶ Testar
    </button>
  );
}

function CopyButton({ voiceName }: { voiceName: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(voiceName);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem clipboard disponível — nada a fazer silenciosamente.
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={handleClick}
        aria-label={`Copiar o nome da voz ${voiceName}`}
        className="
          px-3 py-1.5 rounded-full text-xs font-medium
          border border-white/20 text-white/70
          hover:bg-white/10 focus-visible:outline-none
          focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer select-none
        "
      >
        Copiar nome
      </button>
      <span role="status" className="text-emerald-300 text-xs">
        {copied ? "Copiado!" : ""}
      </span>
    </span>
  );
}

export default function DiagnosticoVozesPage() {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const supported = useSyncExternalStore(
    subscribe,
    () => "speechSynthesis" in window,
    () => false,
  );

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices().map(toVoiceInfo));
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [supported]);

  const sortedVoices = [...voices].sort((a, b) => {
    if (a.isPortuguese !== b.isPortuguese) return a.isPortuguese ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-emerald-300 mb-2">
          Diagnóstico de vozes de narração
        </h1>
        <p className="text-white/60 text-sm mb-6">
          Ferramenta de diagnóstico, fora do jogo, para identificar o nome exato
          de uma voz instalada neste aparelho/navegador. Toque em
          &ldquo;Testar&rdquo; para ouvir cada voz e em &ldquo;Copiar
          nome&rdquo; para pegar o nome exato de quem soar melhor. As vozes em
          português aparecem primeiro.
        </p>

        {!supported && (
          <p className="text-red-300">
            Este navegador não tem suporte a leitura em voz alta
            (speechSynthesis).
          </p>
        )}

        {supported && sortedVoices.length === 0 && (
          <p className="text-white/50">
            Nenhuma voz encontrada ainda. Se a lista continuar vazia, este
            navegador pode não ter nenhum motor de texto-em-voz instalado.
          </p>
        )}

        <ul className="space-y-3 list-none p-0">
          {sortedVoices.map((voice) => (
            <li
              key={voice.name}
              className="
                bg-white/5 border border-white/10 rounded-xl p-4
                flex flex-wrap items-center justify-between gap-3
              "
            >
              <div>
                <p className="font-medium text-white">
                  {voice.name}
                  {voice.default && (
                    <span className="ml-2 text-xs text-amber-300">
                      (padrão do sistema)
                    </span>
                  )}
                </p>
                <p className="text-white/50 text-xs">{voice.lang}</p>
              </div>
              <div className="flex items-center gap-2">
                <TestButton voiceName={voice.name} />
                <CopyButton voiceName={voice.name} />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
