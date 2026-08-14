import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock3, HeartHandshake, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Store } from "lucide-react";
import { supabase } from "../lib/supabase";

const pageStyle = `
.pc-service-page{min-height:100vh;background:var(--bg,var(--pc-color-surface));color:var(--text-main,var(--pc-color-foreground))}
.pc-service-topbar{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--surface,var(--pc-color-surface)) 92%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--border,var(--pc-color-muted))}
.pc-service-topbar__inner{max-width:1120px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.pc-service-back{display:inline-flex;align-items:center;gap:8px;color:var(--text-main);text-decoration:none;font-weight:750;font-size:.9rem}
.pc-service-brand{font-weight:900;letter-spacing:-.03em}.pc-service-brand span{color:var(--green,var(--pc-color-primary))}
.pc-service-shell{max-width:1120px;margin:0 auto;padding:56px 22px 72px}
.pc-service-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:28px;align-items:start}
.pc-service-copy{padding:18px 0}.pc-service-kicker{display:inline-flex;align-items:center;gap:7px;color:var(--green,var(--pc-color-primary));font-size:.76rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
.pc-service-copy h1{font-size:clamp(2.15rem,5vw,3.7rem);line-height:1.02;letter-spacing:-.045em;margin:14px 0 16px}.pc-service-copy p{max-width:680px;color:var(--muted,var(--pc-color-primary));font-size:1rem;line-height:1.65}
.pc-service-points{display:grid;gap:10px;margin-top:24px}.pc-service-point{display:flex;gap:10px;align-items:flex-start;color:var(--muted,var(--pc-color-primary));font-size:.9rem}.pc-service-point svg{color:var(--green,var(--pc-color-primary));flex:0 0 auto;margin-top:2px}
.pc-service-card{background:var(--surface,var(--pc-color-surface));border:1px solid var(--border,var(--pc-color-muted));border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(15,23,42,.08)}
.pc-service-card h2{font-size:1.35rem;margin:0 0 6px}.pc-service-card>p{margin:0 0 20px;color:var(--muted,var(--pc-color-primary));font-size:.88rem;line-height:1.5}
.pc-service-form{display:grid;gap:13px}.pc-service-form label{display:grid;gap:6px;font-size:.8rem;font-weight:750}.pc-service-form input,.pc-service-form select,.pc-service-form textarea{width:100%;min-height:46px;border:1px solid var(--border,var(--pc-color-muted));border-radius:11px;background:var(--surface-2,var(--pc-color-surface));color:var(--text-main,var(--pc-color-foreground));padding:10px 12px;font:inherit;outline:none}.pc-service-form textarea{min-height:104px;resize:vertical}.pc-service-form input:focus,.pc-service-form select:focus,.pc-service-form textarea:focus{border-color:var(--green,var(--pc-color-primary));box-shadow:0 0 0 3px color-mix(in srgb,var(--green,var(--pc-color-primary)) 15%,transparent)}
.pc-service-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pc-service-submit{min-height:48px;border:0;border-radius:12px;background:var(--green,var(--pc-color-primary));color:var(--pc-color-foreground);font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}.pc-service-submit:disabled{opacity:.65;cursor:wait}
.pc-service-note{font-size:.74rem;color:var(--muted,var(--pc-color-primary));line-height:1.45}.pc-service-status{display:flex;gap:9px;align-items:flex-start;padding:12px 13px;border-radius:11px;font-size:.82rem;line-height:1.45}.pc-service-status--ok{background:var(--pc-color-surface);color:var(--pc-color-primary);border:1px solid color-mix(in srgb, var(--pc-color-primary) 10%, var(--pc-color-surface))}.pc-service-status--error{background:var(--pc-color-background);color:var(--pc-color-foreground);border:1px solid color-mix(in srgb, var(--pc-color-danger) 10%, var(--pc-color-surface))}
.pc-service-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:36px}.pc-service-info{background:var(--surface,var(--pc-color-surface));border:1px solid var(--border,var(--pc-color-muted));border-radius:15px;padding:18px}.pc-service-info svg{color:var(--green,var(--pc-color-primary))}.pc-service-info h3{margin:10px 0 5px;font-size:1rem}.pc-service-info p{margin:0;color:var(--muted,var(--pc-color-primary));font-size:.82rem;line-height:1.5}
@media(max-width:760px){.pc-service-shell{padding:34px 16px 54px}.pc-service-hero{grid-template-columns:1fr}.pc-service-copy{padding:4px 0}.pc-service-copy h1{font-size:2.25rem}.pc-service-grid2{grid-template-columns:1fr}.pc-service-list{grid-template-columns:1fr}.pc-service-card{padding:19px;border-radius:16px}.pc-service-topbar__inner{padding:12px 16px}}
`;

