import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BookOpen, Building2, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "./ReferenceExperience";
import "./CulturalProfilePage.css";

gsap.registerPlugin(ScrollTrigger);

type CulturalProfileKind = "dorinha" | "fremix";

const profiles = {
  dorinha: {
    eyebrow: "PERFIL EDITORIAL · AUTORA",
    title: "Dorinha Barroso",
    summary: "Um espaço próprio para reunir a presença editorial da autora dentro do PreçoCerto, separado das lojas e catálogos comerciais.",
    icon: BookOpen,
    sections: [
      ["Sobre este perfil", "Esta página organiza conteúdos, obras e informações relacionadas à autora em uma experiência editorial clara e independente do diretório de estabelecimentos."],
      ["Como funciona", "Quando livros e conteúdos da autora forem cadastrados, eles poderão aparecer aqui e também no setor Livros e cultura, mantendo contexto e navegação próprios."],
    ],
  },
  fremix: {
    eyebrow: "PERFIL CULTURAL · PROJETO",
    title: "Fremix Produções",
    summary: "Um espaço cultural próprio dentro do PreçoCerto para organizar projetos, conteúdos e iniciativas sem misturá-los com o catálogo comercial.",
    icon: Building2,
    sections: [
      ["Sobre este espaço", "O perfil foi estruturado para apresentar iniciativas culturais com identidade própria, sem tratá-las como supermercado ou estabelecimento de comparação de preços."],
      ["Como funciona", "Conteúdos e projetos vinculados poderão ser reunidos aqui e descobertos pelo setor Livros e cultura, com acesso direto ao perfil."],
    ],
  },
} as const;

export function CulturalProfilePage({ kind }: { kind: CulturalProfileKind }) {
  const profile = profiles[kind];
  const Icon = profile.icon;
  const pageRef = useRef<HTMLDivElement>(null);

  // Entrada suave da hero (ícone, título, resumo) e revelação dos cards e
  // do aviso ao rolar a página. Respeita prefers-reduced-motion e usa só
  // transform/opacity.
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".culture-profile-icon, .culture-profile-hero > div > *", { y: 16, opacity: 0, duration: .55, stagger: .06, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".culture-profile-grid article, .culture-profile-note").forEach((section) => {
      gsap.from(section, { scrollTrigger: { trigger: section, start: "top 88%", once: true }, y: 22, opacity: 0, duration: .5, ease: "power2.out" });
    });
  }, { scope: pageRef, dependencies: [kind] });

  return <div className="culture-profile-page" ref={pageRef}>
    <PublicHeader/>
    <main id="conteudo-principal" className="culture-profile-shell">
      <section className="culture-profile-hero">
        <div className="culture-profile-icon"><Icon /></div>
        <div><span>{profile.eyebrow}</span><h1>{profile.title}</h1><p>{profile.summary}</p><small><MapPin /> Feijó · Acre · Brasil</small></div>
      </section>
      <section className="culture-profile-grid">
        {profile.sections.map(([title, copy], index) => <article key={title}><b>0{index + 1}</b><Sparkles /><div><h2>{title}</h2><p>{copy}</p></div></article>)}
      </section>
      <aside className="culture-profile-note"><BookOpen /><div><strong>Área cultural do PreçoCerto</strong><span>Perfis editoriais são organizados separadamente de lojas, mercados e estabelecimentos comerciais.</span></div><Link to="/livros">Explorar cultura <ArrowRight /></Link></aside>
    </main>
  </div>;
}
