import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  PackageCheck,
  Play,
  Share2,
  Sparkles,
  Truck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import imagimacaoAsset from "../assets/uma-viagem-ao-mundo-da-imaginacao.png.asset.json";
import mentePerversaAsset from "../assets/mente-perversa.png.asset.json";
import superacaoAsset from "../assets/uma-historia-de-superacao.png.asset.json";
import despertarAsset from "../assets/o-despertar-para-o-mundo-literario.png.asset.json";

type ExternalStore = { label: string; url: string };
type Book = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  description: string | null;
  isbn: string | null;
  external_url: string | null;
  price: number;
  promotional_price: number | null;
  price_on_request: boolean;
  available: boolean;
};
type Profile = {
  establishment: { id: string; slug: string; name: string; neighborhood: string | null; brand_color: string | null; verified: boolean };
  merchant: {
    id: string;
    name: string;
    phone: string | null;
    address: any;
    delivery_enabled: boolean;
    pickup_enabled: boolean;
    direct_sales_enabled: boolean;
    whatsapp: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;
    author_name: string | null;
    author_bio: string | null;
    author_birthplace: string | null;
    direct_sale_note: string | null;
    external_stores: ExternalStore[];
    online_checkout_enabled: boolean;
  };
  books: Book[];
};

const heroPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='760' height='520' viewBox='0 0 760 520'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='2'%3E%3Cpath d='M70 430h520M110 430V145h58v285M177 430V100h44v330M231 430V178h62v252M304 430V126h50v304M365 430V190h72v240M447 430V82h48v348M508 430V150h68v280'/%3E%3Cpath d='M600 110c42 28 63 75 55 126-8 52-41 91-91 116M624 84c61 39 91 102 79 171-12 68-56 120-123 151'/%3E%3C/g%3E%3C/svg%3E")`;
const heroPlaceholder="url('data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAACwBQCdASowACAAPsFKnUynq6KiOrzIAXAYCWMAyrRu4o5HIXyuAJIgs/OYdswYQSgqvCIg/3AA/vZ7frHfIZ4qW/PgOEW5IdNqlT7HZ4b9mFYeQN7SHSgdkgiL6UF9o4kBuax0ikW0AmknuWr2oZwhMSRaDJLaekuudLgorcj/r33f+bfEJCchpeLqkAAA')";

function cleanPhone(value?: string | null) {
  return (value || "").replace(/\D/g, "");
}

function responsiveCoverSrcSet(url:string){
  const marker="/storage/v1/object/public/";
  if(!url.includes(marker))return undefined;
  const renderUrl=url.replace(marker,"/storage/v1/render/image/public/");
  return [320,480,640].map(width=>`${renderUrl}${renderUrl.includes("?")?"&":"?"}width=${width}&quality=82 ${width}w`).join(", ");
}