function Layout({ children }: { children: React.ReactNode }) {
  return <div className="pc-service-page"><style>{pageStyle}</style><div className="pc-service-topbar"><div className="pc-service-topbar__inner"><a className="pc-service-back" href="/"><ArrowLeft size={17}/> Voltar</a><div className="pc-service-brand">Preço<span>Certo</span></div></div></div>{children}</div>;
}

function databaseUnavailableMessage() {
  return "O envio ainda não está disponível no banco. Aplique o arquivo db/sql/fase_public_requests.sql no SQL Editor do Supabase e tente novamente.";
}

export function MerchantSignupPage() {
  const [status,setStatus]=useState<"idle"|"sending"|"ok"|"error">("idle");
  const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setStatus("sending"); setError("");
    const form=e.currentTarget;
    const fd=new FormData(form);
    const business_name=String(fd.get("name")||"").trim();
    const neighborhood=String(fd.get("neighborhood")||"").trim();
    const kind=String(fd.get("kind")||"market");
    const owner_name=String(fd.get("owner")||"").trim() || null;
    const phone=String(fd.get("phone")||"").trim() || null;
    if(!business_name||!neighborhood){setStatus("error");setError("Informe o nome do comércio e o bairro.");return;}
    if(!supabase){setStatus("error");setError("O serviço de cadastro está indisponível agora.");return;}
    const {error:dbError}=await supabase.from("merchant_applications").insert({business_name,neighborhood,kind,owner_name,phone});
    if(dbError){
      console.error("merchant application error",dbError);
      setStatus("error");
      setError(dbError.code==="42P01"||dbError.code==="PGRST205"?databaseUnavailableMessage():"Não foi possível enviar a solicitação agora. Tente novamente em instantes.");
      return;
    }
    setStatus("ok"); form.reset();
  }
  return <Layout><main className="pc-service-shell"><div className="pc-service-hero"><section className="pc-service-copy"><span className="pc-service-kicker"><Building2 size={15}/> Para comerciantes</span><h1>Cadastre seu comércio no PreçoCerto.</h1><p>Faça seu estabelecimento aparecer para consumidores de Feijó que já estão pesquisando onde comprar. Sua solicitação entra em análise antes de virar um estabelecimento público.</p><div className="pc-service-points"><div className="pc-service-point"><CheckCircle2 size={17}/> Solicitação enviada para análise.</div><div className="pc-service-point"><CheckCircle2 size={17}/> Produtos e preços podem ser vinculados após aprovação.</div><div className="pc-service-point"><ShieldCheck size={17}/> Cadastro público separado da tabela oficial de estabelecimentos.</div></div></section><section className="pc-service-card"><h2>Quero cadastrar meu comércio</h2><p>Preencha os dados essenciais do estabelecimento.</p>{status==="ok"?<div className="pc-service-status pc-service-status--ok"><CheckCircle2 size={18}/> Solicitação recebida com sucesso. O cadastro ficará pendente até a validação da plataforma.</div>:<form className="pc-service-form" onSubmit={submit}><label>Nome do comércio<input name="name" required minLength={2} maxLength={160} placeholder="Ex.: Mercado Avenida"/></label><div className="pc-service-grid2"><label>Bairro<input name="neighborhood" required minLength={2} maxLength={120} placeholder="Ex.: Centro"/></label><label>Tipo<select name="kind" defaultValue="market"><option value="market">Mercado / supermercado</option><option value="butcher">Açougue</option><option value="pharmacy">Farmácia</option><option value="other">Outro comércio</option></select></label></div><label>Responsável<input name="owner" maxLength={160} placeholder="Nome do responsável"/></label><label>Telefone / WhatsApp<input name="phone" maxLength={40} inputMode="tel" placeholder="(68) 99999-9999"/></label>{status==="error"&&<div className="pc-service-status pc-service-status--error">{error}</div>}<button className="pc-service-submit" disabled={status==="sending"}>{status==="sending"?"Enviando...":<>Enviar solicitação <ArrowRight size={17}/></>}</button><span className="pc-service-note">O envio não cria uma loja pública automaticamente. A administração deve validar a solicitação antes da publicação.</span></form>}</section></div></main></Layout>;
}

