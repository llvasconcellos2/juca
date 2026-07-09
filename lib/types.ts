import type { StaticImageData } from "next/image";

/** Estado leve: mapa de nome de variável -> valor numérico (ex.: { dinheiro: 30 }). */
export type StoryVariables = Record<string, number>;

export type EffectOp = "-=" | "+=" | "=";
export type ConditionOp = ">=" | "<=" | "==" | ">" | "<";

/** Efeito aplicado a uma variável de estado (em onEnter de nó ou effects de escolha). */
export interface Effect {
  var: string;
  op: EffectOp;
  value: number;
}

/** Condição sobre uma variável de estado (controla se uma escolha aparece). */
export interface Condition {
  var: string;
  op: ConditionOp;
  value: number;
}

/** Como formatar um valor de HUD para leitura. Default: "number". */
export type HudFormat = "number" | "currency-brl" | "minutes-hm";

/** Uma entrada do HUD: qual variável mostrar, com que rótulo e formatação. */
export interface HudItem {
  var: string;
  label: string;
  format?: HudFormat;
}

export interface Choice {
  label: string;
  target: string;
  /** Escolha só aparece se a condição for verdadeira. Sem `condition`, sempre aparece. */
  condition?: Condition;
  /** Efeitos aplicados (na ordem) ao escolher, antes de navegar para `target`. */
  effects?: Effect[];
}

export interface StoryNode {
  /** Rótulo de acessibilidade da cena (heading que recebe o foco na troca de cena). */
  label?: string;
  text: string;
  isEnding: boolean;
  choices: Choice[];
  /** Efeitos aplicados (na ordem) ao entrar neste nó. */
  onEnter?: Effect[];
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
  /** Valores iniciais do estado leve (dinheiro, tempo, etc.). Sem isso, a história não tem estado. */
  variables?: StoryVariables;
  /** Quais variáveis mostrar no HUD persistente, com rótulo e formatação. */
  hud?: HudItem[];
  nodes: Record<string, StoryNode>;
}

/** Uma história registrada: conteúdo (JSON) + capa (asset importado). */
export interface Story {
  slug: string;
  content: StoryData;
  cover: StaticImageData;
}
