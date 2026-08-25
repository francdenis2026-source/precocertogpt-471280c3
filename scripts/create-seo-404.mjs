import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('dist/index.html');
const target = path.resolve('dist/404.html');
let html = await readFile(source, 'utf8');

// O GitHub Pages não conhece as rotas internas do React: uma URL real como
// /estabelecimento/kelly-burgueria-lanchonete não existe como arquivo, então
// qualquer acesso direto (link compartilhado, F5 na página) cai neste
// 404.html. Sem este script, o visitante ficaria preso numa página de "não
// encontrado" — ou, pior, ao recarregar acabaria voltando pra Home, porque
// o caminho original se perde. Este trecho guarda o caminho pedido em
// "?/caminho" e manda o navegador para a Home com essa informação; lá,
// outro script (no index.html) lê "?/caminho", restaura a URL de verdade
// antes do React montar, e a rota certa é renderizada normalmente.
const spaRedirect = `<script>
      (function (l) {
        l.replace(
          l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "") + "/?/" +
          l.pathname.slice(1).replace(/&/g, "~and~") +
          (l.search ? "&" + l.search.slice(1).replace(/&/g, "~and~") : "") +
          l.hash
        );
      })(window.location);
    </script>`;

html = html
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Página não encontrada | PreçoCerto</title>')
  .replace(/<meta name="description"[^>]*>/i, '<meta name="description" content="A página solicitada não foi encontrada no PreçoCerto." />')
  .replace(/<meta name="robots"[^>]*>/i, '<meta name="robots" content="noindex,nofollow" />')
  .replace(/<link rel="canonical"[^>]*>/i, '')
  .replace(/<meta property="og:url"[^>]*>/i, '')
  .replace(/<div id="root">[\s\S]*?<\/div>\s*<\/body>/i, '<div id="root"></div>\n  </body>')
  .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${spaRedirect}`);

await writeFile(target, html);
console.log('SEO 404: dist/404.html criado com noindex.');