export function ContactPage(){
  const [status,setStatus]=useState<"idle"|"sending"|"ok"|"error">("idle");
  const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setStatus("sending"); setError("");
    const form=e.currentTarget;
    const fd=new FormData(form);
    const name=String(fd.get("name")||"").trim();
    const contact=String(fd.get("contact")||"").trim();
    const subject=String(fd.get("subject")||"").trim();
    const message=String(fd.get("message")||"").trim();
    if(name.length<2||contact.length<3||message.length<5){setStatus("error");setError("Preencha nome, contato e uma mensagem com informações suficientes.");return;}
    if(!supabase){setStatus("error");setError("O serviço de atendimento está indisponível agora.");return;}
    const {error:dbError}=await supabase.from("contact_messages").insert({name,contact,subject,message});
    if(dbError){
      console.error("contact message error",dbError);
      setStatus("error");
      setError(dbError.code==="42P01"||dbError.code==="PGRST205"?databaseUnavailableMessage():"Não foi possível enviar sua mensagem agora. Tente novamente em instantes.");
      return;
    }
    setStatus("ok"); form.reset();
  }
  return <Layout><main className="pc-service-shell"><div className="pc-service-hero"><section className="pc-service-copy"><span className="pc-service-kicker"><MessageCircle size={15}/> Atendimento</span><h1>Fale com o PreçoCerto.</h1><p>Use este canal para relatar problemas, tirar dúvidas sobre o site ou enviar uma solicitação relacionada a produtos, preços e estabelecimentos.</p><div className="pc-service-points"><div className="pc-service-point"><Mail size={17}/> Sua mensagem é enviada para a base de atendimento.</div><div className="pc-service-point"><Clock3 size={17}/> Informe detalhes para facilitar a análise.</div><div className="pc-service-point"><ShieldCheck size={17}/> Evite enviar senhas ou dados bancários.</div></div></section><section className="pc-service-card"><h2>Enviar mensagem</h2><p>Descreva o que você precisa.</p>{status==="ok"?<div className="pc-service-status pc-service-status--ok"><CheckCircle2 size={18}/> Mensagem enviada com sucesso para o atendimento do PreçoCerto.</div>:<form className="pc-service-form" onSubmit={submit}><label>Seu nome<input name="name" required minLength={2} maxLength={120}/></label><label>Telefone ou e-mail<input name="contact" required minLength={3} maxLength={180}/></label><label>Assunto<select name="subject"><option>Problema no site</option><option>Produto ou preço</option><option>Estabelecimento</option><option>Conta e acesso</option><option>Outro</option></select></label><label>Mensagem<textarea name="message" required minLength={5} maxLength={4000}/></label>{status==="error"&&<div className="pc-service-status pc-service-status--error">{error}</div>}<button className="pc-service-submit" disabled={status==="sending"}>{status==="sending"?"Enviando...":<>Enviar mensagem <ArrowRight size={17}/></>}</button></form>}</section></div></main></Layout>;
}

export function CollaboratePage(){
 return <Layout><main className="pc-service-shell"><section className="pc-service-copy"><span className="pc-service-kicker"><HeartHandshake size={15}/> Colabore</span><h1>Ajude a manter os preços de Feijó atualizados.</h1><p>Você pode contribuir informando preços incorretos diretamente nos produtos e enviando informações que ajudem a melhorar a base local.</p></section><div className="pc-service-list"><article className="pc-service-info"><Store/><h3>Preço incorreto</h3><p>Abra um produto e use a opção de informar preço incorreto. A informação segue para moderação.</p></article><article className="pc-service-info"><MapPin/><h3>Novo comércio</h3><p>Se um estabelecimento ainda não aparece, use a página “Para empresas” para enviar uma solicitação de cadastro.</p><a href="/lojista">Cadastrar comércio →</a></article><article className="pc-service-info"><MessageCircle/><h3>Outra contribuição</h3><p>Use o canal de contato para enviar observações sobre categorias, produtos ou funcionamento da plataforma.</p><a href="/fale-conosco">Fale conosco →</a></article></div></main></Layout>;
}

export function PharmaciesPage(){
 return <Layout><main className="pc-service-shell"><section className="pc-service-copy"><span className="pc-service-kicker"><Phone size={15}/> Farmácias</span><h1>Farmácias e informações locais.</h1><p>Esta área está preparada para concentrar estabelecimentos do segmento farmacêutico cadastrados na plataforma. Como o PreçoCerto não possui, neste componente, uma fonte oficial de escala de plantão em tempo real, a página não apresenta horários de plantão inventados.</p></section><div className="pc-service-list"><article className="pc-service-info"><Store/><h3>Consultar estabelecimentos</h3><p>Veja os comércios cadastrados e procure farmácias disponíveis na base.</p><a href="/estabelecimentos">Ver estabelecimentos →</a></article><article className="pc-service-info"><Building2/><h3>Cadastrar farmácia</h3><p>Proprietários podem enviar uma solicitação para cadastrar o estabelecimento.</p><a href="/lojista">Cadastrar comércio →</a></article><article className="pc-service-info"><MessageCircle/><h3>Informar correção</h3><p>Encontrou informação incorreta? Envie uma mensagem pelo canal de atendimento.</p><a href="/fale-conosco">Fale conosco →</a></article></div></main></Layout>;
}
