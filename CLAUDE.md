# CLAUDE.md

Guia de contexto persistente para o Claude Code (claude.ai/code) trabalhar neste repositório. Mantenha-o atualizado sempre que a arquitetura mudar.

@AGENTS.md

## 1. Visão geral e missão

Plataforma de **ficção interativa baseada em escolhas**, acessível a pessoas cegas e com baixa visão. O usuário lê (ou ouve) uma cena e escolhe entre botões o que acontece a seguir; a história é um grafo de nós ramificado.

Primeira história: **"Juca e a Caça ao Tesouro do Rio"** (a Grande Caça ao Tesouro do Rio Cachoeira, em Joinville), estrelando o jacaré **Juca**, jovem e cego, que encontra tesouros usando faro e audição — o próprio herói espelha o público que o projeto quer incluir.

- **Público:** 7 a 14 anos.
- **Idioma:** PT-BR.
- **Contexto:** projeto social voltado a pessoas com deficiência visual, mas pensado para ser atraente e usado por **todos** — isso é **inclusão**: a mesma experiência serve quem enxerga e quem não enxerga.

Uma decisão real na introdução leva a dois caminhos e dois finais (5 telas: 1 introdução, 2 cenas, 2 finais). O roteiro-fonte e as notas de acessibilidade estão em `roteiro.md`.

## 2. PRINCÍPIO INEGOCIÁVEL — Acessibilidade primeiro

O produto deve **FUNCIONAR** (não apenas "ser compatível") com leitores de tela: **NVDA, JAWS, VoiceOver e Narrator**. A experiência de quem navega por leitor de tela e teclado é a experiência principal, não um extra.

**Nenhuma mudança de UI, estilo ou refatoração pode quebrar isso.** Antes de mexer em foco, ordem de leitura, semântica ou navegação por teclado, revise a seção 8 (checklist) e as notas em `roteiro.md`.

## 3. Stack e ferramentas

Versões reais (ver `package.json` / lockfiles):

- **Next.js** `16.2.7` (App Router) — ⚠️ versão com breaking changes; ver `AGENTS.md` e `node_modules/next/dist/docs/`.
- **React** / **React DOM** `19.2.4`
- **TypeScript** `^5` (modo `strict`)
- **Tailwind CSS** `^4` (config CSS-first via `@tailwindcss/postcss`, sem `tailwind.config.js`)
- **ESLint** `^9` + `eslint-config-next` `16.2.7` (flat config)
- **Playwright** `@playwright/test ^1.60.0` — usado apenas pelo script manual `verify-juca.mjs`.
- **Gerenciador de pacotes:** **pnpm** (há `pnpm-workspace.yaml` e `pnpm-lock.yaml`). Use pnpm.
- **Node:** major **22** (`.nvmrc` = `22`; `engines.node` = `>=22 <23`). Use `nvm use` para alinhar.

## 4. Comandos

Extraídos de `package.json`:

- `pnpm dev` — servidor de desenvolvimento (<http://localhost:3000>)
- `pnpm build` — build de produção
- `pnpm start` — roda o build de produção
- `pnpm lint` — ESLint
- `pnpm typecheck` — checagem de tipos (`tsc --noEmit`)

Não há suíte de testes automatizada.

**Verificação manual (não é suíte automatizada):** `script-testing/verify-juca.mjs` é um script Playwright que percorre a história de ponta a ponta (os dois ramos), confere afordâncias de acessibilidade (skip link, gestão de foco, botões semânticos) e tira screenshots em desktop e mobile. Rode contra um dev server vivo:

```bash
pnpm dev                             # em um terminal
node script-testing/verify-juca.mjs  # em outro, depois que localhost:3000 subir
```

**`script-testing/`** guarda os scripts de teste/verificação manual "interessantes" do projeto — os que valem ser mantidos por histórico (como o `verify-juca.mjs`). Ao criar um script útil durante a fase de teste, guarde-o aqui em vez de deixá-lo na raiz.

## 5. Estrutura do projeto

**O projeto suporta múltiplas histórias:** a home é uma tela de seleção e cada história tem sua própria rota. Motor e conteúdo são separados; um registro (`lib/stories.ts`) lista as histórias.

- `app/layout.tsx` — layout raiz; `<html lang="pt-BR">`, `metadata` genérico do projeto + `metadataBase` + OpenGraph/Twitter default, e as duas fontes Google (`--font-story` = Lora, `--font-ui` = Inter). O título por história vem do `generateMetadata` da rota.
- `app/page.tsx` — **tela de seleção**: lista as histórias de `lib/stories.ts` como links (`next/link`) para `/historias/<slug>` (capa + título + subtítulo). Server component.
- `app/historias/[slug]/page.tsx` — **rota da história** (server component async). Resolve `slug` (`await params`, padrão Next 16), busca via `getStory`, faz `notFound()` se não existir e renderiza `<StoryEngine story={...} />`. Tem `generateStaticParams` (SSG por slug) e `generateMetadata` (OG/Twitter por história).
- `app/globals.css` — Tailwind v4 (`@import "tailwindcss"` + bloco `@theme inline`); fundo "rio à noite", estrelas decorativas (`aria-hidden`), `.skip-link` e estilos globais de `:focus-visible`.
- `components/StoryEngine.tsx` — **motor da história** (client component, **agnóstico de conteúdo**). Recebe `story: Story` por prop; dono de todo o estado (nó atual, cross-fade), faz a gestão de foco e compõe os demais componentes. O rótulo de acessibilidade de cada cena vem de `node.label` (não há mais `SCENE_LABELS`).
- `components/SceneView.tsx` — renderiza o texto da cena e o `<h2 tabIndex={-1}>` que recebe o foco.
- `components/ChoiceButton.tsx` — um `<button>` por escolha.
- `components/NarrationButton.tsx` — narração por voz via Web Speech API (`speechSynthesis`), em pt-BR.
- `components/ShareButton.tsx` — botão de **compartilhar** (client component); usa a Web Share API (`navigator.share`) com fallback de copiar link. O link aponta sempre para o início da história (`/historias/<slug>`), não para o nó atual. Aparece em todas as cenas.
- `lib/types.ts` — tipos `Story`, `StoryData`, `StoryNode`, `Choice`.
- `lib/stories.ts` — **registro** das histórias (`stories`, `getStory(slug)`).
- `stories/<slug>/` — cada história é **autocontida**:
  - `content.json` — o grafo de nós + metadados (`title`, `subtitle`, `choicesPrompt`, `shareImage`, e `label` por nó).
  - `index.ts` — monta o objeto `Story` (importa `content.json` + `cover.png`).
  - `cover.png` — capa (import otimizado pelo `next/image`, exibição in-app).
  - `roteiro.md` — roteiro-fonte da história + notas de acessibilidade (arquivado junto do conteúdo).
- `public/juca.png` — imagem de compartilhamento/OG (URL pública absoluta que os crawlers buscam; **não** é o mesmo que a `cover.png` importada).
- `assets/` — arquivos guardados de imagens, logos, icones, etc. Serve mais como **referência histórica** e consulta, fora do build (não é `public/` nem `stories/`).
- `script-testing/` — scripts de teste/verificação manual guardados para histórico (ver seção 4).
- Configs: `next.config.ts`, `tsconfig.json` (alias `@/*` → raiz), `eslint.config.mjs`, `postcss.config.mjs`.

## 6. Formato de conteúdo das histórias

O conteúdo é **totalmente separado do código**. Cada história vive em `stories/<slug>/content.json`, tipado por `lib/types.ts`:

```jsonc
{
  "title": "Título da história",
  "subtitle": "Subtítulo curto (usado no header e como descrição/OG)",
  "choicesPrompt": "Pergunta que introduz as escolhas (ex.: O que Juca faz?)",
  "shareImage": "/juca.png", // caminho público da imagem OG (opcional; default /juca.png)
  "language": "pt-BR",
  "audience": "7-14",
  "start": "inicio", // id do nó inicial
  "nodes": {
    "inicio": {
      "label": "Início da aventura", // rótulo de acessibilidade da cena (heading que recebe foco)
      "text": "Parágrafos...\n\nSeparados por linha em branco.",
      "isEnding": false,
      "choices": [{ "label": "Texto do botão", "target": "id_do_proximo_no" }],
    },
    "um_final": {
      "label": "Final: ...",
      "text": "...\n\nFim.",
      "isEnding": true, // nó final: choices fica vazio
      "choices": [],
    },
  },
}
```

Regras do formato:

- `text` usa `\n\n` para separar parágrafos (o `SceneView` faz o split).
- `label` é o rótulo lido pelo leitor de tela ao entrar na cena (heading com foco). Recomendado em todo nó; se faltar, o motor usa "Cena".
- Nó final: `isEnding: true` e `choices: []` (o motor mostra "Jogar novamente").
- Todo `target` de escolha deve apontar para um `id` existente em `nodes`.

**Como adicionar uma nova CENA** a uma história existente:

1. Em `stories/<slug>/content.json`, adicione uma entrada em `nodes` com um `id` novo — `label`, `text`, `isEnding` e `choices`.
2. Aponte para ela a partir do `target` de alguma escolha (e/ou dê a ela escolhas que apontem adiante).
3. O `label` do próprio nó já é o rótulo de acessibilidade — **não** há mais uma tabela separada (`SCENE_LABELS`) para sincronizar.

**Como adicionar uma nova HISTÓRIA:**

1. Crie a pasta `stories/<slug>/` com `content.json` (mesmo schema), `cover.png` (capa) e, se houver, `roteiro.md`.
2. Crie `stories/<slug>/index.ts` que monta o `Story` (importa `content.json` + `cover.png`), no mesmo padrão de `stories/juca-tesouro-do-rio/index.ts`.
3. Registre a história em `lib/stories.ts` (adicione ao array `stories`). A rota `/historias/<slug>` e o card na tela de seleção passam a funcionar automaticamente.

**Princípio:** o motor (`components/`) é **genérico**; o conteúdo (`stories/<slug>/`) é **dados**. Nunca embuta texto de história dentro dos componentes.

## 7. Convenções de código

- **TypeScript** em modo `strict`; conteúdo do JSON tipado por `lib/types.ts` (`content as StoryData` em `stories/<slug>/index.ts`).
- **Componentes:** função por arquivo, um componente por arquivo, PascalCase. Marque com `"use client"` só quem precisa (estado, efeitos, eventos, Web Speech). `SceneView` é server-friendly (recebe `headingRef` por prop).
- **Estilos:** Tailwind v4 utilitário no JSX. Sem `tailwind.config.js` — tokens e animações vivem no `@theme inline` de `app/globals.css`. Para fontes, use as variáveis CSS `var(--font-story)` (prosa narrativa) e `var(--font-ui)` (chrome/UI); não hardcode famílias de fonte.
- **Imports:** use o alias `@/*` (mapeia para a raiz — ver `tsconfig.json`).
- **i18n:** o conteúdo é PT-BR (padrão). O JSON já carrega `language`, e `layout.tsx` fixa `lang="pt-BR"`. Não há biblioteca de i18n nem roteamento por idioma ainda — inglês é PLANEJADO. Ao escrever texto de UI, prefira strings fáceis de externalizar no futuro.

## 8. Checklist de acessibilidade (obrigatório em todo componente de jogo)

- **Escolhas são `<button>` reais** (nunca `div`), dentro de um `<nav>`, navegáveis por **Tab** e acionáveis por **Enter/Espaço**, com rótulo claro e único.
- **Ao trocar de cena, mover o foco** para o início do texto novo: um heading com `tabIndex={-1}` que recebe `.focus()` (ver `headingRef` em `StoryEngine.tsx` / `SceneView.tsx`), para o leitor de tela anunciar a cena nova.
- **NÃO** usar `aria-live` **e** movimentação de foco ao mesmo tempo para o mesmo conteúdo — combinar os dois causa leitura duplicada. Aqui usamos gestão de foco; não adicione `aria-live` na mesma região.
- **Nenhuma informação só por cor**; alto contraste; fonte ampliável; sem armadilhas de teclado; foco sempre visível (`:focus-visible`).
- Há **skip link** ("Pular para o conteúdo") e imagens decorativas com `alt=""` / `aria-hidden`.
- **Narração:** `NarrationButton` fala o texto da cena e depois as escolhas, via `SpeechSynthesisUtterance` encadeados em `pt-BR`; a narração é cancelada ao trocar de cena. O botão só aparece se o navegador suportar `speechSynthesis`.
- **Compartilhar:** `ShareButton` é um `<button>` real com `aria-label` claro; a confirmação "Link copiado!" fica num `role="status"` **local ao botão** (não na região da cena) — isso não conflita com a regra de não combinar `aria-live` + foco no **conteúdo da cena**.
- **Textos escritos para soar bem em narração:** sem CAIXA ALTA solta, sem emojis decorativos no conteúdo lido.

## 9. Escopo e roadmap

- **MVP (atual):** a primeira história do Juca rodando, acessível, com narração por Web Speech API e verificação manual via Playwright.
- **Futuro (manter engine/conteúdo separados para reaproveitar):** mais histórias e autores; seleção/roteamento de histórias; plataforma reaproveitável.
- **PLANEJADO — ainda não implementado** (a menos que o código mostre o contrário):
  - Narração por voz de **IA/TTS dedicada** (hoje só há a Web Speech API nativa do navegador).
  - Geração de **uma imagem por escolha via IA**.
  - **Áudio/trilha e efeitos sonoros**.
  - **i18n / versão em inglês**.

## 10. O que evitar

- **Não acoplar conteúdo à engine** — texto de história vive em `stories/<slug>/content.json`, nunca dentro de componentes.
- **Não quebrar acessibilidade** — releia a seção 8 antes de mexer em foco, semântica, teclado ou contraste.
- **Não introduzir dependências pesadas** sem necessidade real.
- **PT-BR é o idioma padrão** do conteúdo; escreva textos que soem bem em narração.
- **Manter o motor agnóstico de conteúdo** — nada específico de uma história (título, capa, rótulos, prompt) dentro de `components/`; tudo vem de `Story`/`content.json`.

---

**Mantenha este CLAUDE.md atualizado sempre que a arquitetura, os comandos ou as convenções mudarem.**
