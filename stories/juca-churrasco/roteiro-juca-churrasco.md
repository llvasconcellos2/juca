# Juca e a Corrida do Churrasco
### História interativa — Rota do Ônibus (v1) + Uber de resgate

**Personagem:** Juca, jacaré cego, esperto e brincalhão.
**Missão:** sair do Pórtico de Joinville e chegar ao churrasco na casa de carnes **Don Toro** (curso de assador para pessoas com deficiência visual, do **IVIS** / Frank Duarte).
**Público:** 7 a 14 anos. **Idioma:** PT-BR. **Tom:** comédia de perrengue — os obstáculos vêm do mundo mal projetado, nunca da cegueira do Juca, que é sempre competente (bengala, celular acessível, pedir ajuda ao motorista/fiscal, nariz campeão) e resolve tudo com bom humor.

---

## Decisões travadas
- **Tom:** obstáculo do mundo + competência do Juca. Sem beco sem saída; todo galho ruim sempre oferece uma saída digna.
- **Rota:** Ônibus primeiro (esta v1). Uber completo a partir do Pórtico vem em seguida.
- **Estado:** JSON com estado leve (`dinheiro` + `tempo`).
- **Conexão pedida:** quando o ônibus dá errado, se o Juca ainda tem dinheiro, ele pode chamar um Uber (opção condicionada a `dinheiro >= 15`).

---

## Modelo de dados (estado) — para o Claude Code

O JSON estende o formato de grafo de nós com estado leve:

- Topo do arquivo: `variables` (valores iniciais) e `hud` (o que mostrar na tela).
- Em cada **nó**: campo opcional `onEnter` — lista de efeitos aplicados **ao entrar** no nó.
- Em cada **escolha**: campos opcionais `condition` (a escolha só aparece se a condição for verdadeira) e `effects` (aplicados **ao escolher**).

Formato de um efeito: `{ "var": "tempo", "op": "-=", "value": 10 }` — `op` ∈ `-=`, `+=`, `=`.
Formato de uma condição: `{ "var": "dinheiro", "op": ">=", "value": 15 }` — `op` ∈ `>=`, `<=`, `==`, `>`, `<`.

A engine deve: aplicar `onEnter` ao renderizar o nó; ao listar escolhas, ocultar as que têm `condition` falsa; ao clicar, aplicar `effects` e navegar para `target`. Conteúdo continua separado da engine.

**Variáveis iniciais:** `dinheiro = 30`, `tempo = 120` (minutos até o evento). HUD mostra os dois.

---

## Mapa de nós

```
inicio  (Pórtico — R$30, 2h)
 ├─ [Ônibus] → on_ir_ponto
 │    ├─ on_ponto_sozinho ─┐
 │    └─ on_ponto_ajuda ───┴→ on_no_ponto
 │           ├─ on_onibus_errado ─→ on_terminal   (ou → Uber de resgate*)
 │           ├─ on_pergunta_ponto ─→ on_terminal
 │           └─ on_pergunta_motorista ─→ on_terminal
 │                  ├─ on_terminal_sozinho ─┐
 │                  ├─ on_terminal_pessoa ──┼→ on_no_onibus_certo
 │                  └─ on_terminal_fiscal ──┘
 │                         ├─ on_desceu_errado ─→ on_chegada_pe  (ou → Uber de resgate*)
 │                         ├─ on_aviso_passageiro ─→ on_chegada_pe
 │                         └─ on_aviso_motorista ──→ on_chegada_pe
 │                                └─ on_chegada_pe ─→ final_chegou
 └─ [Uber] → uber_chamar → uber_cancelou → uber_encontrar → uber_viagem
                ├─ uber_atento → uber_porta → final_chegou
                └─ uber_distraido → (Uber de novo* / pedir ajuda) → on_chegada_pe → final_chegou

* Uber de resgate (na rota do ônibus) e "chamar outro Uber" (lugar errado) só aparecem
  se dinheiro >= 15. A opção de pedir ajuda a pé nunca depende de dinheiro (sem travas).
```

---

## História completa (por nó)

