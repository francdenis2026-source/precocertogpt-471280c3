import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = 'https://www.precocerto.live';
const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

const routes = [
  ['/', 'PreçoCerto | Compare preços e compre em Feijó (AC)', 'Compare preços, descubra estabelecimentos e encontre opções de compra no comércio local de Feijó, Acre.', 'Compare preços no comércio local de Feijó'],
  ['/buscar', 'Buscar produtos e preços em Feijó | PreçoCerto', 'Pesquise produtos, compare preços e encontre onde comprar em Feijó (AC).', 'Buscar produtos e comparar preços'],
  ['/explorar', 'Explorar setores do comércio local | PreçoCerto', 'Explore mercados, farmácias, padarias, livros, serviços e outros setores do comércio local de Feijó.', 'Explore o comércio local por setores'],
  ['/mercados', 'Mercados e supermercados em Feijó | PreçoCerto', 'Compare produtos e preços de mercados e supermercados de Feijó (AC).', 'Mercados e supermercados'],
  ['/estabelecimentos', 'Estabelecimentos em Feijó | PreçoCerto', 'Conheça estabelecimentos locais, consulte catálogos e compare preços em Feijó (AC).', 'Estabelecimentos locais'],
  ['/farmacias', 'Farmácias em Feijó | PreçoCerto', 'Explore farmácias e produtos disponíveis no comércio local de Feijó (AC).', 'Farmácias'],
  ['/padarias', 'Padarias em Feijó | PreçoCerto', 'Descubra padarias, produtos e opções do comércio local de Feijó (AC).', 'Padarias'],
  ['/livros', 'Livros, autores e cultura local | PreçoCerto', 'Conheça livros, autores e iniciativas culturais disponíveis no PreçoCerto.', 'Livros e cultura local'],
  ['/servicos', 'Serviços locais em Feijó | PreçoCerto', 'Encontre serviços e profissionais locais disponíveis em Feijó (AC).', 'Serviços locais'],
  ['/autora/dorinha-barroso', 'Dorinha Barroso · Escritora acreana | PreçoCerto', 'Conheça Dorinha Barroso, sua trajetória e suas obras literárias.', 'Dorinha Barroso'],
  ['/cultura/fremix-producoes', 'FreMix Produções · Cultura e música | PreçoCerto', 'Conheça a FreMix Produções e conteúdos culturais de Feijó, Acre.', 'FreMix Produções'],
  ['/lojista', 'Venda no PreçoCerto | Cadastro de lojista', 'Cadastre seu estabelecimento para participar do marketplace local PreçoCerto.', 'Cadastre seu estabelecimento'],
  ['/colaborar', 'Colabore com o PreçoCerto', 'Ajude a manter informações do comércio local atualizadas no PreçoCerto.', 'Colabore com o PreçoCerto'],
  ['/fale-conosco', 'Contato | PreçoCerto', 'Entre em contato com a equipe do PreçoCerto em Feijó, Acre.', 'Fale com o PreçoCerto'],
];

const nav = [
  ['/', 'Início'], ['/buscar', 'Buscar'], ['/explorar', 'Explorar setores'], ['/mercados', 'Mercados'],
  ['/farmacias', 'Farmácias'], ['/padarias', 'Padarias'], ['/livros', 'Livros'], ['/servicos', 'Serviços'],
  ['/estabelecimentos', 'Estabelecimentos'], ['/lojista', 'Quero vender'], ['/fale-conosco', 'Contato']
];

