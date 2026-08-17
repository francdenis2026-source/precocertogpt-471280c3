import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type OfferVideoItem = {
  name: string;
  brand?: string;
  size?: string;
  price: number;
  previousPrice?: number;
  store: string;
  image: string;
};

export type OfferVideoProps = {
  city: string;
  headline: string;
  subheadline: string;
  cta: string;
  offers: OfferVideoItem[];
};

const palette = {
  navy: "#071C2A",
  navy2: "#0B2A3E",
  green: "#63D990",
  greenDark: "#0B5B3A",
  gold: "#D7B45A",
  cream: "#F6F3EA",
  ink: "#10212D",
  muted: "#6B7A83",
  white: "#FFFFFF",
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const mediaSrc = (src: string) => /^https?:\/\//i.test(src) ? src : staticFile(src.replace(/^\/+/, ""));

const FadeUp: React.FC<React.PropsWithChildren<{ from?: number; style?: React.CSSProperties }>> = ({ from = 0, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        ...style,
        opacity: interpolate(frame, [from, from + 0.45 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(frame, [from, from + 0.55 * fps], ["0px 48px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {children}
    </div>
  );
};

const BrandMark: React.FC<{ inverse?: boolean }> = ({ inverse = true }) => (
  <Img
    src={staticFile(inverse ? "logo-preco-certo-inversa.svg" : "logo-preco-certo.svg")}
    style={{ width: 292, height: 88, objectFit: "contain" }}
  />
);

const IntroScene: React.FC<Pick<OfferVideoProps, "city" | "headline" | "subheadline">> = ({ city, headline, subheadline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy, overflow: "hidden" }}>
      <Img
        src={staticFile("hero-feijo-real-shopper-2026.webp")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "58% center",
          opacity: 0.42,
          scale: interpolate(frame, [0, 3 * fps], [1.06, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,28,42,.18) 0%, rgba(7,28,42,.72) 48%, #071C2A 88%)" }} />
      <div style={{ position: "absolute", top: 112, left: 76 }}><BrandMark /></div>
      <div style={{ position: "absolute", left: 76, right: 76, bottom: 178 }}>
        <FadeUp from={0.35 * fps}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 999, backgroundColor: "rgba(99,217,144,.14)", border: "1px solid rgba(99,217,144,.36)", color: palette.green, fontSize: 30, fontWeight: 800, letterSpacing: 1.2 }}>
            OFERTAS LOCAIS · {city.toUpperCase()}
          </div>
        </FadeUp>
        <FadeUp from={0.65 * fps} style={{ marginTop: 30 }}>
          <div style={{ maxWidth: 880, color: palette.white, fontFamily: "Outfit, Inter, sans-serif", fontSize: 88, lineHeight: 0.98, fontWeight: 800, letterSpacing: -4.2 }}>{headline}</div>
        </FadeUp>
        <FadeUp from={0.95 * fps} style={{ marginTop: 28 }}>
          <div style={{ maxWidth: 820, color: "#D6E2E7", fontSize: 38, lineHeight: 1.35, fontWeight: 520 }}>{subheadline}</div>
        </FadeUp>
      </div>
    </AbsoluteFill>
  );
};

const OfferScene: React.FC<{ offer: OfferVideoItem; index: number; total: number }> = ({ offer, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const economy = offer.previousPrice && offer.previousPrice > offer.price ? offer.previousPrice - offer.price : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.cream, color: palette.ink, padding: "88px 68px 70px", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", right: -150, top: -180, backgroundColor: "rgba(99,217,144,.18)" }} />
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", left: -130, bottom: -120, backgroundColor: "rgba(215,180,90,.16)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BrandMark inverse={false} />
        <div style={{ color: palette.muted, fontSize: 27, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
      </div>
      <FadeUp from={0.12 * fps} style={{ marginTop: 68 }}>
        <div style={{ height: 640, display: "grid", placeItems: "center", borderRadius: 46, backgroundColor: palette.white, border: "2px solid rgba(16,33,45,.08)", boxShadow: "0 30px 70px rgba(7,28,42,.10)", overflow: "hidden" }}>
          <Img src={mediaSrc(offer.image)} style={{ width: "82%", height: "82%", objectFit: "contain", scale: interpolate(frame, [0, 0.8 * fps], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }) }} />
        </div>
      </FadeUp>
      <FadeUp from={0.32 * fps} style={{ marginTop: 48 }}>
        <div style={{ color: palette.greenDark, fontSize: 28, fontWeight: 900, letterSpacing: 1.4 }}>{offer.brand?.toUpperCase() || "DESTAQUE DO DIA"}</div>
        <div style={{ marginTop: 14, fontFamily: "Outfit, Inter, sans-serif", fontSize: 66, lineHeight: 1.03, fontWeight: 800, letterSpacing: -2.8 }}>{offer.name}</div>
        {offer.size && <div style={{ marginTop: 14, color: palette.muted, fontSize: 31, fontWeight: 650 }}>{offer.size}</div>}
      </FadeUp>
      <FadeUp from={0.5 * fps} style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 30, padding: "30px 34px", borderRadius: 32, backgroundColor: palette.navy, color: palette.white }}>
          <div>
            <div style={{ color: "#AFC0C8", fontSize: 24, fontWeight: 750 }}>MENOR PREÇO ENCONTRADO</div>
            <div style={{ marginTop: 8, color: palette.green, fontFamily: "Outfit, Inter, sans-serif", fontSize: 78, fontWeight: 900, letterSpacing: -2.5 }}>{money.format(offer.price)}</div>
          </div>
          {economy > 0 && <div style={{ padding: "13px 17px", borderRadius: 16, backgroundColor: "rgba(99,217,144,.12)", color: palette.green, fontSize: 25, fontWeight: 850 }}>economize {money.format(economy)}</div>}
        </div>
      </FadeUp>
      <FadeUp from={0.7 * fps} style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: palette.ink, fontSize: 31, fontWeight: 750 }}>
          <span style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: palette.greenDark }} />
          {offer.store}
        </div>
      </FadeUp>
    </AbsoluteFill>
  );
};

