import type { Story } from "@/lib/types";
import { jucaTesouroDoRio } from "@/stories/juca-tesouro-do-rio";

/** Registro de todas as histórias. Para adicionar uma história nova, crie
 *  `stories/<slug>/` (content.json + index.ts) e inclua o export aqui. */
export const stories: Story[] = [jucaTesouroDoRio];

const bySlug = new Map(stories.map((s) => [s.slug, s]));

export function getStory(slug: string): Story | undefined {
  return bySlug.get(slug);
}