### inicio
O sol tava se escondendo quando o Juca desceu no Pórtico de Joinville, aquele arcão gigante na entrada da cidade. No bolso, trinta reais. No coração, uma fome de leão... digo, de jacaré.

— Que dia, hein! O pessoal lá do IVIS me convidou pra um churrasco na casa de carnes Don Toro. Disseram que até vão me ensinar a assar carne! — o Juca deu uma abanada no rabo de empolgação. — Preciso chegar lá depressa. Humm, já tô sentindo o cheiro...

Ele puxou o celular, que fala tudo em voz alta pra ele.

— Ó: de Uber dá quinze pila e uns quinze minutinhos. De ônibus, pra quem é cego que nem eu, é de graça! Só que dá mais trabalho... Faltam duas horas. Bora resolver.

**Escolhas:**
1. De ônibus (é de graça — e o Juca topa a aventura) → *on_ir_ponto*
2. De Uber (rapidinho, mas leva quinze reais) → *uber_chamar* · efeito: `dinheiro -= 15`

### on_ir_ponto  ·  `tempo -= 5`
— Ônibus então! Só que tem um problema: não existe um aplicativo bom que diga onde fica o ponto. O mundo esqueceu da gente de novo — resmungou o Juca, rindo. — Tudo bem, a bengala e a boca resolvem.

Ele precisa achar o ponto de ônibus. Como faz?

**Escolhas:**
1. Ir sozinho, tateando com a bengala → *on_ponto_sozinho*
2. Pedir informação e seguir a orientação → *on_ponto_ajuda*

### on_ponto_sozinho  ·  `tempo -= 10`
O Juca foi batendo a bengala no chão, tec-tec-tec, contando os passos. A bengala achou um poste e ele quase abraçou, todo feliz:

— Achei o ponto!
— Isso é uma placa de trânsito, meu bem — riu uma senhora. — O ponto é ali, uns dez passos pra frente.
— Ah, essa placa tava se passando por ponto! — brincou o Juca, e seguiu firme até o ponto de verdade.

→ *on_no_ponto*

### on_ponto_ajuda  ·  `tempo -= 5`
— Moço, por favor, onde fica o ponto de ônibus? — perguntou o Juca.
— É atravessando a rua. Vem, eu te levo — disse o rapaz.

Atravessaram juntos e, num instante, o Juca já tava no ponto.

— Viu? Pedir ajuda não tira pedaço. Tira é o atraso! — riu ele.

→ *on_no_ponto*

### on_no_ponto
No ponto, os ônibus iam chegando e saindo, vum, vum. Só que o Juca não consegue ler o número escrito na frente.

— E agora, qual é o meu? Não vou de adivinhação... ou vou?

Como o Juca descobre o ônibus certo?

**Escolhas:**
1. Entrar em qualquer ônibus e torcer → *on_onibus_errado*
2. Perguntar pra alguém no ponto → *on_pergunta_ponto*
3. Perguntar direto pra cada motorista → *on_pergunta_motorista*

### on_onibus_errado  ·  `tempo -= 20`
O Juca entrou no primeiro ônibus que parou. Depois de umas curvas, sentiu que aquilo tava indo pro lado errado.

— Ô motorista, esse aqui passa perto do Don Toro?
— Esse não, amigo! Mas relaxa: desce no próximo terminal que eu te explico o caminho certo.

O Juca desceu num terminal, com um tantão de tempo a menos. Nada de pânico — mas agora tem que decidir.

**Escolhas:**
1. Achar o ônibus certo no terminal (com calma) → *on_terminal*
2. Chamar um Uber pra não perder o churrasco (15 reais) → *uber_chamar* · condição: `dinheiro >= 15` · efeito: `dinheiro -= 15`

### on_pergunta_ponto  ·  `tempo -= 12`
— Moça, qual ônibus vai pro lado do Don Toro? — O Juca perguntou pra uma pessoa no ponto, que apontou o ônibus certo (e ainda deu boa sorte). Ele embarcou tranquilo, rumo ao terminal.

→ *on_terminal*

### on_pergunta_motorista  ·  `tempo -= 12`
O Juca esperou e perguntou pra cada motorista que parava. No ônibus certo, o motorista foi um doce:

— Senta aqui pertinho de mim que eu te aviso, jacaré.

Rumo ao terminal, sentindo o ventinho na cara.

→ *on_terminal*

### on_terminal
O terminal era um zunzunzum de gente, ônibus e anúncios ecoando. Agora o Juca precisa fazer a baldeação: achar a plataforma do ônibus que passa pertinho do Don Toro, na Max Colin. E, de novo, nenhum aplicativo pra ajudar.

Como ele faz?

**Escolhas:**
1. Procurar a plataforma sozinho → *on_terminal_sozinho*
2. Pedir pra alguém na plataforma → *on_terminal_pessoa*
3. Pedir ajuda a um fiscal do terminal → *on_terminal_fiscal*

### on_terminal_sozinho  ·  `tempo -= 12`
O Juca saiu tateando entre as plataformas. Quase entrou num ônibus pro lado contrário — de novo!

— Ei, jacaré aventureiro, esse aí vai pro outro canto da cidade — avisou um vendedor de amendoim, rindo.
— Ainda bem que teu amendoim tem GPS! — respondeu o Juca. O vendedor apontou a plataforma certa.

→ *on_no_onibus_certo*

### on_terminal_pessoa  ·  `tempo -= 6`
— Moça, qual plataforma vai pro lado da Max Colin? — Uma estudante pegou o Juca pelo braço e o levou certinho até a plataforma.
— Valeu! Você é gente boa igual carne de primeira — brincou ele.

→ *on_no_onibus_certo*

### on_terminal_fiscal  ·  `tempo -= 5`
O Juca chamou um fiscal do terminal. O fiscal em pessoa o levou até a plataforma certa e ainda deu um toque no motorista:

— Ó, o Juca desce perto do Don Toro, dá um help pra ele. — Serviço de primeira.

→ *on_no_onibus_certo*

### on_no_onibus_certo
Ônibus certo, Juca a bordo, rabo acomodado no corredor. Agora o desafio é não passar do ponto — a rua do Don Toro é a Max Colin, mas o Juca não enxerga as placas passando pela janela.

Como ele garante que desce na hora certa?

**Escolhas:**
1. Contar os pontos de cabeça e arriscar → *on_desceu_errado*
2. Pedir pra um passageiro avisar → *on_aviso_passageiro*
3. Pedir pro motorista avisar o ponto → *on_aviso_motorista*

### on_desceu_errado  ·  `tempo -= 15`
O Juca contou os pontos... mas um congestionamento bagunçou a conta e ele desceu cedo demais. Farejou o ar:

— Hmm, esse cheiro aqui é de padaria, não de churrasco. Desci adiantado!

Ele tá numa rua que não conhece. Sem drama — mas precisa decidir.

**Escolhas:**
1. Pedir orientação a alguém na rua e ir a pé → *on_chegada_pe*
2. Chamar um Uber curtinho até o Don Toro (15 reais) → *uber_chamar* · condição: `dinheiro >= 15` · efeito: `dinheiro -= 15`

### on_aviso_passageiro  ·  `tempo -= 10`
— Pode deixar que eu te aviso a hora de descer! — disse uma senhora animada, que já foi puxando papo. Falou do neto, do tempo, e de um tal licor aromatic da Bartenike que ia rolar num evento.

— Aromatic? É o do churrasco que eu tô indo! — riu o Juca. — Dizem que é parecido com aquele Jägermeister, só que da região, de Garuva. Que Jägermeister que nada, o aromatic é muito mais saboroso!

E, no ponto certo: — É agora, meu querido! — E era mesmo.

→ *on_chegada_pe*

### on_aviso_motorista  ·  `tempo -= 10`
— Motorista, me avisa quando for o ponto do Don Toro, na Max Colin? — Claro, senta aí na frente.

No ponto certo, o motorista avisou e ainda deu o mapa falado:

— Desce, vira à direita, uns cinquenta metros, o Don Toro é na esquina. Bom churrasco!

→ *on_chegada_pe*