const EndScene: React.FC<Pick<OfferVideoProps, "city" | "cta">> = ({ city, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy, color: palette.white, display: "grid", placeItems: "center", textAlign: "center", padding: 76 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(99,217,144,.19), transparent 34%)" }} />
      <div style={{ position: "relative", display: "grid", justifyItems: "center" }}>
        <BrandMark />
        <div style={{ marginTop: 70, color: palette.gold, fontSize: 30, fontWeight: 850, letterSpacing: 1.5 }}>COMPARE ANTES DE COMPRAR</div>
        <div style={{ marginTop: 26, maxWidth: 900, fontFamily: "Outfit, Inter, sans-serif", fontSize: 84, lineHeight: 1.02, fontWeight: 850, letterSpacing: -3.8, opacity: interpolate(frame, [0, .55 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(.16,1,.3,1) }) }}>{cta}</div>
        <div style={{ marginTop: 36, color: "#B9C9D0", fontSize: 34 }}>Preços e comércio local de {city}</div>
        <div style={{ marginTop: 68, display: "inline-flex", padding: "18px 30px", borderRadius: 999, backgroundColor: palette.green, color: "#062319", fontSize: 31, fontWeight: 900 }}>precocerto.app</div>
      </div>
    </AbsoluteFill>
  );
};

export const OfferVideo: React.FC<OfferVideoProps> = ({ city, headline, subheadline, cta, offers }) => {
  const { fps } = useVideoConfig();
  const safeOffers = offers.slice(0, 3);
  const introFrames = Math.round(2.7 * fps);
  const offerFrames = Math.round(3.35 * fps);
  const endFrames = Math.round(2.25 * fps);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <Sequence from={0} durationInFrames={introFrames}><IntroScene city={city} headline={headline} subheadline={subheadline} /></Sequence>
      {safeOffers.map((offer, index) => (
        <Sequence key={`${offer.name}-${index}`} from={introFrames + index * offerFrames} durationInFrames={offerFrames}>
          <OfferScene offer={offer} index={index} total={safeOffers.length} />
        </Sequence>
      ))}
      <Sequence from={introFrames + safeOffers.length * offerFrames} durationInFrames={endFrames}><EndScene city={city} cta={cta} /></Sequence>
    </AbsoluteFill>
  );
};

export const defaultOfferVideoProps: OfferVideoProps = {
  city: "Feijó, Acre",
  headline: "3 ofertas para economizar hoje.",
  subheadline: "Compare preços locais em segundos e escolha onde sua compra vale mais.",
  cta: "Encontre o menor preço perto de você.",
  offers: [
    { name: "Arroz Tio João Tipo 1", brand: "Tio João", size: "5 kg", price: 29.89, previousPrice: 32.50, store: "Central Super", image: "products/arroz-tio-joao-5kg.png" },
    { name: "Café 3 Corações Tradicional", brand: "3 Corações", size: "500 g", price: 15.75, previousPrice: 17.20, store: "Mercado Rebouças", image: "products/cafe-3-coracoes-500g.jpg" },
    { name: "Leite Integral Italac", brand: "Italac", size: "1 L", price: 5.69, previousPrice: 5.99, store: "Pague Pouco", image: "products/leite-italac-1l.jpg" },
  ],
};