"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface NarrationButtonProps {
  text: string;
  choicesText: string;
  rate: number;
  onRateChange: (rate: number) => void;
  // Se true, esta instância (uma nova cena, via remount por `key`) já entra narrando sozinha —
  // usado para continuar a narração automaticamente depois que o jogador já a ativou antes.
  autoPlay: boolean;
  // Avisa o StoryEngine que a narração foi ativada pela primeira vez, para que as próximas
  // cenas herdem `autoPlay`.
  onActivate: () => void;
}

type NarrationStatus = "idle" | "playing" | "paused";
type NarrationSegment = "scene" | "choices";

// Multiplicadores de velocidade disponíveis, ciclados a cada toque (padrão "botão de
// velocidade" tipo WhatsApp/player de vídeo). 1× é o ritmo padrão do projeto (ver BASE_RATE).
const RATE_STEPS = [0.75, 1, 1.5, 2, 3, 4];

// Ritmo "normal" (1×) de leitura em pt-BR — um pouco mais lento que o rate nativo (1.0) do
// navegador para soar mais claro. Os multiplicadores de RATE_STEPS partem daqui.
const BASE_RATE = 0.92;

function formatRate(rate: number) {
  return `${rate}`.replace(".", ",") + "×";
}

// speechSynthesis support never changes at runtime, so there's nothing to subscribe to —
// this only exists to read a client-only value without a hydration mismatch.
function subscribe() {
  return () => {};
}

// Ordem de preferência por nome, para escolher a mesma voz pt-BR de forma consistente no
// mesmo aparelho (motores diferentes por fabricante nomeiam suas vozes de formas diferentes).
// A Web Speech API não expõe gênero da voz, então isso é melhor esforço: não força uma voz
// masculina em aparelhos cuja única voz pt-BR instalada é feminina.
const PREFERRED_VOICE_NAMES = [
  "Google português do Brasil",
  "Microsoft Antonio Online (Natural) - Portuguese (Brazil)",
  "Luciana",
];

function pickNarrationVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const ptVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("pt"),
  );
  if (ptVoices.length === 0) return null;

  const ptBrVoices = ptVoices.filter(
    (voice) => voice.lang.toLowerCase() === "pt-br",
  );
  const candidates = ptBrVoices.length > 0 ? ptBrVoices : ptVoices;

  for (const preferredName of PREFERRED_VOICE_NAMES) {
    const match = candidates.find((voice) => voice.name === preferredName);
    if (match) return match;
  }

  return candidates[0];
}

