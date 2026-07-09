# Juca e a Caça ao Tesouro do Rio

História interativa baseada em escolhas, **acessível a pessoas com deficiência visual — e feita para ser usada por todos**. Você lê (ou ouve) uma cena e escolhe, por botões, o que acontece a seguir.

A primeira história acompanha **Juca**, o jacaré jovem e cego do Rio Cachoeira, em Joinville, que encontra tesouros usando faro e audição. Público de 7 a 14 anos, em português.

## Acessibilidade primeiro

Esta é a premissa inegociável do projeto: a experiência precisa **funcionar de verdade** com leitores de tela (NVDA, JAWS, VoiceOver, Narrator) e navegação por teclado — não apenas "ser compatível".

- Escolhas são `<button>` reais, navegáveis por **Tab** e acionáveis por **Enter/Espaço**.
- Ao trocar de cena, o foco vai para o início do texto novo, para o leitor de tela anunciar a cena.
- Narração em voz alta em pt-BR (Web Speech API) via botão "Ouvir cena".
- Skip link, alto contraste, foco sempre visível e nenhuma informação transmitida só por cor.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (config CSS-first, sem `tailwind.config.js`)
- Gerenciador de pacotes: **pnpm**

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra <http://localhost:3000>.

### Scripts

- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — build de produção
- `pnpm start` — roda o build de produção
- `pnpm lint` — ESLint
- `pnpm typecheck` — checagem de tipos

### Verificação manual (acessibilidade)

`verify-juca.mjs` é um script Playwright que percorre a história nos dois ramos, confere afordâncias de acessibilidade e tira screenshots em desktop e mobile. Com o dev server no ar:

```bash
node verify-juca.mjs
```

## Conteúdo separado do motor

O motor (`components/`) é genérico; o conteúdo vive em `data/historia-juca.json` como um grafo de nós (cada nó tem `text`, `isEnding` e `choices`). Para editar ou ampliar a história, mexa apenas no JSON. Os detalhes de arquitetura e o passo a passo para adicionar cenas/histórias estão em [`CLAUDE.md`](CLAUDE.md); o roteiro-fonte está em [`roteiro.md`](roteiro.md).
