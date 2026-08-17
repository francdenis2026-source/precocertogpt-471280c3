import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const mode = args.find(arg => ['--fast','--html','--full'].includes(arg)) || '--default';
const urlArg = args.find(arg => /^https?:\/\//i.test(arg));
const target = urlArg || process.env.SEO_AUDIT_URL;

if (!target) {
  console.error('\nInforme a URL a auditar. Exemplos:\n');
  console.error('  npm run seo:audit -- https://seu-site.com');
  console.error('  npm run seo:audit:fast -- https://seu-site.com');
  console.error('  npm run seo:audit:html -- https://seu-site.com');
  console.error('  npm run seo:audit:full -- https://seu-site.com\n');
  console.error('Ou defina SEO_AUDIT_URL no ambiente.\n');
  process.exit(2);
}

try { new URL(target); } catch {
  console.error(`URL inválida: ${target}`);
  process.exit(2);
}

const reportDir = path.resolve('reports/seo');
await mkdir(reportDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const safeHost = new URL(target).hostname.replace(/[^a-z0-9.-]/gi, '-');

const cliArgs = ['--yes', '@seomator/seo-audit@3.0.1', 'audit', target];
if (mode === '--fast') cliArgs.push('--no-cwv', '--format', 'console');
if (mode === '--html') cliArgs.push('--crawl', '--max-pages', '25', '--format', 'html', '--output', path.join(reportDir, `${safeHost}-${stamp}.html`));
if (mode === '--full') cliArgs.push('--crawl', '--max-pages', '50', '--concurrency', '4', '--timeout', '60000', '--format', 'json', '--output', path.join(reportDir, `${safeHost}-${stamp}.json`));
if (mode === '--default') cliArgs.push('--crawl', '--max-pages', '20', '--concurrency', '3', '--format', 'console');

console.log(`\nSEOmator · auditoria do PreçoCerto`);
console.log(`Alvo: ${target}`);
console.log(`Modo: ${mode.replace('--','')}\n`);

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', cliArgs, {
  stdio: 'inherit',
  shell: false,
  env: process.env,
});

child.on('error', error => {
  console.error('Falha ao iniciar a auditoria:', error.message);
  process.exit(2);
});

child.on('exit', code => {
  process.exit(code ?? 2);
});
