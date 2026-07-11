# CLAUDE.md

Guia de contexto persistente para o Claude Code (claude.ai/code) trabalhar neste repositório. Mantenha-o atualizado sempre que a arquitetura mudar.

@AGENTS.md

## 1. Visão geral e missão

Plataforma de **ficção interativa baseada em escolhas**, acessível a pessoas cegas e com baixa visão. O usuário lê (ou ouve) uma cena e escolhe entre botões o que acontece a seguir; a história é um grafo de nós ramificado.

Primeira história: **"Juca e a Caça ao Tesouro do Rio"** (a Grande Caça ao Tesouro do Rio Cachoeira, em Joinville), estrelando o jacaré **Juca**, jovem e cego, que encontra tesouros usando faro e audição — o próprio herói espelha o público que o projeto quer incluir.

Segunda história: **"Juca e a Corrida do Churrasco"** — Juca precisa ir do Pórtico de Joinville até um churrasco na casa de carnes Don Toro, escolhendo entre ônibus (grátis) e Uber (mais rápido, mas custa dinheiro). É a primeira história com **estado leve** (`dinheiro` e `tempo`); ver seção 6.

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

**Frontend design:** ao trabalhar em UI/frontend, sempre use o plugin/skills `frontend-design` (direção estética, tipografia, escolhas visuais intencionais) antes de implementar.

Extraídos de `package.json`:

- `pnpm dev` — servidor de desenvolvimento (<http://localhost:3000>). **Antes de rodar, sempre confira se já há um dev server ativo na porta 3000** (ex.: checar a porta ou tentar acessar `localhost:3000`) — se já estiver rodando, reaproveite-o em vez de subir uma segunda instância.
- `pnpm build` — build de produção
- `pnpm start` — roda o build de produção
- `pnpm lint` — ESLint
- `pnpm typecheck` — checagem de tipos (`tsc --noEmit`)
- `pnpm validate-stories` — valida o grafo de nós de **todas** as histórias (`script-testing/validate-stories.mjs`; ver seção 6)

Não há suíte de testes automatizada.

**Verificação manual (não é suíte automatizada):** `script-testing/verify-juca.mjs` é um script Playwright que percorre a história de ponta a ponta (os dois ramos), confere afordâncias de acessibilidade (skip link, gestão de foco, botões semânticos) e tira screenshots em desktop e mobile. Rode contra um dev server vivo:

```bash
pnpm dev                             # em um terminal
node script-testing/verify-juca.mjs  # em outro, depois que localhost:3000 subir
```

**Passo de screenshot na validação:** ao validar qualquer mudança visual, tire screenshots com Playwright e salve-os na pasta `screenshots-dev/` (não commitados — ver `.gitignore`). Convenção de nome: `{número de 3 dígitos}-{o que está sendo mostrado}.png` (ex.: `001-tela-inicial.png`, `002-hud-dinheiro.png`), para não colidir entre execuções. **Não apague** os screenshots depois — deixe-os na pasta para referência histórica da sessão.

**`script-testing/`** guarda os scripts de teste/verificação manual "interessantes" do projeto — os que valem ser mantidos por histórico (como o `verify-juca.mjs`). Ao criar um script útil durante a fase de teste, guarde-o aqui em vez de deixá-lo na raiz.

**Validação de grafo (`script-testing/validate-stories.mjs`):** lê `stories/<slug>/content.json` de toda história registrada e confere, sem precisar de browser: `start` existe; todo `target` de escolha existe; todo nó não-final tem ao menos uma escolha e nós finais não têm nenhuma; nenhum nó fica inalcançável a partir de `start`; nenhum nó fica "travado por condição" (todas as `choices` do nó têm `condition` — nesse caso o jogador pode ficar sem opção); todo nó com `image` tem `imageAlt` não-vazio (erro, bloqueia). Também emite **avisos** (não bloqueiam): `imageAlt` idêntico ao `text` do nó (indício de duplicar a narração) e arquivo de `image` que não existe em `/public`. Rode com `pnpm validate-stories` (não precisa de dev server rodando).

## 5. Estrutura do projeto

**O projeto suporta múltiplas histórias:** a home é uma tela de seleção e cada história tem sua própria rota. Motor e conteúdo são separados; um registro (`lib/stories.ts`) lista as histórias.

- `app/layout.tsx` — layout raiz; `<html lang="pt-BR">`, `metadata` genérico do projeto + `metadataBase` + OpenGraph/Twitter default, e as duas fontes Google (`--font-story` = Lora, `--font-ui` = Inter). O título por história vem do `generateMetadata` da rota.
- `app/page.tsx` — **tela de seleção**: lista as histórias de `lib/stories.ts` como links (`next/link`) para `/historias/<slug>` (capa + título + subtítulo). Server component.
- `app/historias/[slug]/page.tsx` — **rota da história** (server component async). Resolve `slug` (`await params`, padrão Next 16), busca via `getStory`, faz `notFound()` se não existir e renderiza `<StoryEngine story={...} />`. Tem `generateStaticParams` (SSG por slug) e `generateMetadata` (OG/Twitter por história).
- `app/globals.css` — Tailwind v4 (`@import "tailwindcss"` + bloco `@theme inline`); fundo "rio à noite", estrelas decorativas (`aria-hidden`), `.skip-link` e estilos globais de `:focus-visible`.
- `components/StoryEngine.tsx` — **motor da história** (client component, **agnóstico de conteúdo**). Recebe `story: Story` por prop; dono de todo o estado (nó atual, cross-fade), faz a gestão de foco e compõe os demais componentes. O rótulo de acessibilidade de cada cena vem de `node.label` (não há mais `SCENE_LABELS`).
- `components/SceneView.tsx` — renderiza o texto da cena, o `<h2 tabIndex={-1}>` que recebe o foco e, opcionalmente, a imagem da cena (via `components/SceneImage.tsx`) **depois** do texto, na ordem de leitura.
- `components/SceneImage.tsx` — imagem opcional de uma cena (client component). Usa `next/image` com `fill` dentro de um contêiner com `aspect-[16/9]` fixo (evita layout shift enquanto carrega) e `object-contain` (não corta a imagem, funciona tanto para ilustração quanto para foto composta). Se o arquivo falhar ao carregar (`onError`), o componente esconde a si mesmo (`return null`) — a cena continua funcionando só com texto.
- `components/ChoiceButton.tsx` — um `<button>` por escolha.
- `components/NarrationButton.tsx` — narração por voz via Web Speech API (`speechSynthesis`), em pt-BR, com controles Reiniciar / Ouvir-Pausar / velocidade (0,75×–3×) lado a lado; o `rate` (multiplicador) mora no `StoryEngine`, não neste componente, para persistir entre trocas de cena. Play alterna para Pausar/Continuar via `speechSynthesis.pause()/resume()` (não cancela mais). Trocar a velocidade no meio da fala não reinicia do zero: a última posição ouvida (via `onboundary`) é usada para recomeçar dali, na nova velocidade — cai de volta ao início do segmento em navegadores sem `onboundary` (ex.: Safari).
- `components/ShareButton.tsx` — botão de **compartilhar** (client component); usa a Web Share API (`navigator.share`) com fallback de copiar link. O link aponta sempre para o início da história (`/historias/<slug>`), não para o nó atual. Aparece em todas as cenas.
- `components/Hud.tsx` — HUD persistente de estado leve (dinheiro, tempo, etc.); só renderiza se `story.content.hud` existir. Região `aria-live="polite"` própria, separada da cena (ver seção 8). Genérico: itera `hud` e formata cada valor via `lib/engine.ts#formatHudValue`, sem conhecer nomes de variável.
- `lib/types.ts` — tipos `Story`, `StoryData`, `StoryNode`, `Choice`, e os tipos de estado leve `Effect`, `Condition`, `HudItem`, `StoryVariables` (ver seção 6).
- `lib/engine.ts` — funções puras e agnósticas de conteúdo para o estado leve: `applyEffect`/`applyEffects` (aplica efeitos a um objeto de variáveis), `evaluateCondition` (avalia uma condição), `formatHudValue` (formata um valor para o HUD conforme `HudFormat`), `stripAuthoringMetadata` (remove `imagePrompt` de todos os nós antes do conteúdo cruzar para o cliente). Sem nenhum nome de variável hardcoded.
- `lib/stories.ts` — **registro** das histórias (`stories`, `getStory(slug)`).
- `stories/<slug>/` — cada história é **autocontida**:
  - `content.json` — o grafo de nós + metadados (`title`, `subtitle`, `choicesPrompt`, `shareImage`, `label` por nó, e opcionalmente `variables`/`hud`/`onEnter`/`condition`/`effects` — ver seção 6).
  - `index.ts` — monta o objeto `Story` (importa `content.json` + `cover.png`).
  - `cover.png` — capa (import otimizado pelo `next/image`, exibição in-app).
  - `roteiro.md` — roteiro-fonte da história + notas de acessibilidade (arquivado junto do conteúdo).
- `public/juca.png` — imagem de compartilhamento/OG (URL pública absoluta que os crawlers buscam; **não** é o mesmo que a `cover.png` importada).
- `public/images/<slug>/` — convenção para imagens de CENA (campo `image` de um nó, ver seção 6). Caminho público, ex.: `/images/juca-churrasco/inicio.png`. Diferente de `cover.png` (capa da história, importada) e de `juca.png` (imagem de compartilhamento/OG).
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
      "image": "/images/<slug>/inicio.png", // opcional: imagem da cena (caminho público em /public)
      "imageAlt": "Descrição curta da imagem, sem repetir o texto narrado", // OBRIGATÓRIO se "image" existir
      "imagePrompt": "prompt usado para gerar a imagem", // opcional: só metadado de autoria, nunca renderizado
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
- **Imagem de cena (`image`/`imageAlt`/`imagePrompt`), opcional e retrocompatível** — um nó sem `image` renderiza só texto, exatamente como antes:
  - `image`: caminho público do arquivo já gerado/aprovado (ex.: `/images/juca-churrasco/inicio.png`), servido de `public/images/<slug>/`.
  - `imageAlt`: texto alternativo curto, para leitor de tela. **Obrigatório sempre que `image` estiver presente** (`pnpm validate-stories` falha se faltar). Não deve duplicar o texto narrado — a pessoa ouviria a mesma coisa duas vezes (o validador avisa, não bloqueia, se `imageAlt` for idêntico ao `text`). Alt vazio só seria aceitável para imagem puramente decorativa, o que não é o caso aqui.
  - `imagePrompt`: **apenas metadado de autoria** (o prompt usado para gerar a imagem). Nunca é renderizado. É removido do conteúdo antes de cruzar a fronteira servidor → cliente por `lib/engine.ts#stripAuthoringMetadata`, chamada em `app/historias/[slug]/page.tsx` — não vai no HTML nem no payload React enviado ao navegador.
  - Renderização (`components/SceneImage.tsx`) usa `next/image` — o projeto **não** usa `output: export` (ver `next.config.ts`), então a otimização de imagem padrão do Next funciona normalmente, sem precisar de `images.unoptimized` nem loader customizado.
  - A imagem aparece **depois** do texto na ordem de leitura (o texto narrado é o principal; a imagem complementa) e nunca entra na ordem de tabulação (é `<img>`, não focável — o foco na troca de cena continua indo só para o heading, nunca para a imagem).
  - Se o arquivo referenciado não existir/falhar ao carregar, a cena degrada com elegância: a imagem some (sem ícone de imagem quebrada) e o texto continua funcionando normalmente.

**Como adicionar uma nova CENA** a uma história existente:

1. Em `stories/<slug>/content.json`, adicione uma entrada em `nodes` com um `id` novo — `label`, `text`, `isEnding` e `choices`.
2. Aponte para ela a partir do `target` de alguma escolha (e/ou dê a ela escolhas que apontem adiante).
3. O `label` do próprio nó já é o rótulo de acessibilidade — **não** há mais uma tabela separada (`SCENE_LABELS`) para sincronizar.
4. Se a cena tiver imagem: salve o arquivo em `public/images/<slug>/`, referencie em `image` e escreva um `imageAlt` que não repita o `text`. Rode `pnpm validate-stories` para confirmar.

**Como adicionar uma nova HISTÓRIA:**

1. Crie a pasta `stories/<slug>/` com `content.json` (mesmo schema), `cover.png` (capa) e, se houver, `roteiro.md`.
2. Crie `stories/<slug>/index.ts` que monta o `Story` (importa `content.json` + `cover.png`), no mesmo padrão de `stories/juca-tesouro-do-rio/index.ts`.
3. Registre a história em `lib/stories.ts` (adicione ao array `stories`). A rota `/historias/<slug>` e o card na tela de seleção passam a funcionar automaticamente.

**Princípio:** o motor (`components/`) é **genérico**; o conteúdo (`stories/<slug>/`) é **dados**. Nunca embuta texto de história dentro dos componentes.

### Estado leve (`variables`, `hud`, `onEnter`, `condition`, `effects`)

Uma história pode opcionalmente ter **estado leve** — variáveis numéricas (ex.: `dinheiro`, `tempo`) que mudam conforme o jogador escolhe, e que podem esconder/mostrar escolhas. É **totalmente opcional e retrocompatível**: uma história sem `variables`/`hud` e sem `onEnter`/`condition`/`effects` nos nós funciona exatamente como antes (ex.: `juca-tesouro-do-rio`).

```jsonc
{
  // ...campos de sempre (title, subtitle, choicesPrompt, start, nodes)...
  "variables": { "dinheiro": 30, "tempo": 120 }, // valores iniciais do estado
  "hud": [
    { "var": "dinheiro", "label": "Dinheiro", "format": "currency-brl" },
    { "var": "tempo", "label": "Tempo até o evento", "format": "minutes-hm" }
  ],
  "nodes": {
    "algum_no": {
      "label": "...",
      "text": "...",
      "isEnding": false,
      "onEnter": [{ "var": "tempo", "op": "-=", "value": 10 }], // aplicado ao ENTRAR no nó
      "choices": [
        {
          "label": "Chamar um Uber (15 reais)",
          "target": "outro_no",
          "condition": { "var": "dinheiro", "op": ">=", "value": 15 }, // só aparece se verdadeira
          "effects": [{ "var": "dinheiro", "op": "-=", "value": 15 }] // aplicado ao ESCOLHER, antes de navegar
        }
      ]
    }
  }
}
```

- **Efeito** (`onEnter` de nó, `effects` de escolha): `{ "var": string, "op": "-=" | "+=" | "=", "value": number }`. Variável ausente é tratada como `0`.
- **Condição** (`condition` de escolha): `{ "var": string, "op": ">=" | "<=" | "==" | ">" | "<", "value": number }`.
- **Ordem de aplicação ao escolher:** `effects` da escolha primeiro, depois `onEnter` do nó de destino, só então a cena troca.
- **Escolhas condicionais:** uma escolha com `condition` falsa simplesmente **não aparece** na lista (nem é lida pela narração). **Sempre garanta pelo menos uma escolha sem `condition`** em todo nó não-final — senão o jogador pode ficar sem opção (`pnpm validate-stories` pega esse erro; ver seção 4).
- **HUD (`hud`):** lista de `{ var, label, format? }` — cada entrada vira uma pastilha na área de HUD persistente (`components/Hud.tsx`), fora da transição de cena. `format` é opcional (default `"number"`): `"currency-brl"` → `R$ 30`; `"minutes-hm"` → `2h00` / `45min` (`Math.floor(min/60)`h + resto, ou só `Xmin` se < 60). **Valores negativos nunca aparecem no HUD** — são exibidos como `0` (`Math.max(0, valor)`); a variável em si pode ir negativa internamente para fins de lógica/condição, só a exibição é grampeada.
- **Regra inegociável — engine agnóstica:** `components/` e `lib/engine.ts` **nunca** hardcodam nomes de variável (`"dinheiro"`, `"tempo"`, etc.) nem sabem o que cada `format` "significa" no domínio da história — tudo isso vem do `content.json`. Uma história nova pode inventar qualquer variável sem tocar no motor.

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
- **Narração:** `NarrationButton` fala o texto da cena e depois as escolhas, via `SpeechSynthesisUtterance` encadeados em `pt-BR`; a narração é cancelada ao trocar de cena. Os controles só aparecem se o navegador suportar `speechSynthesis`. Três botões lado a lado: **Reiniciar** ⏮ (desabilitado quando não há narração ativa; reinicia a cena do zero), **Ouvir cena** (alterna Pausar ⏸/Continuar ▶ via `speechSynthesis.pause()/resume()`, sem cancelar a fala), e a **velocidade**, que cicla entre 0,75×/1×/1,5×/2×/3× (rótulo textual, não só cor). Mudar a velocidade durante uma fala **continua da última palavra ouvida** (rastreada via `onboundary`), não reinicia do começo — a Web Speech API não permite alterar o `rate` de uma fala em andamento, então o motor cancela e recomeça um novo `SpeechSynthesisUtterance` a partir dali. Uma região local `role="status"` (`sr-only`, junto do botão — não a região da cena) anuncia a mudança de velocidade. **Cuidado com cache do Turbopack:** classes Tailwind arbitrárias novas (ex.: `min-w-[5rem]`) às vezes não aparecem no CSS de um dev server já rodando há muito tempo; se um estilo novo não surtir efeito visualmente, apague `.next/` e reinicie `pnpm dev` antes de investigar o componente.
- **Compartilhar:** `ShareButton` é um `<button>` real com `aria-label` claro; a confirmação "Link copiado!" fica num `role="status"` **local ao botão** (não na região da cena) — isso não conflita com a regra de não combinar `aria-live` + foco no **conteúdo da cena**.
- **HUD (estado leve):** `components/Hud.tsx` usa `aria-live="polite"` — é uma região **separada** da cena (a cena usa gestão de foco, nunca `aria-live`). Ao mudar de nó, o HUD pode anunciar a variável alterada enquanto o foco vai para o heading da cena nova, sem duplicar leitura porque são regiões diferentes.
- **Imagem de cena (opcional):** ao trocar de nó, o foco continua indo **só** para o heading do texto (`headingRef`) — **nunca** para a imagem. A imagem (`<img>`, via `next/image` em `components/SceneImage.tsx`) não é focável e não recebe `tabIndex`. Ela vem **depois** do texto na ordem de leitura/DOM. `imageAlt` é obrigatório sempre que houver `image` e não deve duplicar o texto narrado (ver seção 6 e o validador). O contêiner reserva `aspect-[16/9]` fixo para não causar layout shift, e a imagem nunca cobre texto nem botões de escolha.
- **Textos escritos para soar bem em narração:** sem CAIXA ALTA solta, sem emojis decorativos no conteúdo lido.

## 9. Escopo e roadmap

- **MVP (atual):** duas histórias do Juca rodando, acessíveis, com narração por Web Speech API e verificação manual via Playwright; a segunda história (`juca-churrasco`) introduz o **estado leve** opcional (`variables`/`hud`/`onEnter`/`condition`/`effects`, seção 6).
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
- **Não hardcodar nomes de variável de estado** (`"dinheiro"`, `"tempo"`, etc.) em `components/` ou `lib/engine.ts` — isso pertence só ao `content.json` de cada história (ver seção 6).

---

**Mantenha este CLAUDE.md atualizado sempre que a arquitetura, os comandos ou as convenções mudarem.**
