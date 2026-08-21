import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock3, HeartHandshake, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { PublicFooter } from "../reference/ReferenceExperience";
import "./PublicFooterServicePages.css";

function Layout({ children }: { children: React.ReactNode }) {
  return <div className="pc-service-page"><div className="pc-service-topbar"><div className="pc-service-topbar__inner"><a className="pc-service-back" href="/"><ArrowLeft size={17}/> Voltar</a><div className="pc-service-brand">Preço<span>Certo</span></div></div></div>{children}<PublicFooter/></div>;
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
    if(dbError){console.error("merchant application error",dbError);setStatus("error");setError(dbError.code==="42P01"||dbError.code==="PGRST205"?databaseUnavailableMessage():"Não foi possível enviar a solicitação agora. Tente novamente em instantes.");return;}
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
    if(dbError){console.error("contact message error",dbError);setStatus("error");setError(dbError.code==="42P01"||dbError.code==="PGRST205"?databaseUnavailableMessage():"Não foi possível enviar sua mensagem agora. Tente novamente em instantes.");return;}
    setStatus("ok"); form.reset();
  }
  return <Layout><main className="pc-service-shell"><div className="pc-service-hero"><section className="pc-service-copy"><span className="pc-service-kicker"><MessageCircle size={15}/> Atendimento</span><h1>Fale com o PreçoCerto.</h1><p>Use este canal para relatar problemas, tirar dúvidas sobre o site ou enviar uma solicitação relacionada a produtos, preços e estabelecimentos.</p><div className="pc-service-points"><div className="pc-service-point"><Mail size={17}/> Sua mensagem é enviada para a base de atendimento.</div><div className="pc-service-point"><Clock3 size={17}/> Informe detalhes para facilitar a análise.</div><div className="pc-service-point"><ShieldCheck size={17}/> Evite enviar senhas ou dados bancários.</div></div></section><section className="pc-service-card"><h2>Enviar mensagem</h2><p>Descreva o que você precisa.</p>{status==="ok"?<div className="pc-service-status pc-service-status--ok"><CheckCircle2 size={18}/> Mensagem enviada com sucesso para o atendimento do PreçoCerto.</div>:<form className="pc-service-form" onSubmit={submit}><label>Seu nome<input name="name" required minLength={2} maxLength={120}/></label><label>Telefone ou e-mail<input name="contact" required minLength={3} maxLength={180}/></label><label>Assunto<select name="subject"><option>Problema no site</option><option>Produto ou preço</option><option>Estabelecimento</option><option>Conta e acesso</option><option>Outro</option></select></label><label>Mensagem<textarea name="message" required minLength={5} maxLength={4000}/></label>{status==="error"&&<div className="pc-service-status pc-service-status--error">{error}</div>}<button className="pc-service-submit" disabled={status==="sending"}>{status==="sending"?"Enviando...":<>Enviar mensagem <ArrowRight size={17}/></>}</button></form>}</section></div></main></Layout>;
}

export function CollaboratePage(){return <Layout><main className="pc-service-shell"><section className="pc-service-copy"><span className="pc-service-kicker"><HeartHandshake size={15}/> Colabore</span><h1>Ajude a manter os preços de Feijó atualizados.</h1><p>Você pode contribuir informando preços incorretos diretamente nos produtos e enviando informações que ajudem a melhorar a base local.</p></section><div className="pc-service-list"><article className="pc-service-info"><Store/><h3>Preço incorreto</h3><p>Abra um produto e use a opção de informar preço incorreto. A informação segue para moderação.</p></article><article className="pc-service-info"><MapPin/><h3>Novo comércio</h3><p>Se um estabelecimento ainda não aparece, use a página “Para empresas” para enviar uma solicitação de cadastro.</p><a href="/lojista">Cadastrar comércio →</a></article><article className="pc-service-info"><MessageCircle/><h3>Outra contribuição</h3><p>Use o canal de contato para enviar observações sobre categorias, produtos ou funcionamento da plataforma.</p><a href="/fale-conosco">Fale conosco →</a></article></div></main></Layout>}

export function PharmaciesPage(){return <Layout><main className="pc-service-shell"><section className="pc-service-copy"><span className="pc-service-kicker"><Phone size={15}/> Farmácias</span><h1>Farmácias e informações locais.</h1><p>Esta área concentra estabelecimentos do segmento farmacêutico cadastrados na plataforma. O PreçoCerto não exibe horários de plantão sem uma fonte oficial em tempo real.</p></section><div className="pc-service-list"><article className="pc-service-info"><Store/><h3>Consultar estabelecimentos</h3><p>Veja os comércios cadastrados e procure farmácias disponíveis na base.</p><a href="/estabelecimentos">Ver estabelecimentos →</a></article><article className="pc-service-info"><Building2/><h3>Cadastrar farmácia</h3><p>Proprietários podem enviar uma solicitação para cadastrar o estabelecimento.</p><a href="/lojista">Cadastrar comércio →</a></article><article className="pc-service-info"><MessageCircle/><h3>Informar correção</h3><p>Encontrou informação incorreta? Envie uma mensagem pelo canal de atendimento.</p><a href="/fale-conosco">Fale conosco →</a></article></div></main></Layout>}
