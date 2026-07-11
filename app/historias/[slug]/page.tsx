import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryEngine from "@/components/StoryEngine";
import { getStory, stories } from "@/lib/stories";
import { stripAuthoringMetadata } from "@/lib/engine";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};

  const { title, subtitle, shareImage } = story.content;
  const url = `/historias/${slug}`;

  // Sem `shareImage` explícito no content.json, o preview de compartilhamento (WhatsApp etc.)
  // usa a capa da própria história.
  const image = shareImage ?? story.cover.src;
  const imageWidth = shareImage ? 1200 : story.cover.width;
  const imageHeight = shareImage ? 630 : story.cover.height;

  return {
    title,
    description: subtitle,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: subtitle,
      url,
      type: "website",
      locale: "pt_BR",
      images: [{ url: image, width: imageWidth, height: imageHeight, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: subtitle,
      images: [image],
    },
  };
}

export default async function StoryPage({ params }: Params) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  // `imagePrompt` é metadado de autoria (prompt usado para gerar a imagem da cena) — nunca
  // deve chegar ao cliente. Removido aqui, na fronteira servidor -> cliente.
  return <StoryEngine story={{ ...story, content: stripAuthoringMetadata(story.content) }} />;
}
