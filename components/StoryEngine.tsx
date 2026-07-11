"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Effect, Story, StoryVariables } from "@/lib/types";
import { applyEffects, evaluateCondition } from "@/lib/engine";
import SceneView from "./SceneView";
import ChoiceButton from "./ChoiceButton";
import NarrationButton from "./NarrationButton";
import ShareButton from "./ShareButton";
import Hud from "./Hud";

interface StoryEngineProps {
  story: Story;
}

export default function StoryEngine({ story }: StoryEngineProps) {
  const s = story.content;
  const storyUrl = `/historias/${story.slug}`;

  const computeInitialVars = useCallback(
    (): StoryVariables =>
      applyEffects(s.variables ?? {}, s.nodes[s.start]?.onEnter),
    [s.variables, s.nodes, s.start],
  );

  const [currentId, setCurrentId] = useState<string>(s.start);
  const [vars, setVars] = useState<StoryVariables>(computeInitialVars);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(true);
  // Velocidade da narração (multiplicador). Fica no motor, não no NarrationButton, para
  // persistir entre trocas de cena (o NarrationButton é remontado via `key` a cada cena).
  const [narrationRate, setNarrationRate] = useState(1);
  // Uma vez que o jogador aciona "Ouvir cena", a narração passa a continuar sozinha nas
  // próximas cenas (cada uma é uma instância nova de NarrationButton, via `key`).
  const [narrationActivated, setNarrationActivated] = useState(false);

  const node = s.nodes[currentId];
  const sceneLabel = node.label ?? "Cena";

  const visibleChoices = node.choices.filter(
    (choice) => !choice.condition || evaluateCondition(vars, choice.condition),
  );

  // Com uma única escolha (ex.: "Continuar"), não há decisão real — a pergunta
  // ("O que Juca faz?") é omitida tanto na interface quanto na narração.
  const hasSingleChoice = visibleChoices.length === 1;

  const choicesText = node.isEnding
    ? "Fim da história! Para jogar novamente, pressione o botão Jogar novamente."
    : hasSingleChoice
      ? `${visibleChoices[0].label}.`
      : `${s.choicesPrompt} ${visibleChoices.map((c, i) => `Opção ${i + 1}: ${c.label}`).join(". ")}.`;

  // Narração da cena: label (rótulo de acessibilidade), depois o alt da imagem (se houver),
  // depois o texto — na mesma ordem de leitura visual do SceneView (label > imagem > texto).
  const sceneNarrationText = [
    sceneLabel,
    node.image ? node.imageAlt : null,
    node.text,
  ]
    .filter((part): part is string => Boolean(part))
    .join(". ");

  // Pré-carrega a imagem dos próximos nós possíveis para evitar "flash" ao navegar.
  // React 19 hoisteia <link> renderizado em qualquer ponto da árvore para o <head>.
  const nextImages = Array.from(
    new Set(
      visibleChoices
        .map((choice) => s.nodes[choice.target]?.image)
        .filter((src): src is string => Boolean(src)),
    ),
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentId]);

  const goTo = useCallback(
    (targetId: string, effects?: Effect[]) => {
      setVisible(false);
      setTimeout(() => {
        setVars((prev) =>
          applyEffects(applyEffects(prev, effects), s.nodes[targetId]?.onEnter),
        );
        setCurrentId(targetId);
        setVisible(true);
      }, 200);
    },
    [s.nodes],
  );

  const restart = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setVars(computeInitialVars());
      setCurrentId(s.start);
      setVisible(true);
    }, 200);
  }, [computeInitialVars, s.start]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      {/* Header with story illustration */}
      <header className="w-full max-w-2xl mb-8 flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-between gap-2">
          <Link
            href="/"
            className="
              text-sm text-emerald-300/80 hover:text-emerald-300
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400
              focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628] rounded
              transition-colors
            "
          >
            <span aria-hidden="true">←</span> Todas as histórias
          </Link>
          <ShareButton url={storyUrl} title={s.title} text={s.subtitle} />
        </div>
        <div
          className="relative w-full h-52 drop-shadow-2xl"
          aria-hidden="true"
        >
          <Image
            src={story.cover}
            alt=""
            fill
            sizes="160px"
            className="object-contain"
            priority
          />
        </div>
        <h1
          className="text-3xl font-bold text-center text-emerald-300 tracking-tight"
          style={{ fontFamily: "var(--font-story)" }}
        >
          {s.title}
        </h1>
        <p className="text-sm text-white/50 text-center">{s.subtitle}</p>
      </header>

      {/* HUD (estado leve: dinheiro, tempo, etc.) — persistente, fora da transição de cena */}
      {s.hud && <Hud hud={s.hud} vars={vars} />}

      {/* Main content */}
      <main id="main-content" className="w-full max-w-2xl">
        <div
          className="transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {/* Scene card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm mb-6">
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <NarrationButton
                key={currentId}
                text={sceneNarrationText}
                choicesText={choicesText}
                rate={narrationRate}
                onRateChange={setNarrationRate}
                autoPlay={narrationActivated}
                onActivate={() => setNarrationActivated(true)}
              />
            </div>
            <SceneView
              text={node.text}
              headingRef={headingRef}
              sceneLabel={sceneLabel}
              image={node.image}
              imageAlt={node.imageAlt}
            />
          </div>
          {nextImages.map((src) => (
            <link key={src} rel="preload" as="image" href={src} />
          ))}

          {/* Choices or restart */}
          {node.isEnding ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-emerald-300 font-semibold text-lg text-center">
                Fim da história!
              </p>
              <button
                onClick={restart}
                className="
                  px-8 py-3 rounded-xl font-bold text-[#0a1628] bg-emerald-400
                  hover:bg-emerald-300 focus-visible:outline-none
                  focus-visible:ring-4 focus-visible:ring-emerald-400
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]
                  transition-colors cursor-pointer text-base
                "
              >
                Jogar novamente
              </button>
            </div>
          ) : (
            <nav aria-label="Escolhas da história">
              {!hasSingleChoice && (
                <p className="text-white/60 text-sm mb-3 font-medium uppercase tracking-wide">
                  {s.choicesPrompt}
                </p>
              )}
              <ul className="space-y-3 list-none p-0">
                {visibleChoices.map((choice, i) => (
                  <li key={i}>
                    <ChoiceButton
                      label={choice.label}
                      onClick={() => goTo(choice.target, choice.effects)}
                      index={i}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-white/30 text-xs text-center">
        <p>
          Use Tab para navegar · Enter ou Espaço para escolher · &ldquo;Ouvir
          cena&rdquo; para narração em voz alta
        </p>
      </footer>
    </div>
  );
}