### on_chegada_pe
O Juca desceu e — aí sim! — o nariz campeão entrou em ação. No ar, um cheirão de carne assando (carne boa, do Frigorífico São João) e aquela fumacinha de carvão.

— Esse carvão não tá de brincadeira. Falaram que o negócio ia pegar fogo... até o nome do carvão é Pega Fogo!

Como o Juca acha a porta do Don Toro?

**Escolhas:**
1. Seguir o cheiro do churrasco (confia no nariz!) → *final_chegou*
2. Pedir pra alguém apontar a porta → *final_chegou*

### final_chegou  ·  `tempo -= 5`  ·  **FINAL**
Guiado pelo faro (e por um moço super gente boa), o Juca empurrou a porta do Don Toro. Uma salva de palmas!

— Chegou o Juca! — gritou o pessoal do IVIS.

Lá dentro, a festa: carne do Frigorífico São João na brasa do Pega Fogo, pão de alho da Santa Massa saindo quentinho, suco Life gelado pra todo mundo — e, pros adultos, uma garrafa do tal aromatic pra degustar.

— Cheguei! Suado, mas cheguei. E olha, até sobrou troco — riu o Juca, chacoalhando o bolso.

O Frank veio receber:

— É isso, Juca. O importante é a gente estar junto, na rua, no mundo, vivendo. Hoje você chegou até aqui sozinho. Semana que vem, você tá pilotando a churrasqueira!

O Juca abriu o maior sorrisão de dentes.

— Então bora aprender, que esse jacaré vai virar mestre churrasqueiro. Cadê meu avental?

Fim.

---

## Rota do Uber (detalhada) — usada pela abertura e pelos resgates

### uber_chamar
O Juca pegou o celular, que lê tudo em voz alta pra ele, e chamou o Uber.

— Partida: aqui. Destino: Don Toro, na Max Colin. Feito! O app diz que o carro tá a uns dez minutos... coisa de hora do rush.

Dez minutos parado na rua. E esperar é a parte chata: o Juca tem que ficar num lugar seguro, porque de longe ele não vê quem vem nem quem vai. Onde ele espera?

**Escolhas:**
1. Encostado num canto protegido, longe do movimento → *uber_cancelou*
2. Na beira da calçada, marcando o lugar com a bengala → *uber_cancelou*
3. Perguntar pra alguém ali qual é o canto mais seguro → *uber_cancelou*

### uber_cancelou  ·  `tempo -= 10`
O carro foi chegando... nove minutos... três... um... e — pluft — o motorista cancelou. Sem avisar nada, sem dar bom dia.

— Ah, qual é! — bufou o Juca. Mas logo respirou fundo e riu. — Calma, jacaré. O problema é o aplicativo, não sou eu. A gente chama outro e pronto.

E chamou de novo.

**Escolhas:**
1. Chamar outro Uber e esperar → *uber_encontrar*

### uber_encontrar  ·  `tempo -= 8`
Dessa vez engatou. O app avisou: o carro chegou! Só que a mira do GPS é meio torta — o carro pode estar bem na frente do Juca ou lá longe, uns trinta metros. E ele não vê pra onde olhar.

Como o Juca encontra o carro?

**Escolhas:**
1. Falar o nome do motorista bem alto e dar um assobio → *uber_viagem*
2. Pedir pra alguém do lado ajudar a achar o carro → *uber_viagem*

### uber_viagem  ·  `tempo -= 4`
— Juca? — Sou eu! — E entrou no carro, todo satisfeito.

O Juca já fez esse trajeto de cabeça um monte de vezes: sabe que do centro até a Max Colin é rapidinho. Então, enquanto o carro anda, ele fica de ouvido ligado no caminho.

Como o Juca vai na viagem?

**Escolhas:**
1. Atento ao trajeto e ao relógio, como sempre → *uber_atento*
2. Relaxado, só curtindo a música do rádio → *uber_distraido*

### uber_atento  ·  `tempo -= 8`  ·  (o golpe das voltinhas, pego no flagra)
Depois de umas curvas a mais do que devia, o Juca franziu o focinho:

— Ô chefe, tá dando muita volta, hein? Do centro pra Max Colin não é por aqui não.