function whatsappUrl(phone: string, book?: string) {
  const msg = book
    ? `Olá, Dorinha! Encontrei o livro “${book}” no PreçoCerto e gostaria de saber o valor, a disponibilidade e como posso comprar diretamente com você.`
    : "Olá, Dorinha! Encontrei sua loja de livros no PreçoCerto e gostaria de informações para comprar diretamente com você.";
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(msg)}`;
}

export function DorinhaAuthorStore() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loadedCovers,setLoadedCovers]=useState<Set<string>>(()=>new Set());

  useEffect(() => {
    // SEO e Open Graph
    const title = "Dorinha Barroso · Livros Acreanos | PreçoCerto Marketplace";
    const desc = "Descubra as obras de Dorinha Barroso, escritora acreana, historiadora e pedagoga. Compre livros diretamente com a autora.";
    const url = window.location.href;
    const image = "https://precocertogpt.lovable.app/dorinha-hero-editorial-v3.png";

    document.title = title;
    
    // Helper to update meta tags
    const updateMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", desc);
    updateMeta("og:title", title, "property");
    updateMeta("og:description", desc, "property");
    updateMeta("og:url", url, "property");
    updateMeta("og:image", image, "property");
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", desc);
    updateMeta("twitter:image", image);

    // Track origin for return logic
    localStorage.setItem("precocerto:last_writer_store", "/dorinha");

    void (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase.rpc("author_store_public_profile", { _slug: "dorinha-barroso-livros" });
      setProfile((data || null) as Profile | null);
      setLoading(false);
    })();
  }, []);

  const whatsapp = profile?.merchant.whatsapp || "5568999564762";
  const address = useMemo(() => {
    const a = profile?.merchant.address || {};
    return [a.street, a.number && `nº ${a.number}`, a.neighborhood, a.city && `${a.city}-${a.state}`, a.postal_code && `CEP ${a.postal_code}`].filter(Boolean).join(", ");
  }, [profile]);

  async function sharePage() {
    const shareUrl = window.location.origin + window.location.pathname;
    const data = { 
      title: "Dorinha Barroso · Livros", 
      text: "Conheça os livros de Dorinha Barroso e compre diretamente com a autora pelo PreçoCerto.", 
      url: shareUrl 
    };
    if (navigator.share) { try { await navigator.share(data); return; } catch { /* cancelado */ } }
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  const external = useMemo(() => {
    if (!profile) return [];
    const ordered = (profile.merchant.external_stores || [])
      .filter(s => s.label !== 'Apple Books')
      .sort((a, b) => {
        if (a.label.toLowerCase().includes('amazon')) return -1;
        if (b.label.toLowerCase().includes('amazon')) return 1;
        return a.label.localeCompare(b.label);
      });
    const platforms = new Set<string>();
    return ordered.filter(store => {
      const label = store.label.trim().toLocaleLowerCase('pt-BR');
      const key = label.includes('amazon') ? 'amazon' : label;
      if (platforms.has(key)) return false;
      platforms.add(key);
      return true;
    });
  }, [profile]);

  if (loading) return <main style={s.loading}><BookOpen size={36}/><strong>Preparando a biblioteca da autora…</strong></main>;
  if (!profile) return <main style={s.loading}><BookOpen size={36}/><h1>Loja da autora indisponível</h1><a href="/estabelecimentos">Voltar aos estabelecimentos</a></main>;

  return <main style={s.page} className="db-author-page">
    <nav className="shell db-breadcrumbs" style={{ padding: '1rem 2rem', fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Início</a>
      <ChevronRight size={14} />
      <span style={{ fontWeight: 600, color: 'var(--pc-color-foreground)' }}>Dorinha Barroso</span>
    </nav>
    <style>{`
      .db-author-page{--db-display:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--db-body:"Inter Variable",Inter,system-ui,-apple-system,"Segoe UI",sans-serif;padding-top:0!important;font-family:var(--db-body);font-size:16px;line-height:1.65;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
      .db-author-page h1,.db-author-page h2,.db-author-page h3{font-family:var(--db-display);font-weight:700;text-wrap:balance}
      .db-author-page p{letter-spacing:0}
      .db-author-page a,.db-author-page button{letter-spacing:0}
      .db-hero-grid{display:grid;grid-template-columns:minmax(0,.94fr) minmax(400px,1.06fr);gap:clamp(24px,4vw,54px);align-items:center}
      .db-hero-copy{position:relative;padding-left:22px}
      .db-hero-copy:before{content:"";position:absolute;left:0;top:4px;width:2px;height:88px;border-radius:9px;background:linear-gradient(color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface)),rgba(244,219,169,0));box-shadow:0 0 24px rgba(231,199,141,.28)}
      .db-hero-title{font-family:var(--db-display)!important;font-size:clamp(3rem,5vw,4.5rem);font-weight:700!important;line-height:.93;letter-spacing:-.042em;margin:12px 0 16px;max-width:680px;text-shadow:0 4px 28px rgba(0,0,0,.42)}
      .db-hero-title em{font-style:normal;color:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))}
      .db-hero-art{position:relative;min-height:350px;display:grid;place-items:center;isolation:isolate}
      .db-cover-stage{position:relative;width:min(100%,550px);height:335px}
      .db-hero-cover{position:absolute;display:block;width:150px;height:228px;object-fit:contain;border-radius:3px 9px 9px 3px;filter:drop-shadow(0 22px 22px rgba(18,6,22,.52));transform-origin:50% 100%;transition:transform .35s ease,filter .35s ease}
      .db-hero-cover:nth-child(1){left:5%;bottom:24px;transform:rotate(-13deg) translateY(15px);z-index:1}
      .db-hero-cover:nth-child(2){left:29%;bottom:49px;transform:rotate(-4deg);z-index:3}
      .db-hero-cover:nth-child(3){right:24%;bottom:44px;transform:rotate(5deg);z-index:4}
      .db-hero-cover:nth-child(4){right:0;bottom:19px;transform:rotate(13deg) translateY(18px);z-index:2}
      .db-cover-stage:hover .db-hero-cover:nth-child(1){transform:rotate(-15deg) translate(-6px,5px)}
      .db-cover-stage:hover .db-hero-cover:nth-child(2){transform:rotate(-5deg) translateY(-10px)}
      .db-cover-stage:hover .db-hero-cover:nth-child(3){transform:rotate(6deg) translateY(-12px)}
      .db-cover-stage:hover .db-hero-cover:nth-child(4){transform:rotate(15deg) translate(6px,7px)}
      .db-stage-glow{position:absolute;left:8%;right:5%;bottom:2%;height:35%;border-radius:50%;background:radial-gradient(ellipse,rgba(238,202,128,.42),transparent 69%);filter:blur(22px);z-index:-1}
      .db-stage-note{position:absolute;right:2%;top:10px;max-width:190px;padding:12px 14px;border:1px solid rgba(255,255,255,.28);border-radius:14px;background:rgba(29,12,34,.82);backdrop-filter:blur(16px);color:var(--pc-color-surface);font-size:12px;line-height:1.5;box-shadow:0 14px 36px rgba(0,0,0,.28)}
      .db-stage-note b{display:block;color:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface));font-size:11px;letter-spacing:.08em;margin-bottom:4px}
      .db-top-label a{color:inherit;text-decoration:none;transition:color .18s ease}
      .db-top-label a:hover{color:var(--pc-color-foreground)}
      .db-book-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;align-items:stretch}
      .db-real-cover-shell{position:relative;height:210px;display:grid;place-items:center;overflow:hidden;padding:14px;background:linear-gradient(145deg,var(--pc-color-foreground) 0%,var(--pc-color-foreground) 52%,var(--pc-color-muted) 100%);isolation:isolate}
      .db-real-cover-shell:before{content:"";position:absolute;inset:auto -18% -50% 12%;height:88%;border-radius:50%;background:radial-gradient(ellipse,rgba(238,202,128,.34),transparent 68%);filter:blur(18px);z-index:-1}
      .db-real-cover-image{display:block;width:auto;max-width:82%;height:182px;object-fit:contain;border-radius:3px 7px 7px 3px;filter:drop-shadow(0 13px 13px rgba(12,5,16,.42));opacity:0;transition:opacity .25s ease,transform .3s ease}
      .db-real-cover-shell.is-loaded .db-real-cover-image{opacity:1}.db-real-cover-shell.is-loaded .db-cover-placeholder{display:none}
      .db-cover-placeholder{position:absolute;color:rgba(255,255,255,.72);font-size:11px}.db-real-cover-badge{position:absolute;right:9px;bottom:8px;padding:4px 6px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(31,15,37,.72);color:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface));font-size:8px;font-weight:800;letter-spacing:.08em}
      .db-about-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(290px,.65fr);gap:22px}
      .db-about-facts span{display:grid;padding:12px 13px;border:1px solid rgba(255,255,255,.14);border-radius:11px;background:rgba(255,255,255,.06)}
      .db-about-facts b{color:var(--pc-color-surface);font-family:var(--db-display);font-size:18px;font-weight:700}
      .db-about-facts small{margin-top:2px;color:var(--pc-color-muted);font-size:12px;line-height:1.4}
      .db-author-portrait-card{position:relative;min-height:420px;overflow:hidden;border-radius:18px;background:var(--pc-color-foreground);box-shadow:0 24px 55px rgba(9,4,13,.28)}
      .db-author-portrait-card img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;object-position:center 25%}
      .db-author-portrait-card figcaption{position:absolute;left:14px;right:14px;bottom:14px;padding:12px 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(25,13,30,.76);backdrop-filter:blur(12px);display:grid;color:white}
      .db-author-portrait-card figcaption strong{font-family:var(--db-display);font-size:20px}
      .db-author-portrait-card figcaption span{margin-top:3px;color:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface));font-size:11px;font-weight:750;letter-spacing:.09em}
      .db-video-grid{display:grid;grid-template-columns:minmax(250px,.72fr) minmax(420px,1.1fr);gap:28px;align-items:center}
      .db-video-copy{position:relative;padding-left:64px}.db-video-copy p{max-width:390px;margin:0;color:var(--pc-color-muted);font-size:14px;line-height:1.6}
      .db-video-mark{position:absolute;left:0;top:2px;width:46px;height:46px;color:var(--pc-color-primary);filter:drop-shadow(0 7px 13px rgba(63,34,70,.12))}
      .db-video-frame{position:relative;width:100%;max-width:610px;justify-self:end;aspect-ratio:16/9;overflow:hidden;border:1px solid var(--pc-color-muted);border-radius:14px;background:linear-gradient(145deg,var(--pc-color-foreground),var(--pc-color-foreground));box-shadow:0 16px 38px rgba(35,17,41,.14)}
      .db-video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
      .db-video-link{display:inline-flex;align-items:center;gap:7px;margin-top:16px;padding:10px 13px;border:1px solid var(--pc-color-border);border-radius:9px;background:var(--pc-color-surface);color:var(--pc-color-foreground);text-decoration:none;font-size:13px;font-weight:750}
      .db-contact-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px}
      #contato .db-contact-grid{padding-top:32px;padding-bottom:32px;align-items:center}
      #contato .db-contact-grid h2{font-size:clamp(1.75rem,3.2vw,2.45rem);max-width:620px}
      #contato .db-contact-grid h2{color:var(--pc-color-surface)}
      #contato .db-contact-grid small{color:var(--pc-color-background);font-size:12px;line-height:1.55}
      .db-external-head{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:24px;align-items:center;margin-bottom:16px}.db-external-head p{margin-bottom:0}
      .db-platform-illustration{width:142px;height:82px;justify-self:end;color:var(--pc-color-primary);filter:drop-shadow(0 9px 18px rgba(54,30,61,.1))}
      .db-external-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%}
      .db-external-empty{padding:20px;border:1px dashed rgba(64,44,77,.22);border-radius:13px;text-align:center;background:rgba(255,255,255,.52);grid-column:1/-1}
      .db-external-empty h3{font-family:var(--db-display);font-size:22px;color:var(--pc-color-foreground);margin-bottom:8px}
      .db-external-empty p{color:var(--pc-color-muted);font-size:15px;max-width:440px;margin:0 auto 18px}
      .db-external-empty-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 18px;background:var(--pc-color-foreground);color:white;text-decoration:none;border-radius:9px;font-weight:750;font-size:14px;transition:transform .2s ease}
      .db-external-empty-cta:hover{transform:translateY(-2px)}
      .db-external-grid strong{font-size:14px}.db-external-grid small{font-size:12px;color:var(--pc-color-muted)}
      .db-book p{hyphens:auto}.db-book h3,.db-book p{overflow-wrap:anywhere}
      .db-book-description{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
      .db-mobile-swipe-hint{display:none}
      .db-book-price strong{font-variant-numeric:tabular-nums}
      .db-action:hover{transform:translateY(-2px)}
      .db-book:hover{transform:translateY(-5px);box-shadow:0 22px 60px rgba(29,18,44,.12)}
      @media(max-width:1050px){.db-hero-grid{grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:18px}.db-cover-stage{transform:scale(.85)}.db-book-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.db-about-grid,.db-contact-grid{grid-template-columns:1fr}.db-author-portrait-card{min-height:470px}.db-external-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.db-video-grid{grid-template-columns:1fr;gap:16px}.db-video-copy{padding-left:54px}.db-video-copy p{max-width:none}.db-video-mark{width:40px;height:40px}.db-video-frame{max-width:560px;justify-self:center}.db-video-link{width:100%;justify-content:center;box-sizing:border-box}.db-external-head{grid-template-columns:1fr}.db-platform-illustration{display:none}}
      @media(max-width:790px){.db-hero-grid{grid-template-columns:1fr}.db-hero-art{min-height:320px;margin-top:-24px}.db-cover-stage{height:330px;transform:scale(.78)}.db-stage-note{display:none}.db-hero-copy{text-align:center;padding-left:0}.db-hero-copy:before{display:none}.db-hero-copy .db-hero-actions,.db-hero-copy [data-hero-badges],.db-hero-copy [data-hero-foot]{justify-content:center}}
      @media(max-width:640px){
        .db-author-page{font-size:15px;overflow-x:hidden}
        .db-topbar{height:64px!important;padding:6px 10px!important;gap:7px!important;background:linear-gradient(180deg,rgba(255,253,249,.99),rgba(247,241,246,.98))!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(101,70,109,.22),inset 0 -3px 0 rgba(218,180,105,.72),0 9px 24px rgba(35,18,43,.13)!important}
        .db-brand{min-width:0;flex:1 1 auto;gap:7px!important}.db-brand>span:last-child{display:grid;min-width:0}.db-brand b{font-size:14px;line-height:1.1;white-space:nowrap}.db-brand small{display:none}.db-brand-mark{width:40px!important;height:40px!important;border-radius:12px!important;box-shadow:0 6px 14px rgba(38,21,47,.2)}
        .db-top-label,.db-icon-label,.db-top-whats span{display:none!important}
        .db-top-actions{flex:0 0 auto;gap:6px!important}.db-share-button,.db-top-whats{width:44px!important;height:44px!important;min-width:44px!important;padding:0!important;display:grid!important;place-items:center!important;border-radius:12px!important;box-sizing:border-box}.db-share-button{border-color:var(--pc-color-muted)!important}.db-top-whats{border:1px solid var(--pc-color-foreground)!important;box-shadow:0 7px 15px rgba(45,25,54,.17)}
        .db-section{padding:34px 16px!important}.db-section-head{display:block!important;margin-bottom:16px!important}.db-catalog-count{display:none!important}.db-section-head h2{font-size:clamp(1.75rem,8.6vw,2.25rem)!important;margin-bottom:8px!important}.db-section-head p{font-size:14px!important;line-height:1.58!important;margin:0!important}
        .db-hero-grid{display:flex!important;flex-direction:column;gap:0!important;padding-top:28px!important;padding-bottom:16px!important}.db-hero-copy{width:100%;text-align:left!important}.db-hero-copy [data-hero-badges],.db-hero-copy [data-hero-foot]{justify-content:flex-start!important}.db-hero-title{font-size:clamp(2.65rem,13vw,3.4rem);line-height:.91;margin:10px 0 12px}.db-hero-copy p{max-width:none!important}.db-hero-copy p:nth-of-type(1){font-size:1.18rem!important;line-height:1.34!important}.db-hero-copy p:nth-of-type(2){font-size:14px!important;line-height:1.52!important;margin-bottom:0!important}.db-hero-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:7px!important;margin-top:15px!important}.db-hero-actions>*{width:auto!important;min-height:46px;justify-content:center;padding:9px!important;font-size:12px!important;text-align:center}.db-hero-actions svg:last-child{display:none}.db-hero-art{width:100%;min-height:258px;margin:-2px 0 -16px}.db-cover-stage{width:100%;max-width:390px;height:265px;transform:none!important;margin:0 auto}.db-hero-cover{width:124px;height:194px}.db-hero-cover:nth-child(1){left:0;bottom:22px;transform:rotate(-10deg) translateY(10px)}.db-hero-cover:nth-child(2){left:23%;bottom:42px;transform:rotate(-3deg);z-index:4}.db-hero-cover:nth-child(3){right:22%;bottom:39px;transform:rotate(4deg);z-index:5}.db-hero-cover:nth-child(4){right:0;bottom:18px;transform:rotate(11deg) translateY(11px)}.db-cover-stage:hover .db-hero-cover:nth-child(1){transform:rotate(-10deg) translateY(10px)}.db-cover-stage:hover .db-hero-cover:nth-child(2){transform:rotate(-3deg)}.db-cover-stage:hover .db-hero-cover:nth-child(3){transform:rotate(4deg)}.db-cover-stage:hover .db-hero-cover:nth-child(4){transform:rotate(11deg) translateY(11px)}.db-hero-copy [data-hero-foot]{gap:10px!important;margin-top:13px!important;font-size:11px!important}
        .db-mobile-swipe-hint{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin:-5px 0 10px;color:var(--pc-color-muted);font-size:11px;font-weight:750}.db-mobile-swipe-hint svg{width:15px;height:15px}.db-book-grid{display:flex!important;gap:12px!important;margin:0 -16px;padding:0 16px 14px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-left:16px;-webkit-overflow-scrolling:touch;overscroll-behavior-inline:contain}.db-book-grid::-webkit-scrollbar{height:5px}.db-book-grid::-webkit-scrollbar-track{margin:0 16px;background:var(--pc-color-border);border-radius:999px}.db-book-grid::-webkit-scrollbar-thumb{background:var(--pc-color-primary);border-radius:999px}.db-external-grid{grid-template-columns:1fr}.db-book{display:flex!important;flex:0 0 min(82vw,330px);min-height:0;scroll-snap-align:start;border-radius:16px!important;box-shadow:0 14px 34px rgba(39,22,46,.09)}.db-real-cover-shell{height:262px!important;min-height:262px;padding:14px!important}.db-real-cover-image{width:auto!important;max-width:88%!important;height:232px!important;max-height:232px!important}.db-real-cover-badge{display:block}.db-book .db-book-description{-webkit-line-clamp:3;font-size:12px!important;line-height:1.45!important}.db-book h3{font-size:19px!important;margin-top:8px!important}.db-book [style*="Venda direta"]{font-size:11px}.db-book:hover{transform:none}
        .db-about-grid{gap:20px!important}.db-about-grid h2{font-size:clamp(1.75rem,8vw,2.2rem)!important}.db-about-grid p{font-size:14px!important;line-height:1.65!important}.db-about-facts{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;margin-top:18px!important}.db-about-facts span{padding:9px 7px!important;text-align:center}.db-about-facts b{font-size:14px!important}.db-about-facts small{font-size:10px!important}.db-author-portrait-card{min-height:380px;border-radius:15px}.db-author-portrait-card img{object-position:center top!important}.db-author-portrait-card figcaption{padding:10px 12px!important;bottom:10px!important}.db-author-portrait-card figcaption span{font-size:9px!important}
        .db-video-grid{gap:14px!important}.db-video-copy{padding-left:48px}.db-video-copy h2{font-size:1.7rem!important}.db-video-copy p{font-size:13px!important;line-height:1.55!important}.db-video-mark{width:37px;height:37px}.db-video-link{min-height:44px;margin-top:12px}.db-video-frame{border-radius:12px}.db-external-head{margin-bottom:12px}.db-external-head h2{font-size:1.7rem!important}.db-external-head p{font-size:13px!important}.db-external-grid{gap:8px!important}.db-external-empty{padding:16px!important}.db-external-empty h3{font-size:19px!important}.db-external-empty p{font-size:13px!important}.db-external-empty-cta{width:100%;justify-content:center;box-sizing:border-box;min-height:46px}
        #contato .db-contact-grid{padding-top:30px!important;padding-bottom:30px!important}.db-contact-grid h2{font-size:1.85rem!important}.db-contact-grid p{font-size:14px!important;line-height:1.6!important}.db-contact-actions{display:grid!important;grid-template-columns:1fr 46px;gap:7px!important}.db-contact-actions>*{min-height:46px;justify-content:center;padding:9px!important;box-sizing:border-box}.db-contact-actions button{font-size:0!important}.db-contact-actions button svg{width:18px;height:18px}.db-contact-card{padding:12px!important;border-radius:14px!important;background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.07))!important;box-shadow:inset 0 1px rgba(255,255,255,.12),0 12px 28px rgba(17,8,22,.13)}.db-contact-card .db-contact-label{display:block;margin-bottom:2px;font-size:9px!important}.db-contact-phone{margin:0 0 8px!important;font-size:18px!important;line-height:1.2!important;letter-spacing:.01em}.db-contact-line{display:grid!important;grid-template-columns:32px minmax(0,1fr);align-items:center;gap:8px!important;padding:8px 0!important;font-size:12px!important;line-height:1.35!important}.db-contact-line>svg{width:30px;height:30px;padding:7px;border-radius:9px;background:rgba(240,206,131,.13);color:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface));box-sizing:border-box}.db-contact-line b{font-size:11px}.db-contact-line small{display:block;margin-top:1px;font-size:10px!important;line-height:1.35!important;color:var(--pc-color-border)}.db-contact-verified{margin-top:5px!important;padding:7px 9px!important;font-size:9px!important;line-height:1.35!important}.db-contact-verified svg{width:14px;height:14px;flex:0 0 auto}.db-footer{grid-template-columns:1fr!important;text-align:center!important;gap:10px!important;padding:18px 16px calc(18px + env(safe-area-inset-bottom))!important}.db-footer>div{justify-content:center!important;flex-wrap:wrap}.db-footer small{line-height:1.5}
      }
      @media(max-width:380px){.db-hero-actions{grid-template-columns:1fr}.db-hero-art{min-height:236px}.db-cover-stage{height:242px}.db-hero-cover{width:108px;height:174px}.db-book{flex-basis:84vw}.db-real-cover-shell{height:242px!important;min-height:242px!important}.db-real-cover-image{height:214px!important;max-height:214px!important}.db-about-facts{grid-template-columns:1fr!important}.db-about-facts span{text-align:left}.db-hero-copy [data-hero-foot] span:last-child{display:none}}
    `}</style>

    <header style={s.topbar} className="db-topbar">
      <div style={s.brand} className="db-brand">
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <span style={s.brandMark} className="db-brand-mark">P</span>
          <span><b>PreçoCerto</b><small>Marketplace Local</small></span>
        </a>
      </div>
      <nav className="db-top-label" style={s.topNav} aria-label="Navegação da autora"><a href="#livros">Livros</a><a href="#autora">A autora</a><a href="#contato">Contato</a></nav>
      <div style={s.topActions} className="db-top-actions">
        <button onClick={sharePage} style={s.iconButton} className="db-share-button" aria-label="Compartilhar página">{copied?<Check size={19}/>:<Share2 size={19}/>}<span className="db-icon-label">{copied?"Link copiado":"Compartilhar"}</span></button>
        <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.topWhats} className="db-top-whats" aria-label="Falar com Dorinha no WhatsApp"><MessageCircle size={19}/><span>Falar com a autora</span></a>
      </div>
    </header>

    <section style={{...s.hero,backgroundImage:`linear-gradient(90deg,rgba(15,7,20,.78) 0%,rgba(28,10,29,.3) 48%,rgba(35,13,31,.1) 100%),url('/dorinha-hero-editorial-v3.png'),${heroPlaceholder},${heroPattern}`}}>
      <div style={s.heroGlow}/>
      <div style={s.heroInner} className="db-section db-hero-grid">
        <div className="db-hero-copy">
          <div style={s.heroBadges} data-hero-badges>
            {profile.establishment.verified&&<span style={s.verified}><BadgeCheck size={14}/> Autora verificada</span>}
            <span style={s.directBadge}><Sparkles size={14}/> Literatura acreana</span>
          </div>
          <h1 className="db-hero-title">Dorinha<br/><em>Barroso</em></h1>
          <p style={s.heroLead}>{profile.merchant.hero_title || "Histórias que nascem no Acre e encontram leitores em todo o Brasil."}</p>
          <p style={s.heroText}>Escritora acreana, historiadora e pedagoga. Conheça sua trajetória, descubra suas obras e compre diretamente com a autora.</p>
          <div style={s.heroActions} className="db-hero-actions">
            <a href="#livros" style={s.heroPrimary} className="db-action"><BookOpen size={18}/> Explorar as obras <ArrowRight size={17}/></a>
            <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.heroSecondary} className="db-action"><MessageCircle size={18}/> Falar com Dorinha</a>
          </div>
          <div style={s.heroFoot} data-hero-foot>
            <span><MapPin size={15}/> Feijó · Acre</span>
            <span><PackageCheck size={15}/> Compra direta e segura</span>
          </div>
        </div>
        <div className="db-hero-art" aria-label="Coleção de livros de Dorinha Barroso">
          <div className="db-cover-stage">
            <div className="db-stage-glow"/>
            {profile.books.slice(0,4).map((book,index)=>{
              let src = book.image_url;
              if (book.slug === 'uma-viagem-ao-mundo-da-imaginacao') src = imagimacaoAsset.url;
              if (book.slug === 'mente-perversa') src = mentePerversaAsset.url;
              if (book.slug === 'uma-historia-de-superacao') src = superacaoAsset.url;
              if (book.slug === 'o-despertar-para-o-mundo-literario') src = despertarAsset.url;
              
              return src ? (
                <img 
                  key={book.id} 
                  className="db-hero-cover" 
                  src={src} 
                  alt={`Capa de ${book.name}`}
                  style={['uma-viagem-ao-mundo-da-imaginacao', 'mente-perversa', 'uma-historia-de-superacao', 'o-despertar-para-o-mundo-literario'].includes(book.slug) ? { objectFit: 'cover' } : {}}
                />
              ) : null;
            })}
            <div className="db-stage-note"><b>COLEÇÃO DA AUTORA</b>{profile.books.length} obras disponíveis para leitores de todo o Brasil.</div>
          </div>
        </div>
      </div>
    </section>

    <section id="livros" style={s.section} className="db-section">
      <div style={s.sectionHead} className="db-section-head">
        <div><span style={s.eyebrow}>OBRAS DE DORINHA BARROSO</span><h2 style={s.h2}>Uma autora. Diferentes caminhos de leitura.</h2><p style={s.sectionText}>Escolha uma obra para falar diretamente com Dorinha. Como os valores e a disponibilidade dos exemplares físicos podem mudar, o preço é confirmado no atendimento antes da compra.</p></div>
        <div style={s.catalogCount} className="db-catalog-count"><strong>{profile.books.length}</strong><span>títulos no catálogo</span></div>
      </div>
      <div className="db-mobile-swipe-hint"><span>Deslize para conhecer todas as obras</span><ArrowRight/></div>
      <div className="db-book-grid">
        {profile.books.map(book=>{
          let src = book.image_url;
          if (book.slug === 'uma-viagem-ao-mundo-da-imaginacao') src = imagimacaoAsset.url;
          if (book.slug === 'mente-perversa') src = mentePerversaAsset.url;
          if (book.slug === 'uma-historia-de-superacao') src = superacaoAsset.url;
          if (book.slug === 'o-despertar-para-o-mundo-literario') src = despertarAsset.url;
          
          return <article key={book.id} className="db-book" style={s.bookCard}>
          <div className={`db-real-cover-shell ${loadedCovers.has(book.id)?"is-loaded":""}`} data-real-cover="1">
            <span className="db-cover-placeholder" aria-hidden="true">Preparando a capa…</span>
            {src?<img className="db-real-cover-image" src={src} sizes="(max-width: 640px) 68vw, (max-width: 1050px) 34vw, 238px" width={480} height={720} loading="lazy" fetchPriority="low" decoding="async" onLoad={()=>setLoadedCovers(current=>{if(current.has(book.id))return current;const next=new Set(current);next.add(book.id);return next})} alt={`Capa do livro ${book.name}, de Dorinha Barroso`} style={['uma-viagem-ao-mundo-da-imaginacao', 'mente-perversa', 'uma-historia-de-superacao', 'o-despertar-para-o-mundo-literario'].includes(book.slug) ? { objectFit: 'cover' } : {}}/>:null}
          </div>
          <div style={s.bookBody}>
            <div style={s.bookTop}><span style={s.bookType}>LIVRO</span>{book.available&&<span style={s.available}>Disponível para consulta</span>}</div>
            <h3 style={s.bookTitle}>{book.name}</h3>
            <p style={s.bookDescription} className="db-book-description">{book.description}</p>
            {book.isbn&&<small style={s.isbn}>ISBN {book.isbn}</small>}
            <div style={s.bookPrice}><span>Venda direta</span><strong>{book.price_on_request?"Valor sob consulta":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(book.promotional_price??book.price)}</strong></div>
            <div style={s.bookActions}>
              <a href={whatsappUrl(whatsapp,book.name)} target="_blank" rel="noreferrer" style={s.buyDirect}><MessageCircle size={16}/> Comprar direto</a>
              {book.external_url&&<a href={book.external_url} target="_blank" rel="noreferrer" style={s.externalBtn} title="Ver na Amazon"><ExternalLink size={16}/></a>}
            </div>
          </div>
        </article>})}
      </div>
    </section>

    <section id="autora" style={s.aboutWrap}>
      <div style={s.section} className="db-section db-about-grid">
        <article style={s.aboutMain}>
          <span style={s.eyebrowGold}>A AUTORA</span>
          <h2 style={{...s.h2,color:"white",maxWidth:760}}>Da infância em Feijó a uma vida dedicada à leitura, à educação e à escrita.</h2>
          <p style={s.aboutText}>Maria das Dores Fernandes Barroso, conhecida como <strong>Dorinha Barroso</strong>, construiu uma trajetória em que literatura, formação acadêmica e compromisso com sua comunidade se encontram. Nascida em Feijó, no Acre, foi alfabetizada ainda criança por sua irmã e desenvolveu desde cedo uma relação profunda com os livros. É formada em História pela Universidade Federal do Acre (UFAC), licenciada em Pedagogia e pós-graduada em Psicopedagogia e Gestão Pública.</p>
          <p style={s.aboutText}>Sua experiência nas redes municipal e estadual aproximou leitura, memória e criação. Ao incentivar textos, poesias, contos e peças, Dorinha transformou vivências do cotidiano acreano em matéria literária. Suas obras combinam imaginação, sensibilidade e experiência humana, preservando raízes locais enquanto dialogam com leitores de diferentes lugares.</p>
          <div style={s.aboutFacts} className="db-about-facts"><span><b>Feijó</b><small>origem e identidade acreana</small></span><span><b>Formação</b><small>História, Pedagogia e Psicopedagogia</small></span><span><b>Literatura</b><small>memória, imaginação e experiência</small></span></div>
        </article>
        <figure className="db-author-portrait-card">
          <img src="/dorinha-author-portrait-v2.webp" width={1024} height={1536} loading="lazy" decoding="async" sizes="(max-width: 640px) calc(100vw - 36px), (max-width: 1050px) calc(100vw - 48px), 360px" alt="Dorinha Barroso segurando dois de seus livros"/>
          <figcaption><strong>Dorinha Barroso</strong><span>ESCRITORA · HISTORIADORA · ACREANA</span></figcaption>
        </figure>
      </div>
    </section>

    <section style={s.videoWrap}>
      <div style={s.videoSection} className="db-section db-video-grid">
        <div className="db-video-copy">
          <svg className="db-video-mark" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="db-play-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))"/><stop offset="1" stopColor="var(--pc-color-accent)"/></linearGradient></defs><circle cx="32" cy="32" r="29" fill="var(--pc-color-foreground)"/><circle cx="32" cy="32" r="23" fill="none" stroke="url(#db-play-gold)" strokeWidth="1.5"/><path d="M27 22.5 44 32 27 41.5Z" fill="url(#db-play-gold)"/></svg>
          <span style={s.eyebrow}>DORINHA EM VÍDEO</span>
          <h2 style={s.videoTitle}>Conheça a escritora mais de perto.</h2>
          <p>Assista a este registro de Dorinha Barroso e descubra mais sobre sua presença, sua voz e sua relação com a literatura.</p>
          <a className="db-video-link" href="https://youtu.be/PPXQcNOlmMU?si=Ok8iyN-OSfRSd9yO" target="_blank" rel="noreferrer"><Play size={16}/> Assistir diretamente no YouTube</a>
        </div>
        <div className="db-video-frame">
          <iframe src="https://www.youtube-nocookie.com/embed/PPXQcNOlmMU?rel=0&modestbranding=1" title="Vídeo da escritora Dorinha Barroso" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
        </div>
      </div>
    </section>

    <section style={s.externalSection} className="db-section">
      <div className="db-external-head">
        <div><span style={s.eyebrow}>TAMBÉM DISPONÍVEL ONLINE</span><h2 style={s.externalTitle}>Prefere comprar em outra plataforma?</h2><p style={s.externalText}>Encontre os canais digitais onde as obras da autora estão disponíveis.</p></div>
        <svg className="db-platform-illustration" viewBox="0 0 180 104" aria-hidden="true"><defs><linearGradient id="db-store-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))"/><stop offset="1" stopColor="var(--pc-color-accent)"/></linearGradient></defs><path d="M24 38h132l-10-18H34Z" fill="var(--pc-color-foreground)"/><path d="M30 38v48h120V38" fill="var(--pc-color-surface)" stroke="var(--pc-color-primary)" strokeWidth="2"/><path d="M21 38h138v9c0 8-6 14-14 14s-14-6-14-14c0 8-6 14-14 14s-14-6-14-14c0 8-6 14-14 14s-14-6-14-14c0 8-6 14-14 14s-14-6-14-14c0 8-6 14-14 14S21 55 21 47Z" fill="url(#db-store-gold)"/><rect x="48" y="67" width="35" height="19" rx="3" fill="var(--pc-color-background)"/><rect x="103" y="62" width="25" height="24" rx="3" fill="var(--pc-color-foreground)"/><path d="M16 91h148" stroke="var(--pc-color-primary)" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <div className="db-external-grid">
        {external.length > 0 ? (
          external.map((store) => (
            <a key={store.url} href={store.url} target="_blank" rel="noreferrer" style={s.externalCard} className="db-action">
              <span><ExternalLink size={17}/></span>
              <div><strong>{store.label}</strong><small>Abrir loja externa</small></div>
              <ArrowRight size={16}/>
            </a>
          ))
        ) : (
          <div className="db-external-empty">
            <h3>Disponível em breve nas plataformas</h3>
            <p>No momento, as obras estão disponíveis para aquisição imediata via venda direta com a autora.</p>
            <a href={whatsappUrl(whatsapp, "Interesse em adquirir sua obra")} target="_blank" rel="noreferrer" className="db-external-empty-cta">
              <MessageCircle size={18} /> Falar com Dorinha no WhatsApp
            </a>
          </div>
        )}
      </div>
      <p style={s.sourceNote}>A disponibilidade, o formato e os valores praticados em lojas externas são definidos pelas próprias plataformas e podem mudar sem aviso.</p>
    </section>

    <section id="contato" style={s.contactWrap}>
      <div style={s.section} className="db-section db-contact-grid">
        <div>
          <span style={s.eyebrowGold}>COMPRA DIRETA</span><h2 style={{...s.h2,color:"white"}}>Quer um exemplar? Fale diretamente com Dorinha.</h2><p style={s.contactText}>A venda direta aproxima o leitor da autora. Confirme edição, disponibilidade, valor, retirada ou forma de entrega antes de concluir o pedido.</p>
          <div style={s.contactActions} className="db-contact-actions"><a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.contactPrimary}><MessageCircle size={19}/> Iniciar conversa no WhatsApp</a><button onClick={sharePage} style={s.contactSecondary}>{copied?<Check size={18}/>:<Copy size={18}/>} {copied?"Link copiado":"Compartilhar loja"}</button></div>
        </div>
        <aside style={s.contactCard} className="db-contact-card">
          <span style={s.contactLabel} className="db-contact-label">ATENDIMENTO DA AUTORA</span><strong style={s.phone} className="db-contact-phone">{profile.merchant.phone}</strong>
          <div style={s.contactLine} className="db-contact-line"><MapPin size={18}/><span><b>Endereço para referência</b><small>{address}</small></span></div>
          <div style={s.contactLine} className="db-contact-line"><Truck size={18}/><span><b>Entrega e retirada</b><small>Condições combinadas diretamente no atendimento.</small></span></div>
          <div style={s.secureNote} className="db-contact-verified"><BadgeCheck size={16}/><span>Perfil verificado no PreçoCerto Marketplace Local.</span></div>
        </aside>
      </div>
    </section>

    <footer style={s.footer} className="db-footer"><div><a href="/" style={s.footerBrand}>PreçoCerto</a><span>Marketplace Local</span></div><div><a href="/estabelecimentos">Estabelecimentos</a><a href="/">Comparar preços</a><a href="/lojista">Para negócios locais</a></div><small>© 2026 PreçoCerto · Espaço literário de Dorinha Barroso.</small></footer>
  </main>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"var(--pc-color-background)",color:"var(--pc-color-foreground)",fontFamily:"'Inter Variable',Inter,system-ui,-apple-system,'Segoe UI',sans-serif"},
  loading:{minHeight:"100vh",display:"grid",placeItems:"center",alignContent:"center",gap:12,background:"var(--pc-color-background)",color:"var(--pc-color-foreground)"},
  topbar:{height:58,padding:"0 clamp(14px,4vw,58px)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,background:"rgba(250,248,244,.96)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(64,44,77,.10)",position:"sticky",top:0,zIndex:30,boxShadow:"0 8px 30px rgba(31,18,41,.04)"},
  brand:{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"var(--pc-color-foreground)"},brandMark:{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",background:"linear-gradient(145deg,var(--pc-color-foreground),var(--pc-color-foreground))",color:"color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))",fontWeight:900},topNav:{display:"flex",alignItems:"center",gap:25,fontSize:13,fontWeight:700,color:"var(--pc-color-muted)"},topActions:{display:"flex",alignItems:"center",gap:7},iconButton:{height:36,border:"1px solid var(--pc-color-border)",background:"white",borderRadius:9,padding:"0 11px",display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",fontWeight:700,fontSize:13,color:"var(--pc-color-foreground)"},topWhats:{height:36,borderRadius:9,padding:"0 12px",display:"inline-flex",alignItems:"center",gap:6,background:"var(--pc-color-foreground)",color:"white",textDecoration:"none",fontWeight:750,fontSize:13},
  hero:{minHeight:440,position:"relative",backgroundColor:"var(--pc-color-foreground)",backgroundSize:"cover,cover,cover,760px 520px",backgroundPosition:"center,center,center,right 4% center",backgroundRepeat:"no-repeat",overflow:"hidden",color:"white",borderBottom:"1px solid rgba(231,199,141,.22)"},heroGlow:{position:"absolute",width:440,height:440,borderRadius:"50%",background:"rgba(218,173,103,.14)",filter:"blur(90px)",right:"4%",top:"-5%"},heroInner:{position:"relative",zIndex:2,maxWidth:1180,margin:"0 auto",padding:"27px 24px 25px"},heroBadges:{display:"flex",flexWrap:"wrap",gap:7},verified:{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 9px",borderRadius:999,background:"rgba(137,192,255,.16)",border:"1px solid rgba(173,214,255,.32)",color:"var(--pc-color-background)",fontSize:11,fontWeight:750},directBadge:{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 9px",borderRadius:999,background:"rgba(231,199,141,.16)",border:"1px solid rgba(245,218,165,.34)",color:"var(--pc-color-background)",fontSize:11,fontWeight:750},localBadge:{padding:"7px 9px",borderRadius:999,border:"1px solid rgba(255,255,255,.18)",color:"var(--pc-color-background)",fontSize:12,fontWeight:650},heroLead:{maxWidth:600,fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.25rem,1.9vw,1.6rem)",lineHeight:1.4,color:"var(--pc-color-background)",margin:"0 0 9px"},heroText:{maxWidth:560,color:"var(--pc-color-border)",fontSize:15,lineHeight:1.65},heroActions:{display:"flex",flexWrap:"wrap",gap:8,marginTop:18},heroPrimary:{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 15px",borderRadius:9,background:"linear-gradient(135deg,color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface)),var(--pc-color-accent))",color:"var(--pc-color-foreground)",fontWeight:800,fontSize:13,textDecoration:"none",transition:".2s ease",boxShadow:"0 12px 28px rgba(0,0,0,.2)"},heroSecondary:{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 15px",borderRadius:9,background:"var(--pc-color-surface)",color:"var(--pc-color-foreground)",fontWeight:750,fontSize:13,textDecoration:"none",transition:".2s ease"},heroGhost:{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 15px",borderRadius:10,border:"1px solid rgba(255,255,255,.22)",background:"rgba(255,255,255,.06)",color:"white",fontWeight:750,cursor:"pointer",transition:".2s ease"},heroFoot:{display:"flex",flexWrap:"wrap",gap:16,marginTop:18,color:"var(--pc-color-border)",fontSize:12},
  section:{maxWidth:1180,margin:"0 auto",padding:"50px 24px"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:24,marginBottom:22},eyebrow:{display:"block",color:"var(--pc-color-primary)",fontSize:11,fontWeight:800,letterSpacing:".12em",marginBottom:8},eyebrowGold:{display:"block",color:"color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))",fontSize:11,fontWeight:800,letterSpacing:".12em",marginBottom:8},h2:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(2rem,3.5vw,2.85rem)",lineHeight:1.12,letterSpacing:"-.025em",margin:"0 0 12px",fontWeight:700},sectionText:{maxWidth:740,color:"var(--pc-color-muted)",fontSize:16,lineHeight:1.75},catalogCount:{minWidth:112,padding:12,border:"1px solid var(--pc-color-border)",borderRadius:12,background:"var(--pc-color-surface)",display:"grid",textAlign:"center",boxShadow:"0 10px 28px rgba(44,26,49,.05)"},
  bookCard:{background:"white",border:"1px solid var(--pc-color-border)",borderRadius:14,overflow:"hidden",transition:".25s ease",display:"flex",flexDirection:"column",height:"100%"},cover:{height:250,position:"relative",padding:"22px 19px",display:"flex",flexDirection:"column",overflow:"hidden",color:"white"},coverEyebrow:{fontSize:10,fontWeight:800,letterSpacing:".12em"},coverRule:{height:1,width:44,background:"rgba(255,255,255,.52)",margin:"14px 0 auto"},coverTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.55rem,2.2vw,2.1rem)",lineHeight:1.08,letterSpacing:"-.02em",maxWidth:210},coverAuthor:{marginTop:13,fontSize:10,fontWeight:750,letterSpacing:".12em",opacity:.92},coverIndex:{position:"absolute",right:15,bottom:9,fontSize:46,fontWeight:850,opacity:.09},bookBody:{padding:14,display:"flex",flexDirection:"column",flex:1},bookTop:{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"},bookType:{fontSize:10,fontWeight:800,letterSpacing:".11em",color:"var(--pc-color-muted)"},available:{fontSize:10,fontWeight:750,color:"var(--pc-color-primary)",background:"var(--pc-color-background)",borderRadius:999,padding:"5px 7px"},bookTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:19,lineHeight:1.2,margin:"9px 0 6px"},bookDescription:{fontSize:13,color:"var(--pc-color-muted)",lineHeight:1.55,margin:"0 0 9px"},isbn:{color:"var(--pc-color-muted)",fontSize:11},bookPrice:{marginTop:"auto",padding:"10px 0",display:"grid",gap:2,borderTop:"1px solid var(--pc-color-border)",fontSize:12},bookActions:{display:"grid",gridTemplateColumns:"1fr 40px",gap:7},buyDirect:{minHeight:41,borderRadius:9,background:"var(--pc-color-foreground)",color:"white",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontWeight:750,fontSize:13},externalBtn:{minHeight:41,borderRadius:9,border:"1px solid var(--pc-color-border)",display:"grid",placeItems:"center",color:"var(--pc-color-foreground)"},
  aboutWrap:{background:"var(--pc-color-foreground)"},aboutMain:{padding:"8px 0"},aboutText:{color:"var(--pc-color-border)",fontSize:16,lineHeight:1.78,maxWidth:760},aboutFacts:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:25},quoteCard:{background:"color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))",color:"var(--pc-color-foreground)",borderRadius:20,padding:"32px 28px",position:"relative",alignSelf:"stretch",display:"flex",flexDirection:"column",justifyContent:"center"},quoteMark:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:70,lineHeight:.6,opacity:.3,marginTop:28},
  videoWrap:{backgroundColor:"var(--pc-color-background)",backgroundImage:"linear-gradient(90deg,rgba(247,244,239,.98) 0%,rgba(247,244,239,.94) 52%,rgba(247,244,239,.76) 100%),url('/dorinha-hero-editorial-v3.png')",backgroundPosition:"center,right 42%",backgroundSize:"cover,620px auto",backgroundRepeat:"no-repeat"},videoSection:{maxWidth:1060,margin:"0 auto",padding:"30px 24px"},videoTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.55rem,2.5vw,2.1rem)",lineHeight:1.12,letterSpacing:"-.025em",margin:"0 0 9px",fontWeight:700,color:"var(--pc-color-foreground)"},
  externalSection:{maxWidth:1060,margin:"0 auto",padding:"32px 24px"},externalTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.55rem,2.5vw,2.1rem)",lineHeight:1.12,letterSpacing:"-.02em",margin:"0 0 7px",fontWeight:700},externalText:{maxWidth:620,color:"var(--pc-color-muted)",fontSize:14,lineHeight:1.6},externalCard:{background:"white",border:"1px solid var(--pc-color-border)",borderRadius:11,padding:12,display:"grid",gridTemplateColumns:"34px 1fr auto",gap:9,alignItems:"center",color:"var(--pc-color-foreground)",textDecoration:"none",transition:".2s ease"},sourceNote:{fontSize:11,color:"var(--pc-color-muted)",lineHeight:1.5,marginTop:11},
  contactWrap:{background:"linear-gradient(135deg,var(--pc-color-foreground),var(--pc-color-foreground))"},contactText:{color:"var(--pc-color-border)",fontSize:15,lineHeight:1.7,maxWidth:620},contactActions:{display:"flex",gap:8,marginTop:17},contactPrimary:{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 14px",borderRadius:9,background:"color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface))",color:"var(--pc-color-foreground)",fontWeight:800,textDecoration:"none",fontSize:13},contactSecondary:{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 14px",borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.04)",color:"white",fontWeight:750,cursor:"pointer",fontSize:13},contactCard:{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:15,padding:"18px 20px",color:"white"},contactLabel:{fontSize:10,fontWeight:800,letterSpacing:".11em",color:"var(--pc-color-border)"},phone:{display:"block",fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:26,margin:"6px 0 14px"},contactLine:{display:"flex",gap:9,padding:"11px 0",borderTop:"1px solid rgba(255,255,255,.15)",fontSize:14,lineHeight:1.55},secureNote:{display:"flex",gap:7,alignItems:"center",marginTop:9,padding:10,borderRadius:9,background:"rgba(231,199,141,.14)",color:"var(--pc-color-background)",fontSize:11},
  footer:{padding:"18px clamp(18px,4vw,58px)",display:"grid",gridTemplateColumns:"1fr auto auto",gap:22,alignItems:"center",background:"var(--pc-color-foreground)",color:"var(--pc-color-border)",fontSize:12},footerBrand:{fontSize:18,fontWeight:850,color:"white",textDecoration:"none"},
};
