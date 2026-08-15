import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://precocerto.live";

type HeadInfo = { title: string; description: string; ogImage?: string; noindex?: boolean };

const contactHead: HeadInfo = {
  title: "Fale conosco | PreçoCerto",
  description: "Entre em contato com a equipe do PreçoCerto para dúvidas, correções de preços e parcerias.",
};

const ROUTE_HEAD: Record<string, HeadInfo> = {
  "/": {
    title: "PreçoCerto | Comparar preços em Feijó (AC)",
    description:
      "Compare preços de produtos nas lojas de Feijó (AC), descubra estabelecimentos locais e escolha onde comprar com economia real.",
  },
  "/buscar": {
    title: "Comparar preços de produtos | PreçoCerto",
    description:
      "Busque um produto e compare preço por quilo, litro ou unidade entre os comércios de Feijó (AC).",
  },
  "/estabelecimentos": {
    title: "Estabelecimentos comerciais de Feijó | PreçoCerto",
    description:
      "Mercados, farmácias, livrarias e outros negócios locais de Feijó (AC), com catálogos e preços atualizados.",
  },
  "/farmacias": {
    title: "Farmácias em Feijó (AC) | PreçoCerto",
    description: "Farmácias de Feijó (AC): endereços, contatos e produtos disponíveis para comparação de preços.",
  },
  "/autora/dorinha-barroso": {
    title: "Dorinha Barroso · Livros acreanos | PreçoCerto",
    description:
      "Conheça as obras da escritora acreana Dorinha Barroso e compre exemplares diretamente com a autora.",
    ogImage: `${SITE}/dorinha-author-portrait-v2.webp`,
  },
  "/dorinha-barroso": {
    title: "Dorinha Barroso · Livros acreanos | PreçoCerto",
    description:
      "Conheça as obras da escritora acreana Dorinha Barroso e compre exemplares diretamente com a autora.",
    ogImage: `${SITE}/dorinha-author-portrait-v2.webp`,
  },
  "/cultura/fremix-producoes": {
    title: "FreMix Produções · Cultura local | PreçoCerto",
    description: "Produção cultural local de Feijó (AC) apresentada no PreçoCerto.",
  },
  "/lojista": {
    title: "Área do lojista | PreçoCerto",
    description: "Cadastre seu comércio de Feijó (AC), publique seu catálogo e seja encontrado por clientes da cidade.",
  },
  "/colaborar": {
    title: "Colaborar com os preços | PreçoCerto",
    description: "Ajude a manter os preços de Feijó (AC) atualizados enviando informações do comércio local.",
  },
  "/fale-conosco": contactHead,
  "/contato": contactHead,
  "/favoritos": {
    title: "Meus favoritos | PreçoCerto",
    description: "Produtos que você salvou para comparar preços nas lojas de Feijó (AC).",
  },
};

const PRIVATE_PREFIXES = ["/admin", "/painel-lojista", "/meus-pedidos", "/integracoes"];

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function RouteHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const isPrivate = PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix));
    const info = ROUTE_HEAD[path];
    if (!info && !isPrivate) return;

    const head: HeadInfo = info ?? {
      title: "PreçoCerto",
      description: "Área restrita do PreçoCerto.",
      noindex: true,
    };

    document.title = head.title;
    setMeta('meta[name="description"]', "name", "description", head.description);
    setMeta('meta[property="og:title"]', "property", "og:title", head.title);
    setMeta('meta[property="og:description"]', "property", "og:description", head.description);
    setMeta('meta[property="og:url"]', "property", "og:url", `${SITE}${path}`);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", head.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", head.description);
    if (head.ogImage) {
      setMeta('meta[property="og:image"]', "property", "og:image", head.ogImage);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", head.ogImage);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE}${path}`;

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (isPrivate || head.noindex) {
      setMeta('meta[name="robots"]', "name", "robots", "noindex, nofollow");
    } else if (robots) {
      robots.remove();
    }
  }, [pathname]);

  return null;
}
