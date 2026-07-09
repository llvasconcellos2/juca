# Contribuindo com o Juca

Plataforma de **ficção interativa acessível** — a primeira história é a **Grande Caça ao Tesouro do Rio Cachoeira**, estrelada pelo jacaré **Juca**. É um projeto de **foco social e de inclusão**: a mesma experiência serve quem enxerga e quem navega por leitor de tela e teclado. Toda contribuição é bem-vinda — código, conteúdo (histórias/cenas), acessibilidade, revisão de texto ou reporte de bugs.

Antes de começar, vale ler o [CLAUDE.md](CLAUDE.md), que descreve a arquitetura, as convenções e o princípio inegociável de acessibilidade em detalhe. Este guia é o resumo prático.

## 1. Começando (setup)

Requisitos e comandos reais do projeto (`package.json`):

- **Node:** major **22** (ver `.nvmrc`; `engines.node = ">=22 <23"`). Use `nvm use` para alinhar.
- **Gerenciador de pacotes:** **pnpm** (há `pnpm-lock.yaml`). Use pnpm, não npm/yarn.

```bash
pnpm install     # instala dependências
pnpm dev         # sobe o dev server em http://localhost:3000
```

Outros comandos: `pnpm build` (build de produção), `pnpm start` (roda o build).

## 2. Fluxo de contribuição

- Crie sua branch a partir de **`main`**.
- **Nome da branch** (proposta): `tipo/descricao-curta` — ex.: `feat/nova-cena-caverna`, `fix/foco-narracao`, `docs/contributing`, `a11y/skip-link`.
- **Mensagem de commit:** o histórico já segue **Conventional Commits** (ex.: `fix: pnpm-lock`). Mantenha o padrão: `tipo: resumo no imperativo`, com tipos como `feat`, `fix`, `docs`, `refactor`, `chore`, `a11y`.
- Abra um Pull Request contra `main` descrevendo o que muda e **como testou** (especialmente acessibilidade — ver seção 5).

## 3. Antes de abrir um Pull Request

Rode localmente os comandos reais do projeto:

```bash
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit (TypeScript strict)
pnpm build        # garante que compila
```

**Testes automatizados:** não configurados ainda (TODO). Há apenas uma verificação manual com Playwright que percorre a história de ponta a ponta e confere afordâncias de acessibilidade:

```bash
pnpm dev              # em um terminal
node verify-juca.mjs  # em outro, depois que localhost:3000 subir
```

## 4. Portão de acessibilidade (obrigatório)

Este é o coração do projeto. **Nenhuma contribuição que afete a UI é aceita sem cumprir todos os itens abaixo:**

- **Escolhas são `<button>` reais** (nunca `div`), navegáveis por **Tab** e acionáveis por **Enter/Espaço**, com rótulo claro e único.
- **Ao trocar de cena, o foco vai para o início do texto novo** — um heading com `tabindex="-1"` que recebe `.focus()` (ver `headingRef` em `StoryEngine.tsx` / `SceneView.tsx`).
- **Não usar `aria-live` e movimentação de foco ao mesmo tempo** para o mesmo conteúdo (causa leitura duplicada). O projeto usa gestão de foco; não adicione `aria-live` na mesma região.
- **Nenhuma informação transmitida só por cor**; alto contraste; fonte ampliável; sem armadilhas de teclado; foco sempre visível (`:focus-visible`).
- **Textos escritos para soar bem em narração**: sem CAIXA ALTA solta, sem emojis decorativos no conteúdo lido.
- **Teste manual mínimo antes do PR:** navegue **100% por teclado** e valide com pelo menos **um leitor de tela** (NVDA, JAWS, VoiceOver ou Narrator).

**No PR, descreva como testou a acessibilidade** (qual leitor de tela, qual navegador, e se a navegação por teclado funcionou de ponta a ponta).

## 5. Contribuindo com conteúdo (novas histórias/cenas)