export default function NarrationButton({
  text,
  choicesText,
  rate,
  onRateChange,
  autoPlay,
  onActivate,
}: NarrationButtonProps) {
  const [status, setStatus] = useState<NarrationStatus>("idle");
  // cancel() dispara o onerror da fala anterior de forma assíncrona — sem essa guarda, esse
  // callback tardio pode sobrescrever o estado que o speak() seguinte acabou de setar
  // (ex.: trocar a velocidade no meio da fala fazia o botão "voltar" a mostrar "Ouvir cena"
  // mesmo com a narração continuando). Só a chamada mais recente pode atualizar o status.
  const sessionRef = useRef(0);
  // Posição aproximada de leitura, atualizada a cada boundary (palavra) do
  // SpeechSynthesisUtterance em andamento — permite retomar do mesmo ponto ao trocar a
  // velocidade, em vez de reiniciar do zero. Sem suporte a onboundary (ex.: Safari), fica em
  // 0 e a troca de velocidade reinicia a partir do começo do segmento atual.
  const segmentRef = useRef<NarrationSegment>("scene");
  const charIndexRef = useRef(0);
  // Voz pt-BR escolhida, cacheada para não reprocessar a lista a cada fala.
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const supported = useSyncExternalStore(
    subscribe,
    () => "speechSynthesis" in window,
    () => false,
  );

  // Aquece o motor de TTS e resolve a voz assim que possível, em vez de só no primeiro clique —
  // no Chrome/Android a lista de vozes carrega de forma assíncrona (evento `voiceschanged`) e
  // acionar isso cedo evita que a primeira fala do usuário fique esperando o motor "acordar".
  useEffect(() => {
    if (!supported) return;
    const resolveVoice = () => {
      voiceRef.current = pickNarrationVoice(window.speechSynthesis.getVoices());
    };
    resolveVoice();
    window.speechSynthesis.addEventListener("voiceschanged", resolveVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", resolveVoice);
    };
  }, [supported]);

  // Cancel any ongoing narration when this instance unmounts. The parent remounts this
  // component (via `key`) on scene change, so unmount = scene change.
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Continua a narração sozinha ao entrar numa cena nova, se o jogador já a ativou antes.
  // Roda uma vez no mount desta instância (cada cena é uma instância nova, via `key`).
  useEffect(() => {
    if (autoPlay && supported) {
      speakFrom("scene", 0, rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supported) return null;

  // Fala o texto do `segment` a partir de `startOffset` (índice de caractere), à velocidade
  // `speedMultiplier`. Usado tanto para começar do zero (startOffset 0) quanto para retomar de
  // onde a leitura estava ao trocar a velocidade.
  function speakFrom(
    segment: NarrationSegment,
    startOffset: number,
    speedMultiplier: number,
  ) {
    const session = ++sessionRef.current;
    segmentRef.current = segment;
    charIndexRef.current = startOffset;

    const sourceText = segment === "scene" ? text : choicesText;
    const utterance = new SpeechSynthesisUtterance(
      sourceText.slice(startOffset),
    );
    utterance.lang = "pt-BR";
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = BASE_RATE * speedMultiplier;
    utterance.pitch = 1;
    utterance.onboundary = (event) => {
      if (sessionRef.current !== session) return;
      segmentRef.current = segment;
      charIndexRef.current = startOffset + event.charIndex;
    };
    utterance.onerror = () => {
      if (sessionRef.current === session) setStatus("idle");
    };
    utterance.onend = () => {
      if (sessionRef.current !== session) return;
      if (segment === "scene") {
        speakFrom("choices", 0, speedMultiplier);
      } else {
        setStatus("idle");
      }
    };

    // cancel() antes de speak() é necessário para interromper uma fala em andamento, mas
    // chamá-lo sem necessidade (ex.: primeiro clique, nada tocando) é o gatilho conhecido de um
    // atraso de vários segundos no motor de TTS do Chrome/Android — por isso só cancela quando
    // realmente há algo a cancelar.
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    window.speechSynthesis.speak(utterance);
    setStatus("playing");
  }

  function handlePlayClick() {
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }
    onActivate();
    speakFrom("scene", 0, rate);
  }

  function handleRestartClick() {
    if (status === "idle") return;
    speakFrom("scene", 0, rate);
  }

  function handleRateClick() {
    const nextRate =
      RATE_STEPS[(RATE_STEPS.indexOf(rate) + 1) % RATE_STEPS.length];
    onRateChange(nextRate);
    // A Web Speech API não permite mudar o rate de uma fala em andamento, então cancela e
    // recomeça — mas a partir da última palavra ouvida (charIndexRef), não do começo, para
    // soar como "continuar na nova velocidade" e não como reiniciar a cena.
    if (status !== "idle") {
      speakFrom(segmentRef.current, charIndexRef.current, nextRate);
    }
  }

  const rateLabel = formatRate(rate);
  const playLabel =
    status === "playing"
      ? "Pausar narração"
      : status === "paused"
        ? "Continuar narração"
        : "Ouvir cena";
  const playAriaLabel =
    status === "playing"
      ? "Pausar narração"
      : status === "paused"
        ? "Continuar narração"
        : "Ouvir esta cena em voz alta";
  const playIcon = status === "playing" ? "⏸" : "▶";

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={handleRestartClick}
        disabled={status === "idle"}
        aria-label="Reiniciar narração desta cena"
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          border border-emerald-400/60 text-emerald-300
          hover:bg-emerald-400/10 focus-visible:outline-none
          focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer
          select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
        "
      >
        <span aria-hidden="true">⏮</span>
        Reiniciar
      </button>
      <button
        onClick={handlePlayClick}
        aria-label={playAriaLabel}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          border border-emerald-400/60 text-emerald-300
          hover:bg-emerald-400/10 focus-visible:outline-none
          focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer
          select-none
        "
      >
        <span aria-hidden="true">{playIcon}</span>
        {playLabel}
      </button>
      <button
        onClick={handleRateClick}
        aria-label={`Velocidade da narração: ${rateLabel}. Toque para mudar a velocidade.`}
        className="
          inline-flex items-center justify-center min-w-[5rem] px-4 py-2 rounded-full
          text-sm font-semibold tabular-nums text-center
          border border-emerald-400/60 text-emerald-300
          hover:bg-emerald-400/10 focus-visible:outline-none
          focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer
          select-none
        "
      >
        {rateLabel}
      </button>
      <span role="status" className="sr-only">
        {`Velocidade da narração: ${rateLabel}`}
      </span>
    </span>
  );
}
