# Juca e a Caça ao Tesouro do Rio

### Roteiro para o protótipo de história interativa

**Personagem principal:** Juca, um jacaré jovem e cego do Rio Cachoeira (Joinville).
**Público-alvo:** 7 a 14 anos.
**Tom:** muito humor, leve, com mensagem de inclusão embutida (sem lição de moral pesada).

## Estrutura (mapa de escolhas)

```
[INÍCIO]  introdução da história
   ├─ Escolha 1: "Farejar"  → [CENA A]  → [FINAL A]
   └─ Escolha 2: "Escutar"  → [CENA B]  → [FINAL B]
```

Cinco telas no total: 1 introdução, 2 cenas, 2 finais. Uma decisão real (na introdução) leva a dois caminhos e dois finais diferentes — exatamente o suficiente para demonstrar a mecânica.

---

## INÍCIO (id: `inicio`)

Era noite no Rio Cachoeira, bem no coração de Joinville, e a lua boiava na água como uma bolacha gigante. Era a noite mais importante do ano: a Grande Caça ao Tesouro do Rio!

Juca, o jacaré mais esperto (e mais cego) de toda a lagoa, chegou abanando o rabo. Dona Quitéria, a capivara organizadora, apitou bem forte.

— Atenção, bicharada! Quem achar o Tesouro do Rio ganha o título de Herói da Lama!

Os outros animais cochicharam baixinho:
— Coitado do Juca... ele nem enxerga. Como é que vai achar um tesouro?

Juca abriu o maior sorrisão cheio de dentes:
— Achar tesouro com os olhos? Que nada! Eu tenho um nariz campeão e duas orelhas que escutam até fofoca de minhoca.

O apito tocou de novo e todo mundo saiu nadando feito doido. Só o Juca ficou ali, na beirada, balançando o rabo, pensando por onde começar.

**Escolhas:**

1. Farejar o ar e seguir o cheiro do tesouro. → _CENA A_
2. Ficar quietinho e escutar os segredos do rio. → _CENA B_

---

## CENA A — o faro (id: `cena_faro`)

Juca encheu o peito e... fungou tão forte que quase sugou um mosquito desavisado.

— Humm... sinto cheiro de lama, de peixe frito e do chulé do Reginaldo.

— Ei! — reclamou Reginaldo, o sapo, soltando um arroto. — Meu pé é perfumado, viu!

Mas no meio daquela zona toda, o Juca pegou um cheirinho diferente: doce, bem docinho, tipo bala de coco. Ele foi seguindo, fungando pela margem, e sem querer esbarrou na garça.

— Foi mal, dona Glória!
— Hmpf! — a garça ajeitou as penas, toda ofendida.

O cheirinho doce ia ficando mais forte... e mais forte... até o Juca parar com o focinho coladinho num arbusto escuro.

**Escolha:**

1. Continuar → _FINAL A_

---

## FINAL A (id: `final_faro`)

O Juca enfiou o focinho no arbusto e... tcharam! Não era o tesouro. Era um ninho de patinhos perdidos, tremendo de medo no escuro!

— Calma, miudezas. O Juca tá aqui. Subam no meu rabo que eu levo vocês pra casa.

Quando ele chegou na festa com a fileira de patinhos equilibrada no rabo, a mãe pata chorou de alegria e a Dona Quitéria ficou de queixo caído.

— Juca, você não achou o tesouro... — disse ela. — Você achou uma coisa muito melhor!

E foi assim que o jacaré cego virou o Herói da Lama. Porque tesouro de verdade, o Juca aprendeu, a gente acha é com o coração. (E com um nariz bem campeão, claro.)

**Fim.**

---

## CENA B — a escuta (id: `cena_ouvido`)

O Juca fechou os olhos (não que fizesse muita diferença) e ficou paradinho, igual estátua de jacaré.

— Shhh — pediu ele. — Tô ouvindo.

— Mas a gente nem falou nada! — disse Tinho, o lambari agitado, dando voltas em volta dele.
— Você não, Tinho. Eu tô ouvindo o rio.

E o Juca ouvia mesmo: o ploc das gotinhas, o ronco do Gérson dormindo numa pedra e... bem lá no fundo... um tlin, tlin, tlin bem fininho, igual sininho.

— Achei! O tesouro tá fazendo barulho! Me sigam, pessoal!

Só que ninguém se mexeu. Nenhum outro bicho conseguia escutar aquilo.

**Escolha:**

1. Continuar → _FINAL B_

---

## FINAL B (id: `final_ouvido`)

— Confiem no jacaré! — disse Juca, e mergulhou guiado só pelo som.

Tlin... tlin... cada vez mais perto. Lá no fundo do rio, presa numa raiz, estava a velha Caixa do Tesouro, com um sininho que tilintava na correnteza. O Juca puxou com os dentes e trouxe pra superfície.

Quando abriu a caixa, tinha doce pra todo mundo — e olha que tinha bicho pra caramba na festa.

— Como você achou lá no escuro? — perguntaram, espantados.
— Ah, no escuro eu jogo em casa! — riu o Juca. — E presta atenção numa coisa: de vez em quando, pra achar o que a gente procura, é melhor parar de olhar e começar a escutar.

A festa virou a maior farra que o Rio Cachoeira já viu. E o Juca? Virou o ouvido oficial do rio. (E o melhor contador de piada também.)

**Fim.**

---

## Notas para o protótipo (acessibilidade)

Para o Claude Code construir com prioridade de leitor de tela:

- Cada tela é uma "cena": um bloco de **texto** + uma **lista de botões** de escolha.
- Ao trocar de cena, **mover o foco** para o título/início do texto novo (ex.: um `<h1>`/`<h2>` com `tabindex="-1"` que recebe `.focus()`), para o leitor de tela ler a cena nova automaticamente.
- As escolhas devem ser **`<button>`** de verdade (não `div`), navegáveis por Tab e acionáveis por Enter/Espaço, com texto claro e único.
- Usar uma região com `aria-live="polite"` ou o gerenciamento de foco acima — não os dois ao mesmo tempo (evita leitura duplicada).
- Nada de informação só por cor; bom contraste; fonte ampliável.
- O texto já está escrito para soar bem em narração (sem CAIXA ALTA solta nem emojis decorativos).
- O JSON em anexo (`historia-juca.json`) é agnóstico de engine — mapeia direto para React/HTML, ou para Ink/Twine se preferir.
