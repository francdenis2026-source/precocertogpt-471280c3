import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Eye, EyeOff, PackageSearch, ShieldCheck, Store, TrendingDown } from "lucide-react";
import { supabase } from "../lib/roles";
import { resolveAuthenticatedHome } from "../lib/merchantPlatform";
import "./MerchantOnboardingPage.css";

type View = "login" | "register";

export function MerchantOnboardingPage() {
  const [view, setView] = useState<View>(() => new URLSearchParams(location.search).get("cadastro") === "1" ? "register" : "login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { document.body.classList.add("pc-merchant-access"); return () => document.body.classList.remove("pc-merchant-access"); }, []);

  function select(next: View) { setView(next); setError(""); setMessage(""); history.replaceState({}, "", next === "register" ? "/lojista?cadastro=1" : "/lojista"); }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const client = supabase;
    if (!client) { setError("O serviço de acesso está temporariamente indisponível. Tente novamente em instantes."); setBusy(false); return; }
    const data = new FormData(event.currentTarget);
    const { error: authError } = await client.auth.signInWithPassword({ email: String(data.get("email")), password: String(data.get("password")) });
    if (authError) { setError("Não foi possível entrar. Confira o e-mail e a senha."); setBusy(false); return; }
    const destination = await resolveAuthenticatedHome("/painel-lojista");
    if (!destination.startsWith("/painel-lojista")) { await client.auth.signOut(); setError("Esta conta ainda não está vinculada a um negócio ativo. Solicite o cadastro ao lado."); setBusy(false); return; }
    location.assign(destination);
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const client = supabase;
    if (!client) { setError("O serviço de cadastro está temporariamente indisponível. Tente novamente em instantes."); setBusy(false); return; }
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));
    const businessName = String(data.get("business_name")).trim();
    const { data: auth, error: authError } = await client.auth.signUp({ email, password, options: { data: { full_name: String(data.get("owner_name")).trim(), account_type: "merchant" } } });
    if (authError) { setError(authError.message.includes("already") ? "Este e-mail já possui acesso. Use a opção Entrar." : "Não foi possível criar o acesso. Revise os dados e tente novamente."); setBusy(false); return; }
    if (auth.session) {
      const { error: applicationError } = await client.from("merchant_applications").insert({ applicant_user_id: auth.user!.id, business_name: businessName, neighborhood: String(data.get("neighborhood")).trim(), kind: String(data.get("kind")), owner_name: String(data.get("owner_name")).trim(), phone: String(data.get("phone")).trim() || null, email, desired_plan: "professional", establishment_id: null, status: "pending" });
      if (applicationError) { setError("O acesso foi criado, mas não conseguimos enviar o negócio. Entre e tente novamente."); setBusy(false); return; }
    }
    setMessage(auth.session ? "Solicitação enviada. Avisaremos quando o painel estiver liberado." : "Acesso criado. Confirme o e-mail para concluir a solicitação do negócio.");
    setBusy(false);
  }

  return <main className="merchant-access">
    <section className="merchant-access__visual" aria-label="PreçoCerto para comerciantes">
      <img src="/merchant-access-hero.webp" alt="Comerciante administrando seu catálogo em um tablet" width="1200" height="900" />
      <div className="merchant-access__shade" />
      <a className="merchant-access__brand" href="/" aria-label="PreçoCerto — início"><span><TrendingDown /></span>preço<strong>certo</strong></a>
      <div className="merchant-access__pitch"><span className="merchant-access__eyebrow">ÁREA DO LOJISTA</span><h1>Seu negócio, pronto para ser encontrado.</h1><p>Organize catálogo, preços e presença local em um único painel.</p><div className="merchant-access__features"><span><PackageSearch /> Catálogo atualizado</span><span><BarChart3 /> Visão da operação</span><span><BadgeCheck /> Presença profissional</span></div></div>
      <small>PreçoCerto · Comércio local de Feijó</small>
    </section>
    <section className="merchant-access__content">
      <div className="merchant-access__top"><a href="/"><ArrowLeft /> Voltar ao site</a><span><ShieldCheck /> Ambiente seguro</span></div>
      <div className="merchant-access__card">
        <div className="merchant-access__heading"><span><Store /> PORTA DE ENTRADA DO SEU NEGÓCIO</span><h2>{view === "login" ? "Acesse seu painel" : "Cadastre seu negócio"}</h2><p>{view === "login" ? "Entre com o acesso vinculado ao estabelecimento." : "Crie o acesso do responsável e envie os dados essenciais."}</p></div>
        <div className="merchant-access__tabs" role="tablist" aria-label="Escolha uma opção"><button role="tab" aria-selected={view === "login"} onClick={() => select("login")}>Entrar</button><button role="tab" aria-selected={view === "register"} onClick={() => select("register")}>Cadastrar negócio</button></div>
        {view === "login" ? <form className="merchant-access__form" onSubmit={submitLogin}>
          <label>E-mail do responsável<input name="email" type="email" autoComplete="username" placeholder="nome@empresa.com" required /></label>
          <label>Senha<div className="merchant-access__password"><input name="password" type={passwordVisible ? "text" : "password"} autoComplete="current-password" placeholder="Sua senha" minLength={6} required /><button type="button" onClick={() => setPasswordVisible(v => !v)} aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}>{passwordVisible ? <EyeOff /> : <Eye />}</button></div></label>
          {error && <div className="merchant-access__alert" role="alert">{error}</div>}
          <button className="merchant-access__submit" disabled={busy}>{busy ? "Entrando…" : <>Entrar no painel <ArrowRight /></>}</button>
          <a className="merchant-access__support" href="/fale-conosco">Preciso recuperar meu acesso</a>
        </form> : <form className="merchant-access__form merchant-access__form--register" onSubmit={submitRegistration}>
          <div className="merchant-access__row"><label>Nome do negócio<input name="business_name" placeholder="Ex.: Mercado Avenida" required /></label><label>Segmento<select name="kind" defaultValue="market"><option value="market">Mercado</option><option value="butcher">Açougue</option><option value="pharmacy">Farmácia</option><option value="other">Outro</option></select></label></div>
          <div className="merchant-access__row"><label>Responsável<input name="owner_name" autoComplete="name" placeholder="Nome completo" required /></label><label>Bairro<input name="neighborhood" placeholder="Centro" required /></label></div>
          <div className="merchant-access__row"><label>E-mail profissional<input name="email" type="email" autoComplete="email" placeholder="nome@empresa.com" required /></label><label>WhatsApp<input name="phone" type="tel" autoComplete="tel" placeholder="(68) 99999-9999" /></label></div>
          <label>Crie uma senha<input name="password" type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" minLength={6} required /></label>
          {error && <div className="merchant-access__alert" role="alert">{error}</div>}{message && <div className="merchant-access__success" role="status">{message}</div>}
          <button className="merchant-access__submit" disabled={busy || !!message}>{busy ? "Enviando…" : <>Solicitar cadastro <ArrowRight /></>}</button>
          <p className="merchant-access__terms">A solicitação passa por validação antes da liberação do painel.</p>
        </form>}
      </div>
      <p className="merchant-access__consumer">Quer apenas comparar preços? <a href="/login">Entrar como consumidor</a></p>
    </section>
  </main>;
}