const esc = (v='') => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const xml = (v='') => esc(v).replace(/'/g,'&apos;');
const absolute = p => `${BASE}${p === '/' ? '/' : p}`;
const meaningful = value => {
  const text = String(value ?? '').trim();
  return text && !['-', '--', 'n/a', 'na', 'null', 'undefined'].includes(text.toLowerCase()) ? text : '';
};

function replaceMeta(html, {pathname,title,description,h1,image='/og.png',jsonLd}) {
  const canonical = absolute(pathname);
  const socialImage = image?.startsWith('http') ? image : `${BASE}${image || '/og.png'}`;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${esc(socialImage)}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${esc(description)}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${esc(socialImage)}" />`);

  const semantic = `<main id="seo-prerender" data-seo-prerender="true"><article><h1>${esc(h1)}</h1><p>${esc(description)}</p><nav aria-label="Navegação principal">${nav.map(([href,label])=>`<a href="${href}">${esc(label)}</a>`).join(' ')}</nav></article></main>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${semantic}</div>`);
  if (jsonLd) html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g,'\\u003c')}</script></head>`);
  return html;
}

async function writeRoute(pathname, html) {
  if (pathname === '/') { await writeFile(path.join(DIST,'index.html'), html); return; }
  const dir = path.join(DIST, pathname.replace(/^\//,''));
  await mkdir(dir,{recursive:true});
  await writeFile(path.join(dir,'index.html'), html);
}

for (const [pathname,title,description,h1] of routes) {
  await writeRoute(pathname, replaceMeta(template,{pathname,title,description,h1,jsonLd:{'@context':'https://schema.org','@type':'WebPage',name:title,url:absolute(pathname),description,inLanguage:'pt-BR',isPartOf:{'@type':'WebSite',name:'PreçoCerto',url:BASE}}}));
}

// Estes valores são publicáveis por design e já são enviados ao navegador pelo frontend.
// RLS continua sendo a barreira de autorização; nenhuma service_role é usada no build.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kqueiohjadwzxafdrrxk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG';
async function rest(table, select, limit=5000) {
  const u = new URL(`/rest/v1/${table}`, supabaseUrl); u.searchParams.set('select',select); u.searchParams.set('limit',String(limit));
  const r = await fetch(u,{headers:{apikey:supabaseKey,Authorization:`Bearer ${supabaseKey}`}});
  if(!r.ok){ console.warn(`SEO prerender: ${table} não pôde ser lido (${r.status}).`); return []; }
  return r.json();
}

const sitemapPaths = routes.map(([pathname])=>pathname);
const products = await rest('products','id,name,brand,category,size,unit,slug,image_url',10000);
for (const p of products) {
  const identifier = meaningful(p.slug) || p.id; if(!identifier || !meaningful(p.name)) continue;
  const name = meaningful(p.name);
  const brand = meaningful(p.brand); const size = meaningful(p.size); const unit = meaningful(p.unit); const category = meaningful(p.category);
  const pathname = `/produto/${encodeURIComponent(identifier)}`;
  const detail = [brand,size,unit,category].filter(Boolean).join(' · ');
  const description = `${name}${detail ? ` — ${detail}` : ''}. Compare preços e disponibilidade no comércio local de Feijó (AC).`;
  const schema = {'@context':'https://schema.org','@type':'Product',name,brand:brand?{'@type':'Brand',name:brand}:undefined,category:category||undefined,image:meaningful(p.image_url)||undefined,url:absolute(pathname),description};
  await writeRoute(pathname, replaceMeta(template,{pathname,title:`${name} | PreçoCerto`,description,h1:name,image:meaningful(p.image_url)||'/og.png',jsonLd:schema}));
  sitemapPaths.push(pathname);
}

const stores = await rest('establishments','id,name,slug,kind,neighborhood,short_description,logo_url,is_demo',5000);
for (const s of stores) {
  const identifier = meaningful(s.slug) || s.id; const name=meaningful(s.name); if(!identifier || !name || s.is_demo) continue;
  const pathname = `/estabelecimento/${encodeURIComponent(identifier)}`;
  const neighborhood=meaningful(s.neighborhood); const customDescription=meaningful(s.short_description);
  const description = customDescription || `${name}${neighborhood?` em ${neighborhood}`:''}. Consulte catálogo, produtos e preços no PreçoCerto.`;
  const schema = {'@context':'https://schema.org','@type':'Store',name,url:absolute(pathname),description,image:meaningful(s.logo_url)||undefined,address:neighborhood?{'@type':'PostalAddress',addressLocality:'Feijó',addressRegion:'AC',addressCountry:'BR',addressDistrict:neighborhood}:undefined};
  await writeRoute(pathname, replaceMeta(template,{pathname,title:`${name} | PreçoCerto`,description,h1:name,image:meaningful(s.logo_url)||'/og.png',jsonLd:schema}));
  sitemapPaths.push(pathname);
}

const uniquePaths=[...new Set(sitemapPaths)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePaths.map(p=>`  <url><loc>${xml(absolute(p))}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(DIST,'sitemap.xml'),sitemap);

console.log(`SEO prerender: ${routes.length} rotas estáticas, ${products.length} produtos, ${stores.filter(s=>!s.is_demo).length} estabelecimentos públicos; sitemap com ${uniquePaths.length} URLs.`);
