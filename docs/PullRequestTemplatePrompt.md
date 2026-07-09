Você é o assistente do Claude Code neste repositório. Tarefa: criar o arquivo de
template de Pull Request em .github/pull_request_template.md (crie a pasta .github
se não existir).

Antes de escrever, INSPECIONE o repositório para manter o template coerente:

- se existir CONTRIBUTING.md e/ou CLAUDE.md, leia-os e alinhe os itens do checklist
  aos comandos e convenções REAIS já documentados (sem duplicar textos longos —
  referencie quando fizer sentido);
- confirme no package.json os comandos reais de lint, typecheck, build e testes;
- veja se há testes configurados (vitest/jest/playwright). Se algum comando não
  existir, escreva o item como "não configurado ainda" em vez de inventar.
  Se algo não estiver claro, marque "TODO:" e liste as dúvidas para mim no fim da SUA
  resposta (não dentro do arquivo).

Escreva o template em português, enxuto (o autor do PR deve conseguir preencher em
poucos minutos), com estas seções em markdown:

1. Descrição — o que muda e por quê (2–3 linhas).

2. Tipo de mudança — checklist: correção de bug, nova funcionalidade, novo conteúdo
   (história/cena), documentação, refatoração, outro.

3. Como testei — espaço curto para o autor descrever o teste manual.

4. Checklist de qualidade — caixas de seleção com os comandos REAIS do projeto:
   - lint passa
   - typecheck passa
   - build passa
   - testes passam (ou "não configurado ainda")
     (use os comandos reais entre crases, ex.: `npm run lint`.)

5. PORTÃO DE ACESSIBILIDADE (obrigatório para qualquer mudança de UI) — caixas de
   seleção:
   - [ ] Escolhas são <button> reais, navegáveis por Tab e acionáveis por
         Enter/Espaço, com rótulo claro e único
   - [ ] Ao trocar de cena, o foco vai para o início do texto novo (heading com
         tabindex="-1" + .focus())
   - [ ] NÃO uso aria-live e movimentação de foco ao mesmo tempo para o mesmo conteúdo
   - [ ] Nenhuma informação transmitida só por cor; alto contraste; fonte ampliável;
         sem armadilhas de teclado
   - [ ] Testei navegando 100% por teclado
   - [ ] Testei com um leitor de tela (indicar qual: NVDA / JAWS / VoiceOver /
         Narrator) e navegador
   - [ ] Não se aplica (mudança não afeta a UI) — justificar
         Inclua um campo curto "Como testei a acessibilidade:" para o autor descrever.

6. Checklist de conteúdo (só quando o PR adiciona/edita história ou cena) — caixas:
   - [ ] Conteúdo separado da engine (dados, não código acoplado)
   - [ ] Idioma PT-BR e linguagem adequada ao público de 7 a 14 anos
   - [ ] Texto escrito para soar bem em narração (sem CAIXA ALTA solta nem emojis
         decorativos)
   - [ ] Grafo de nós válido: nó inicial definido, todos os destinos de escolha
         existem, sem becos sem saída não intencionais

7. Issues relacionadas — linha para referenciar (ex.: "Closes #").

Formato: use sintaxe de checklist do GitHub (- [ ]) para que apareça clicável no PR.
Mantenha comentários HTML (<!-- ... -->) curtos como dicas onde ajudar, mas sem poluir.
Não inclua segredos/chaves. Ao terminar, mostre o conteúdo final e a lista de
TODOs/dúvidas.