O motorista tossiu, meio sem graça:
— É... o trânsito, né...
— Trânsito uma ova! — riu o Juca, firme, mas de bom humor. — Pode ir reto que eu conheço esse caminho de ouvido.

Pego no flagra, o motorista foi direto pro Don Toro — e ainda ficou de bem com o Juca.

→ *uber_porta*

### uber_porta
Chegaram bem na porta do Don Toro. O motorista, agora camarada, se ofereceu:

— Quer que eu te deixe certinho na entrada?

Como o Juca faz?

**Escolhas:**
1. Aceitar e ser levado até a porta → *final_chegou*
2. Agradecer e achar a entrada pelo cheiro do churrasco → *final_chegou*

### uber_distraido  ·  `tempo -= 8`  ·  (deixado no lugar errado)
O Juca relaxou na música e deixou o motorista tocar o barco. Só que, quando o carro parou e ele desceu, o nariz campeão deu o alerta:

— Peraí... cadê o cheiro de churrasco? Isso aqui não é o Don Toro!

O motorista já tinha ido embora, achando que tinha deixado no lugar certo. O Juca ficou numa esquina que não conhecia. A bengala protege dos obstáculos, mas não acha uma porta sozinha. Bora se virar.

**Escolhas:**
1. Chamar outro Uber curtinho até o endereço certo (15 reais) → *on_chegada_pe* · condição: `dinheiro >= 15` · efeitos: `dinheiro -= 15`, `tempo -= 8`
2. Pedir pra alguém na rua te levar até o Don Toro → *on_chegada_pe* · efeito: `tempo -= 15`

(Os dois caminhos reencontram `on_chegada_pe` — o Juca chega perto do Don Toro e acha a porta pelo cheiro.)

---

## Menções aos patrocinadores (conferir grafias antes de publicar!)

Como são empresas reais num contexto promocional, **confirme comigo/Frank a grafia exata** de cada nome:
- **IVIS** — Instituto Visual de Inclusão Social (organizador) — citado no início e no final.
- **Don Toro** — casa de carnes (local) — início e final.
- **Frigorífico São João** (de São João do Itaperiú) — as carnes — final.
- **Carvão Pega Fogo** — o carvão — chegada a pé e final (com a sua piada do "vai pegar fogo").
- **Bartenike / licor aromatic** (de Garuva) — a brincadeira com o Jägermeister — no ônibus (passageiro) e final.
- **Santa Massa** — pão de alho — final.
- **Suco Life** — final.

Dúvidas de grafia que anotei: "Bartenike" e "aromatic" (maiúscula/minúscula?), "Santa Massa" (ou "Santa da Massa"?), "Don Toro" (ou "Do Touro"?). Melhor bater o martelo com o Frank.

---

## Notas de acessibilidade (para o protótipo)
- Cada nó = bloco de texto + lista de `<button>` reais (Tab / Enter / Espaço), rótulo claro e único.
- Ao trocar de nó, mover o foco pro início do texto novo (heading com `tabindex="-1"` + `.focus()`).
- Não usar `aria-live` e movimentação de foco ao mesmo tempo pro mesmo conteúdo.
- HUD (dinheiro/tempo): quando um valor mudar, anunciar de forma discreta (ex.: `aria-live="polite"` só no HUD) — sem competir com a leitura da cena.
- Texto já escrito para soar bem em narração (sem CAIXA ALTA solta nem emojis decorativos).

---

## Estado atual e próximo passo
As **duas rotas estão completas** (ônibus e Uber), unificadas e com estado leve. Grafo validado: 25 nós, sem destino quebrado, sem beco sem saída, sem nó inalcançável e sem trava por falta de dinheiro (a opção de pedir ajuda a pé nunca depende de dinheiro).

Próximo: entregar o `historia-juca-churrasco.json` ao Claude Code para validar de novo no projeto e integrar ao Next.js (implementando `variables`, `hud`, `onEnter`, `condition` e `effects` conforme o schema acima). Ideias opcionais para depois: finais que reconhecem quanto tempo/dinheiro sobrou, e a geração de uma imagem por cena.
