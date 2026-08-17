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
const absolute = p => `${BASE}${p === '/' ? '/' : p}`;

function replaceMeta(html, {pathname,title,description,h1,image='/og.png',jsonLd}) {
  const canonical = absolute(pathname);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${BASE}${image}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${esc(description)}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${BASE}${image}" />`);

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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
async function rest(table, select, limit=5000) {
  if (!supabaseUrl || !supabaseKey) return [];
  const u = new URL(`/rest/v1/${table}`, supabaseUrl); u.searchParams.set('select',select); u.searchParams.set('limit',String(limit));
  const r = await fetch(u,{headers:{apikey:supabaseKey,Authorization:`Bearer ${supabaseKey}`}}); if(!r.ok) return []; return r.json();
}

const products = await rest('products','id,name,brand,category,size,unit,slug,image_url',5000);
for (const p of products) {
  const identifier = p.slug || p.id; if(!identifier || !p.name) continue;
  const pathname = `/produto/${encodeURIComponent(identifier)}`;
  const detail = [p.brand,p.size,p.unit,p.category].filter(Boolean).join(' · ');
  const description = `${p.name}${detail ? ` — ${detail}` : ''}. Compare preços e disponibilidade no comércio local de Feijó (AC).`;
  const schema = {'@context':'https://schema.org','@type':'Product',name:p.name,brand:p.brand?{'@type':'Brand',name:p.brand}:undefined,category:p.category||undefined,image:p.image_url||undefined,url:absolute(pathname),description};
  await writeRoute(pathname, replaceMeta(template,{pathname,title:`${p.name} | PreçoCerto`,description,h1:p.name,image:p.image_url?.startsWith('http')?'/og.png':(p.image_url||'/og.png'),jsonLd:schema}));
}

const stores = await rest('establishments','id,name,slug,kind,neighborhood,short_description,logo_url,is_demo',2000);
for (const s of stores) {
  const identifier = s.slug || s.id; if(!identifier || !s.name) continue;
  const pathname = `/estabelecimento/${encodeURIComponent(identifier)}`;
  const description = s.short_description || `${s.name}${s.neighborhood?` em ${s.neighborhood}`:''}. Consulte catálogo, produtos e preços no PreçoCerto.`;
  const schema = {'@context':'https://schema.org','@type':'Store',name:s.name,url:absolute(pathname),description,image:s.logo_url||undefined,address:s.neighborhood?{'@type':'PostalAddress',addressLocality:'Feijó',addressRegion:'AC',addressCountry:'BR',addressDistrict:s.neighborhood}:undefined};
  await writeRoute(pathname, replaceMeta(template,{pathname,title:`${s.name} | PreçoCerto`,description,h1:s.name,jsonLd:schema}));
}

console.log(`SEO prerender: ${routes.length} rotas estáticas, ${products.length} produtos, ${stores.length} estabelecimentos.`);
