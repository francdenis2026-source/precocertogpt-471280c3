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
  ['/', 'Início'], ['/buscar', 'Buscar'], ['/explorar', 'Explorar'],
  ['/estabelecimentos', 'Perto de mim'], ['/minha-conta', 'Conta'],
];

const esc = (v='') => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const xml = (v='') => esc(v).replace(/'/g,'&apos;');
const absolute = p => `${BASE}${p === '/' ? '/' : p}`;
const meaningful = value => {
  const text = String(value ?? '').trim();
  return text && !['-', '--', 'n/a', 'na', 'null', 'undefined'].includes(text.toLowerCase()) ? text : '';
};

function replaceMeta(html, {pathname,title,description,h1,image='/og.png',jsonLd,content=''}) {
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

  const semantic = `<main id="seo-prerender" data-seo-prerender="true"><article><h1>${esc(h1)}</h1><p>${esc(description)}</p><nav aria-label="Navegação principal">${nav.map(([href,label])=>`<a href="${href}">${esc(label)}</a>`).join(' ')}</nav>${content}</article></main>`;
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
  try {
    const r = await fetch(u,{headers:{apikey:supabaseKey,Authorization:`Bearer ${supabaseKey}`},signal:AbortSignal.timeout(8_000)});
    if(!r.ok){ console.warn(`SEO prerender: ${table} não pôde ser lido (${r.status}).`); return []; }
    return r.json();
  } catch (error) {
    console.warn(`SEO prerender: ${table} indisponível; mantendo conteúdo estrutural.`, error instanceof Error ? error.message : 'erro de rede');
    return [];
  }
}

const sitemapPaths = routes.map(([pathname])=>pathname);
// As três consultas são independentes. Executá-las em paralelo evita que um
// endpoint indisponível multiplique o tempo do build pelos três timeouts.
const [products, stores, prices] = await Promise.all([
  rest('products','id,name,brand,category,size,unit,slug,image_url',10000),
  rest('establishments','id,name,slug,kind,neighborhood,short_description,logo_url,is_demo',5000),
  rest('prices','product_id,establishment_id,value,captured_at',20000),
]);
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

for (const s of stores) {
  const identifier = meaningful(s.slug) || s.id; const name=meaningful(s.name); if(!identifier || !name || s.is_demo) continue;
  const pathname = `/estabelecimento/${encodeURIComponent(identifier)}`;
  const neighborhood=meaningful(s.neighborhood); const customDescription=meaningful(s.short_description);
  const description = customDescription || `${name}${neighborhood?` em ${neighborhood}`:''}. Consulte catálogo, produtos e preços no PreçoCerto.`;
  const schema = {'@context':'https://schema.org','@type':'Store',name,url:absolute(pathname),description,image:meaningful(s.logo_url)||undefined,address:neighborhood?{'@type':'PostalAddress',addressLocality:'Feijó',addressRegion:'AC',addressCountry:'BR',addressDistrict:neighborhood}:undefined};
  await writeRoute(pathname, replaceMeta(template,{pathname,title:`${name} | PreçoCerto`,description,h1:name,image:meaningful(s.logo_url)||'/og.png',jsonLd:schema}));
  sitemapPaths.push(pathname);
}

const productById = new Map(products.map(product => [String(product.id), product]));
const storeById = new Map(stores.map(store => [String(store.id), store]));
const normalizedText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const pricedProducts = prices
  .map(price => ({
    product: productById.get(String(price.product_id)),
    store: storeById.get(String(price.establishment_id)),
    value: Number(price.value),
    capturedAt: meaningful(price.captured_at),
  }))
  .filter(item => item.product && item.store && !item.store.is_demo && Number.isFinite(item.value) && item.value > 0)
  .sort((a,b) => a.value - b.value);

function uniqueOffers(items, limit=8) {
  const seen = new Set();
  return items.filter(item => {
    const key = normalizedText(item.product.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0,limit);
}

function offerMarkup(items) {
  const offers = uniqueOffers(items);
  if (!offers.length) return '<p>O catálogo local está disponível no aplicativo e será atualizado quando a conexão permitir.</p>';
  return `<ul>${offers.map(({product,store,value,capturedAt}) => {
    const identifier = meaningful(product.slug) || product.id;
    const capturedTime = Date.parse(capturedAt);
    const updated = Number.isFinite(capturedTime) ? ` · atualizado em ${new Intl.DateTimeFormat('pt-BR',{dateStyle:'short'}).format(capturedTime)}` : '';
    return `<li><a href="/produto/${encodeURIComponent(identifier)}"><strong>${esc(product.name)}</strong></a> <span>R$ ${value.toFixed(2).replace('.',',')} em ${esc(store.name)}${esc(updated)}</span></li>`;
  }).join('')}</ul>`;
}

function storeMarkup(items) {
  const available = items.filter(store => !store.is_demo && meaningful(store.name)).slice(0,8);
  if (!available.length) return '<p>Os estabelecimentos serão exibidos quando o catálogo estiver disponível.</p>';
  return `<ul>${available.map(store => `<li><a href="/estabelecimento/${encodeURIComponent(meaningful(store.slug)||store.id)}"><strong>${esc(store.name)}</strong></a>${meaningful(store.neighborhood)?` <span>· ${esc(store.neighborhood)}</span>`:''}</li>`).join('')}</ul>`;
}

const sectorTerms = {
  '/mercados':['mercado','mercearia','supermercado','alimento','bebida','limpeza','hortifruti'],
  '/farmacias':['farmacia','medicamento','higiene','saude','beleza'],
  '/padarias':['padaria','pao','bolo','salgado','confeitaria'],
  '/livros':['livro','literatura','cultura'],
  '/servicos':['servico','profissional'],
};
const filterOffers = pathname => {
  const terms = sectorTerms[pathname];
  if (!terms) return pricedProducts;
  return pricedProducts.filter(({product,store}) => {
    const text = normalizedText(`${product.category} ${product.name} ${store.kind}`);
    return terms.some(term => text.includes(term));
  });
};
const categoryMarkup = `<section aria-labelledby="seo-categories"><h2 id="seo-categories">Explore por categoria</h2><ul><li><a href="/mercados">Mercados</a></li><li><a href="/farmacias">Farmácias</a></li><li><a href="/padarias">Padarias</a></li><li><a href="/livros">Livros</a></li><li><a href="/servicos">Serviços</a></li></ul></section>`;

// Regrava as rotas principais com estrutura e dados úteis no HTML inicial.
// O React substitui este conteúdo ao montar; crawlers e conexões sem JS ainda
// recebem categorias, ofertas e estabelecimentos reais do último build.
for (const [pathname,title,description,h1] of routes) {
  let content = categoryMarkup;
  if (['/','/buscar','/mercados','/farmacias','/padarias','/livros','/servicos'].includes(pathname)) {
    content += `<section aria-labelledby="seo-offers"><h2 id="seo-offers">Preços disponíveis para comparar</h2>${offerMarkup(filterOffers(pathname))}</section>`;
  }
  if (['/','/mercados','/estabelecimentos'].includes(pathname)) {
    const relevantStores = pathname === '/mercados'
      ? stores.filter(store => /mercado|mercearia|supermercado/i.test(`${store.kind} ${store.name}`))
      : stores;
    content += `<section aria-labelledby="seo-stores"><h2 id="seo-stores">Estabelecimentos locais</h2>${storeMarkup(relevantStores)}</section>`;
  }
  await writeRoute(pathname, replaceMeta(template,{pathname,title,description,h1,content,jsonLd:{'@context':'https://schema.org','@type':'WebPage',name:title,url:absolute(pathname),description,inLanguage:'pt-BR',isPartOf:{'@type':'WebSite',name:'PreçoCerto',url:BASE}}}));
}

const uniquePaths=[...new Set(sitemapPaths)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePaths.map(p=>`  <url><loc>${xml(absolute(p))}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(DIST,'sitemap.xml'),sitemap);

console.log(`SEO prerender: ${routes.length} rotas estáticas, ${products.length} produtos, ${stores.filter(s=>!s.is_demo).length} estabelecimentos públicos; sitemap com ${uniquePaths.length} URLs.`);
