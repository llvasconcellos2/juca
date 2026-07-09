import Image from "next/image";
import Link from "next/link";
import { stories } from "@/lib/stories";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <header className="w-full max-w-2xl mb-10 text-center">
        <h1
          className="text-3xl md:text-4xl font-bold text-emerald-300 tracking-tight"
          style={{ fontFamily: "var(--font-story)" }}
        >
          Escolha uma história
        </h1>
        <p className="mt-3 text-white/60">
          Histórias interativas acessíveis — leia ou ouça, e escolha o que
          acontece a seguir.
        </p>
      </header>

      <main id="main-content" className="w-full max-w-2xl">
        <ul className="space-y-4 list-none p-0">
          {stories.map((story) => (
            <li key={story.slug}>
              <Link
                href={`/historias/${story.slug}`}
                className="
                  group flex items-center gap-5 p-5 rounded-2xl
                  bg-white/5 border border-emerald-400/40
                  hover:bg-emerald-400/10 hover:border-emerald-400
                  focus-visible:outline-none focus-visible:ring-4
                  focus-visible:ring-emerald-400 focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#0a1628]
                  transition-colors
                "
              >
                <div
                  className="relative w-20 h-24 shrink-0 drop-shadow-lg"
                  aria-hidden="true"
                >
                  <Image
                    src={story.cover}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2
                    className="text-xl font-bold text-emerald-300"
                    style={{ fontFamily: "var(--font-story)" }}
                  >
                    {story.content.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    {story.content.subtitle}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-12 text-white/30 text-xs text-center">
        <p>Use Tab para navegar · Enter para abrir uma história</p>
      </footer>
    </div>
  );
}
