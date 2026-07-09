import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryEngine from "@/components/StoryEngine";
import { getStory, stories } from "@/lib/stories";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};

  const { title, subtitle, shareImage = "/juca.png" } = story.content;
  const url = `/historias/${slug}`;

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
      images: [{ url: shareImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: subtitle,
      images: [shareImage],
    },
  };
}

export default async function StoryPage({ params }: Params) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  return <StoryEngine story={story} />;
}
