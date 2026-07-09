import type { StaticImageData } from "next/image";

export interface Choice {
  label: string;
  target: string;
}

export interface StoryNode {
  /** Rótulo de acessibilidade da cena (heading que recebe o foco na troca de cena). */
  label?: string;
  text: string;
  isEnding: boolean;
  choices: Choice[];
}

export interface StoryData {
  title: string;
  /** Subtítulo curto exibido no header e usado como descrição/OG. */
  subtitle: string;
  /** Pergunta que introduz as escolhas (ex.: "O que Juca faz?"). */
  choicesPrompt: string;
  /** Caminho público da imagem de compartilhamento/OG. Default: "/juca.png". */
  shareImage?: string;
  language: string;
  audience: string;
  start: string;
  nodes: Record<string, StoryNode>;
}

/** Uma história registrada: conteúdo (JSON) + capa (asset importado). */
export interface Story {
  slug: string;
  content: StoryData;
  cover: StaticImageData;
}
