import type { HudItem, StoryVariables } from "@/lib/types";
import { formatHudValue } from "@/lib/engine";

interface HudProps {
  hud: HudItem[];
  vars: StoryVariables;
}

/**
 * Área persistente de estado (dinheiro, tempo, etc.). `aria-live="polite"` fica
 * só aqui — nunca na cena, que usa gestão de foco (evita leitura duplicada).
 */
export default function Hud({ hud, vars }: HudProps) {
  if (hud.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="
        w-full max-w-2xl mb-6 flex flex-wrap justify-center gap-3
      "
    >
      {hud.map((item) => (
        <span
          key={item.var}
          className="
            px-4 py-2 rounded-full text-sm font-medium
            bg-white/5 border border-white/15 text-[#f5f0e8]
          "
        >
          {item.label}: {formatHudValue(vars[item.var] ?? 0, item.format)}
        </span>
      ))}
    </div>
  );
}
