import { RefObject } from "react";
import SceneImage from "./SceneImage";

interface SceneViewProps {
  text: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  sceneLabel: string;
  /** Caminho público da imagem da cena. Opcional — sem ela, renderiza só texto. */
  image?: string;
  /** Alt da imagem. A imagem só é exibida se ambos `image` e `imageAlt` estiverem presentes. */
  imageAlt?: string;
}

export default function SceneView({
  text,
  headingRef,
  sceneLabel,
  image,
  imageAlt,
}: SceneViewProps) {
  const paragraphs = text.split("\n\n").filter(Boolean);

  return (
    <article className="space-y-5">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300/70 focus:outline-none p-2"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {sceneLabel}
      </h2>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="text-[#f5f0e8] leading-[1.85] text-lg"
          style={{ fontFamily: "var(--font-story)" }}
        >
          {para}
        </p>
      ))}
      {/* A imagem vem DEPOIS do texto na ordem de leitura: o texto narrado é o principal,
          a imagem complementa (ver CLAUDE.md, seção 8). */}
      {image && imageAlt && <SceneImage key={image} src={image} alt={imageAlt} />}
    </article>
  );
}