O conteúdo é **totalmente separado da engine**: histórias vivem em `data/*.json` (tipadas por `lib/types.ts`), nunca dentro dos componentes. Uma história é um grafo de nós — um nó inicial (`start`) e um mapa `nodes`; cada nó tem `text`, `isEnding` e uma lista de `choices` com `label` (rótulo do botão) e `target` (id do próximo nó).

```jsonc
{
  "start": "inicio",
  "nodes": {
    "inicio": {
      "text": "Parágrafos...\n\nSeparados por linha em branco.",
      "isEnding": false,
      "choices": [{ "label": "Texto do botão", "target": "id_do_proximo_no" }]
    },
    "um_final": { "text": "...\n\nFim.", "isEnding": true, "choices": [] }
  }
}
```

**Adicionar uma CENA** a uma história existente:

1. Em `data/historia-juca.json`, adicione uma entrada em `nodes` com um `id` novo (`text`, `isEnding`, `choices`) e aponte para ela a partir do `target` de alguma escolha.
2. Adicione o rótulo humano correspondente em **`SCENE_LABELS`** (em `components/StoryEngine.tsx`) para o **mesmo `id`** — usado no heading/narração. `SCENE_LABELS` e os `id`s do JSON devem ficar sempre em sincronia.
3. Todo `target` deve apontar para um `id` existente; nó final tem `isEnding: true` e `choices: []`.

**Adicionar uma HISTÓRIA nova:** crie um novo JSON em `data/` seguindo o mesmo schema. (Seleção/roteamento de histórias ainda não existe — ver TODOs no CLAUDE.md.)

**Regras de conteúdo:** PT-BR é o idioma padrão; linguagem adequada ao público de **7 a 14 anos**; texto pensado para **narração** (sem CAIXA ALTA solta nem emojis decorativos).

## 6. Estilo de código

- **TypeScript** em modo `strict`; conteúdo do JSON tipado por `lib/types.ts`.
- **Componentes:** um componente por arquivo, PascalCase; `"use client"` só onde há estado/efeitos/eventos.
- **Estilos:** Tailwind v4 utilitário no JSX (sem `tailwind.config.js`); tokens e fontes vivem no `@theme inline` de `app/globals.css` — use `var(--font-story)` e `var(--font-ui)`, não hardcode fontes.
- **Imports:** use o alias `@/*`.
- Não há Prettier configurado (TODO). Rode `pnpm lint` e `pnpm typecheck` antes do PR. Detalhes completos das convenções estão no [CLAUDE.md](CLAUDE.md).

## 7. Reportando problemas

Abra uma issue com:

- O que aconteceu vs. o que era esperado, e **passos para reproduzir**.
- Navegador e sistema operacional.
- **Se for bug de acessibilidade:** informe **qual leitor de tela e navegador** foram usados (ex.: NVDA + Firefox) e se a falha ocorre também só por teclado.

## 8. Código de conduta e licença

- **Código de conduta:** ainda não há arquivo (TODO — sugerimos adicionar um `CODE_OF_CONDUCT.md`; o foco social e inclusivo do projeto pede um ambiente acolhedor e respeitoso).
- **Licença:** ainda não há arquivo `LICENSE` na raiz (TODO — definir e adicionar).

## Checklist do Pull Request

Cole na descrição do seu PR:

```markdown
- [ ] `pnpm lint` passa
- [ ] `pnpm typecheck` passa
- [ ] `pnpm build` passa
- [ ] Verificação manual (`node verify-juca.mjs`) executada, quando aplicável
- [ ] Escolhas são <button> reais, navegáveis por Tab e Enter/Espaço, com rótulo claro
- [ ] Ao trocar de cena o foco vai para o texto novo (heading tabindex="-1" + .focus())
- [ ] Nenhuma informação só por cor; alto contraste; sem armadilhas de teclado
- [ ] Textos adequados à narração (sem CAIXA ALTA solta nem emojis decorativos)
- [ ] Testei com leitor de tela e só por teclado (descrevi qual leitor/navegador abaixo)

Como testei a acessibilidade:
```
