"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Story } from "@/lib/types";
import SceneView from "./SceneView";
import ChoiceButton from "./ChoiceButton";
import NarrationButton from "./NarrationButton";
import ShareButton from "./ShareButton";

interface StoryEngineProps {
  story: Story;
}

export default function StoryEngine({ story }: StoryEngineProps) {
  const s = story.content;
  const storyUrl = `/historias/${story.slug}`;

  const [currentId, setCurrentId] = useState<string>(s.start);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(true);

  const node = s.nodes[currentId];
  const sceneLabel = node.label ?? "Cena";

  const choicesText = node.isEnding
    ? "Fim da história! Para jogar novamente, pressione o botão Jogar novamente."
    : `${s.choicesPrompt} ${node.choices.map((c, i) => `Opção ${i + 1}: ${c.label}`).join(". ")}.`;

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentId]);

  const goTo = useCallback((targetId: string) => {
    setVisible(false);
    setTimeout(() => {
      setCurrentId(targetId);
      setVisible(true);
    }, 200);
  }, []);

  const restart = useCallback(() => {
    goTo(s.start);
  }, [goTo, s.start]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      {/* Header with story illustration */}
      <header className="w-full max-w-2xl mb-8 flex flex-col items-center gap-4">
        <Link
          href="/"
          className="
            self-start text-sm text-emerald-300/80 hover:text-emerald-300
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400
            focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628] rounded
            transition-colors
          "
        >
          <span aria-hidden="true">←</span> Todas as histórias
        </Link>
        <div className="relative w-40 h-52 drop-shadow-2xl" aria-hidden="true">
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

      {/* Main content */}
      <main
        id="main-content"
        className="w-full max-w-2xl"
      >
        <div
          className="transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {/* Scene card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm mb-6">
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <ShareButton url={storyUrl} title={s.title} text={s.subtitle} />
              <NarrationButton
                key={currentId}
                text={node.text}
                choicesText={choicesText}
              />
            </div>
            <SceneView
              text={node.text}
              headingRef={headingRef}
              sceneLabel={sceneLabel}
            />
          </div>

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
              <p className="text-white/60 text-sm mb-3 font-medium uppercase tracking-wide">
                {s.choicesPrompt}
              </p>
              <ul className="space-y-3 list-none p-0">
                {node.choices.map((choice, i) => (
                  <li key={choice.target}>
                    <ChoiceButton
                      label={choice.label}
                      onClick={() => goTo(choice.target)}
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
        <p>Use Tab para navegar · Enter ou Espaço para escolher · &ldquo;Ouvir cena&rdquo; para narração em voz alta</p>
      </footer>
    </div>
  );
}
