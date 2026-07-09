import type { Condition, Effect, HudFormat, StoryVariables } from "./types";

/** Aplica um único efeito e retorna um novo objeto de estado (não muta `vars`). */
export function applyEffect(vars: StoryVariables, effect: Effect): StoryVariables {
  const current = vars[effect.var] ?? 0;
  let next: number;
  switch (effect.op) {
    case "+=":
      next = current + effect.value;
      break;
    case "-=":
      next = current - effect.value;
      break;
    case "=":
      next = effect.value;
      break;
  }
  return { ...vars, [effect.var]: next };
}

/** Aplica uma lista de efeitos em ordem. Sem efeitos, retorna `vars` como veio. */
export function applyEffects(vars: StoryVariables, effects?: Effect[]): StoryVariables {
  return (effects ?? []).reduce(applyEffect, vars);
}

/** Avalia uma condição sobre o estado atual. Variável ausente é tratada como 0. */
export function evaluateCondition(vars: StoryVariables, condition: Condition): boolean {
  const value = vars[condition.var] ?? 0;
  switch (condition.op) {
    case ">=":
      return value >= condition.value;
    case "<=":
      return value <= condition.value;
    case "==":
      return value === condition.value;
    case ">":
      return value > condition.value;
    case "<":
      return value < condition.value;
  }
}

/**
 * Formata um valor de HUD para leitura humana/narração.
 * Valores negativos são exibidos como 0 (o estado interno pode ir negativo
 * para fins de lógica/condições, mas o HUD nunca mostra número negativo).
 */
export function formatHudValue(value: number, format: HudFormat = "number"): string {
  const clamped = Math.max(0, value);
  switch (format) {
    case "currency-brl":
      return `R$ ${clamped}`;
    case "minutes-hm": {
      const hours = Math.floor(clamped / 60);
      const minutes = clamped % 60;
      return hours > 0 ? `${hours}h${String(minutes).padStart(2, "0")}` : `${minutes}min`;
    }
    case "number":
    default:
      return String(clamped);
  }
}
