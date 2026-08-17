import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('dist/index.html');
const target = path.resolve('dist/404.html');
let html = await readFile(source, 'utf8');

html = html
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Página não encontrada | PreçoCerto</title>')
  .replace(/<meta name="description"[^>]*>/i, '<meta name="description" content="A página solicitada não foi encontrada no PreçoCerto." />')
  .replace(/<meta name="robots"[^>]*>/i, '<meta name="robots" content="noindex,nofollow" />')
  .replace(/<link rel="canonical"[^>]*>/i, '')
  .replace(/<meta property="og:url"[^>]*>/i, '')
  .replace(/<div id="root">[\s\S]*?<\/div>\s*<\/body>/i, '<div id="root"></div>\n  </body>');

await writeFile(target, html);
console.log('SEO 404: dist/404.html criado com noindex.');
