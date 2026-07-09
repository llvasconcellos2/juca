"use client";

import { useEffect, useRef, useState } from "react";

interface ShareButtonProps {
  /** Caminho relativo do início da história (ex.: "/historias/juca-tesouro-do-rio"). */
  url: string;
  title: string;
  text: string;
}

export default function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick() {
    const absoluteUrl = new URL(url, window.location.origin).toString();

    // Web Share API (ideal em mobile): abre a folha de compartilhamento do sistema.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: absoluteUrl });
        return;
      } catch {
        // Usuário cancelou ou o share falhou — cai no fallback de copiar.
      }
    }

    // Fallback: copia o link para a área de transferência.
    try {
      await navigator.clipboard.writeText(absoluteUrl);
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
        aria-label="Compartilhar esta história"
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          border border-emerald-400/60 text-emerald-300
          hover:bg-emerald-400/10 focus-visible:outline-none
          focus-visible:ring-4 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0a1628] transition-colors cursor-pointer
          select-none
        "
      >
        <span aria-hidden="true">↗</span>
        Compartilhar
      </button>
      <span role="status" className="text-emerald-300 text-sm">
        {copied ? "Link copiado!" : ""}
      </span>
    </span>
  );
}
