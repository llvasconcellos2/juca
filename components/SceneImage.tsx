"use client";

import { useState } from "react";
import Image from "next/image";

interface SceneImageProps {
  src: string;
  alt: string;
}

/**
 * Imagem opcional da cena. Reserva espaço fixo (aspect-ratio) para não causar layout
 * shift enquanto carrega. Se o arquivo não existir/falhar, some sem quebrar a cena — o
 * texto continua funcionando sozinho.
 */
export default function SceneImage({ src, alt }: SceneImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-white/5 border border-white/10">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 672px"
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
