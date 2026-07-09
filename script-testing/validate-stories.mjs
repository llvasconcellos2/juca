// Valida o grafo de nós de todas as histórias em stories/<slug>/content.json:
// - `start` existe; todo `target` de escolha existe;
// - todo nó não-final tem ao menos uma escolha; nós finais não têm escolhas;
// - nenhum nó fica inalcançável a partir de `start`;
// - nenhum nó com escolhas fica travado por condição (todas as choices com `condition`).
//
// Uso: node script-testing/validate-stories.mjs

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storiesDir = path.join(__dirname, "..", "stories");

function validateStory(slug, data) {
  const errors = [];
  const { start, nodes } = data;

  if (!nodes || typeof nodes !== "object") {
    return [`nodes ausente ou inválido`];
  }
  if (!start || !nodes[start]) {
    errors.push(`start "${start}" não existe em nodes`);
  }

  for (const [id, node] of Object.entries(nodes)) {
    const choices = node.choices ?? [];

    if (node.isEnding) {
      if (choices.length > 0) errors.push(`nó final "${id}" tem choices (deveria ser [])`);
    } else if (choices.length === 0) {
      errors.push(`nó não-final "${id}" não tem nenhuma escolha`);
    }

    for (const choice of choices) {
      if (!choice.target || !nodes[choice.target]) {
        errors.push(`nó "${id}": escolha "${choice.label}" aponta para target inexistente "${choice.target}"`);
      }
    }

    if (!node.isEnding && choices.length > 0 && choices.every((c) => c.condition)) {
      errors.push(`nó "${id}": todas as escolhas têm condition — o jogador pode ficar sem opção disponível`);
    }
  }

  if (start && nodes[start]) {
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length > 0) {
      const id = queue.shift();
      for (const choice of nodes[id]?.choices ?? []) {
        if (choice.target && nodes[choice.target] && !seen.has(choice.target)) {
          seen.add(choice.target);
          queue.push(choice.target);
        }
      }
    }
    for (const id of Object.keys(nodes)) {
      if (!seen.has(id)) errors.push(`nó "${id}" é inalcançável a partir de "${start}"`);
    }
  }

  return errors;
}

const slugs = readdirSync(storiesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let totalErrors = 0;

for (const slug of slugs) {
  const contentPath = path.join(storiesDir, slug, "content.json");
  let data;
  try {
    data = JSON.parse(readFileSync(contentPath, "utf-8"));
  } catch (err) {
    console.error(`[${slug}] não foi possível ler content.json: ${err.message}`);
    totalErrors += 1;
    continue;
  }

  const errors = validateStory(slug, data);
  if (errors.length === 0) {
    const nodeCount = Object.keys(data.nodes ?? {}).length;
    console.log(`[${slug}] OK — ${nodeCount} nós, grafo válido.`);
  } else {
    totalErrors += errors.length;
    console.error(`[${slug}] ${errors.length} problema(s):`);
    for (const error of errors) console.error(`  - ${error}`);
  }
}

if (totalErrors > 0) {
  console.error(`\n${totalErrors} problema(s) encontrado(s) no total.`);
  process.exit(1);
} else {
  console.log(`\nTodas as ${slugs.length} histórias passaram na validação.`);
}
