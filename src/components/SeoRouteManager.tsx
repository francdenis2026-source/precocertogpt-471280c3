import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE='https://www.precocerto.live';
const routeMeta:Record<string,{title:string;description:string;index?:boolean}>={
  '/':{title:'PreçoCerto | Compare preços e compre em Feijó (AC)',description:'Compare preços, descubra estabelecimentos e encontre opções de compra no comércio local de Feijó, Acre.'},
  '/buscar':{title:'Buscar produtos e preços em Feijó | PreçoCerto',description:'Pesquise produtos, compare preços e encontre onde comprar em Feijó (AC).'},
  '/explorar':{title:'Explorar setores do comércio local | PreçoCerto',description:'Explore mercados, farmácias, padarias, livros, serviços e outros setores do comércio local de Feijó.'},
  '/mercados':{title:'Mercados e supermercados em Feijó | PreçoCerto',description:'Compare produtos e preços de mercados e supermercados de Feijó (AC).'},
  '/farmacias':{title:'Farmácias em Feijó | PreçoCerto',description:'Explore farmácias e produtos disponíveis no comércio local de Feijó (AC).'},
  '/padarias':{title:'Padarias em Feijó | PreçoCerto',description:'Descubra padarias, produtos e opções do comércio local de Feijó (AC).'},
  '/livros':{title:'Livros, autores e cultura local | PreçoCerto',description:'Conheça livros, autores e iniciativas culturais disponíveis no PreçoCerto.'},
  '/servicos':{title:'Serviços locais em Feijó | PreçoCerto',description:'Encontre serviços e profissionais locais disponíveis em Feijó (AC).'},
  '/estabelecimentos':{title:'Estabelecimentos em Feijó | PreçoCerto',description:'Conheça estabelecimentos locais, consulte catálogos e compare preços em Feijó (AC).'},
  '/lojista':{title:'Venda no PreçoCerto | Cadastro de lojista',description:'Cadastre seu estabelecimento para participar do marketplace local PreçoCerto.'},
  '/cadastro-lojista':{title:'Cadastro de lojista | PreçoCerto',description:'Envie os dados do seu estabelecimento para participar do marketplace PreçoCerto.'},
  '/quero-vender':{title:'Quero vender no PreçoCerto',description:'Cadastre seu negócio e solicite participação no marketplace local PreçoCerto.'},
  '/colaborar':{title:'Colabore com o PreçoCerto',description:'Ajude a manter informações do comércio local atualizadas no PreçoCerto.'},
  '/contato':{title:'Contato | PreçoCerto',description:'Entre em contato com a equipe do PreçoCerto em Feijó, Acre.'},
  '/fale-conosco':{title:'Contato | PreçoCerto',description:'Entre em contato com a equipe do PreçoCerto em Feijó, Acre.'},
  '/dorinha-barroso':{title:'Dorinha Barroso · Escritora acreana | PreçoCerto',description:'Conheça Dorinha Barroso, sua trajetória e suas obras literárias.'},
  '/fremix-producoes':{title:'FreMix Produções · Cultura e música | PreçoCerto',description:'Conheça a FreMix Produções e conteúdos culturais de Feijó, Acre.'},
  '/login':{title:'Entrar | PreçoCerto',description:'Acesse sua conta PreçoCerto.',index:false},
  '/cadastro':{title:'Criar conta | PreçoCerto',description:'Crie sua conta no PreçoCerto.',index:false},
  '/registrar':{title:'Criar conta | PreçoCerto',description:'Crie sua conta no PreçoCerto.',index:false},
  '/favoritos':{title:'Meus favoritos | PreçoCerto',description:'Produtos favoritos da sua conta.',index:false},
  '/cesta':{title:'Minha cesta | PreçoCerto',description:'Itens da sua cesta no PreçoCerto.',index:false},
  '/cesta-basica':{title:'Minha lista de compras | PreçoCerto',description:'Itens da sua lista de compras no PreçoCerto.',index:false},
  '/minha-conta':{title:'Minha conta | PreçoCerto',description:'Área da conta PreçoCerto.',index:false},
  '/meus-pedidos':{title:'Meus pedidos | PreçoCerto',description:'Acompanhe seus pedidos no PreçoCerto.',index:false},
};

function upsertMeta(selector:string,attrs:Record<string,string>){let el=document.head.querySelector<HTMLMetaElement>(selector);if(!el){el=document.createElement('meta');document.head.appendChild(el);}Object.entries(attrs).forEach(([k,v])=>el!.setAttribute(k,v));}
function upsertCanonical(url:string){let el=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}el.href=url;}

export function SeoRouteManager(){const {pathname}=useLocation();useEffect(()=>{
  const privateRoute=pathname.startsWith('/admin')||pathname.startsWith('/painel-lojista');
  const product=pathname.startsWith('/produto/'); const store=pathname.startsWith('/estabelecimento/')||pathname.startsWith('/loja/');
  const culturalDorinha=pathname.startsWith('/autora/'); const culturalFremix=pathname.startsWith('/cultura/');
  const meta=routeMeta[pathname] || (product?{title:'Produto | PreçoCerto',description:'Consulte informações, preços e disponibilidade deste produto no PreçoCerto.'}:store?{title:'Estabelecimento | PreçoCerto',description:'Consulte catálogo, produtos e preços deste estabelecimento no PreçoCerto.'}:culturalDorinha?routeMeta['/dorinha-barroso']:culturalFremix?routeMeta['/fremix-producoes']:{title:'PreçoCerto',description:'Marketplace local e comparação de preços em Feijó, Acre.'});
  const canonical=`${BASE}${pathname==='/'?'/':pathname}`;
  document.title=meta.title; upsertCanonical(canonical);
  upsertMeta('meta[name="description"]',{name:'description',content:meta.description});
  upsertMeta('meta[property="og:title"]',{property:'og:title',content:meta.title}); upsertMeta('meta[property="og:description"]',{property:'og:description',content:meta.description}); upsertMeta('meta[property="og:url"]',{property:'og:url',content:canonical});
  upsertMeta('meta[name="twitter:title"]',{name:'twitter:title',content:meta.title}); upsertMeta('meta[name="twitter:description"]',{name:'twitter:description',content:meta.description});
  const shouldIndex=!privateRoute && meta.index!==false;
  upsertMeta('meta[name="robots"]',{name:'robots',content:shouldIndex?'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1':'noindex,nofollow'});
},[pathname]);return null;}
