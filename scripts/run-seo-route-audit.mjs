import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const base=(process.env.SEO_AUDIT_URL||'https://www.precocerto.live').replace(/\/$/,'');
const routes=[
  '/', '/buscar', '/explorar', '/mercados', '/estabelecimentos', '/farmacias', '/padarias', '/livros', '/servicos',
  '/autora/dorinha-barroso', '/cultura/fremix-producoes', '/lojista', '/colaborar', '/fale-conosco', '/favoritos',
  '/produto/e8033ccd-ef4c-58dc-abcb-387797791bfe',
  '/produto/06f0b6f0-5a45-536f-b388-d031d9265be5',
  '/produto/75505369-81af-5690-b3cd-4f83a899b097',
  '/produto/d31f8f6d-3e7e-54c0-a536-eb34b7a5cd41',
  '/produto/9b0cadfa-4dc5-5f7d-a6c0-90726c51d8d5',
  '/produto/2b255a51-7eae-5784-a029-df3c76578e54',
  '/estabelecimento/2148aff3-4b80-4b0d-adf8-a06e50e3c2c4',
  '/estabelecimento/00cec83d-3cc2-444d-8443-9db114886450',
  '/estabelecimento/905ca83b-5bd5-4d91-a543-76b2966e7d45',
  '/estabelecimento/555544d3-d211-4125-8bdb-70351e768b63',
  '/estabelecimento/demo-mercado',
  '/estabelecimento/demo-farmacia'
];

const outDir=path.resolve('reports/seo/routes');
await mkdir(outDir,{recursive:true});
const summary=[];

for(let i=0;i<routes.length;i++){
  const route=routes[i];
  const url=`${base}${route}`;
  const slug=(route==='/'?'home':route.slice(1)).replace(/[^a-z0-9-]+/gi,'-').replace(/-+/g,'-').slice(0,100);
  const file=path.join(outDir,`${String(i+1).padStart(2,'0')}-${slug}.json`);
  console.log(`\n[${i+1}/${routes.length}] Auditando ${url}`);
  const r=spawnSync(process.platform==='win32'?'npx.cmd':'npx',[
    '--yes','@seomator/seo-audit@3.0.1','audit',url,
    '--format','json','--output',file,'--timeout','60000'
  ],{stdio:'inherit',env:process.env,shell:false});
  let report=null;
  try{report=JSON.parse(await readFile(file,'utf8'));}catch{}
  summary.push({route,url,exitCode:r.status,score:report?.overallScore??null,crawledPages:report?.crawledPages??null,
    fails:report?.categoryResults?.reduce((n,c)=>n+(c.failCount||0),0)??null,
    warnings:report?.categoryResults?.reduce((n,c)=>n+(c.warnCount||0),0)??null});
  if(r.error) console.error(r.error.message);
}

await writeFile(path.join(outDir,'summary.json'),JSON.stringify({base,count:routes.length,generatedAt:new Date().toISOString(),pages:summary},null,2));
console.log('\nAuditoria por rotas concluída.');
