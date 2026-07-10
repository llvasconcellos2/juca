import { RefObject } from "react";

interface SceneViewProps {
  text: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  sceneLabel: string;
}

export default function SceneView({
  text,
  headingRef,
  sceneLabel,
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
    </article>
  );
}
