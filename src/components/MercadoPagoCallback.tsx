import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Loader2, XCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/roles";

export function MercadoPagoCallback() {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Concluindo conexão com Mercado Pago…");
  const [correlationId, setCorrelationId] = useState<string | null>(null);

  const runCallback = useCallback(async () => {
    setState("loading");
    setMessage("Concluindo conexão com Mercado Pago…");

    if (!supabase) {
      setState("error");
      setMessage("Supabase indisponível.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthState = params.get("state");
    const merchantId = sessionStorage.getItem("pc_mp_merchant_id");

    if (!code || !oauthState || !merchantId) {
      setState("error");
      setMessage("Dados da autorização incompletos. Inicie a conexão novamente no painel da loja.");
      return;
    }

    const requestId = Math.random().toString(36).substring(2, 15);
    setCorrelationId(requestId);

    try {
      const { data, error } = await supabase.functions.invoke("mercadopago-oauth", {
        body: { action: "callback", merchantId, code, state: oauthState, requestId },
      });

      if (error || data?.error) {
        setState("error");
        setMessage(data?.error || error?.message || "Não foi possível concluir a conexão.");
        console.error(`[MP-OAUTH-ERROR] ID: ${requestId}`, error || data?.error);
        return;
      }

      sessionStorage.removeItem("pc_mp_merchant_id");
      setState("success");
      setMessage("Conta Mercado Pago conectada com sucesso.");
      setTimeout(() => window.location.replace("/painel-lojista"), 1200);
    } catch (err: any) {
      setState("error");
      setMessage(err.message || "Erro inesperado ao processar a resposta.");
      console.error(`[MP-OAUTH-CRASH] ID: ${requestId}`, err);
    }
  }, []);

  useEffect(() => {
    runCallback();
  }, [runCallback]);

  return (
    <main style={s.page}>
      {state === "error" && (
        <div style={s.banner}>
          <AlertTriangle size={20} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span>Credenciais Mercado Pago configuradas com sucesso no banco de dados.</span>
            {correlationId && <small style={{ opacity: 0.8, fontSize: '0.75rem' }}>ID de suporte: {correlationId}</small>}
          </div>
        </div>
      )}

      {state === "loading" ? (
        <Loader2 size={42} className="animate-spin" />
      ) : state === "success" ? (
        <CheckCircle2 size={48} color="var(--pc-color-primary)" />
      ) : (
        <XCircle size={48} color="var(--pc-color-danger)" />
      )}

      <h1>
        {state === "success"
          ? "Conexão concluída"
          : state === "error"
          ? "Falha na conexão"
          : "Conectando…"}
      </h1>

      <p style={{ maxWidth: 400 }}>{message}</p>

      {state === "error" && (
        <div style={s.actions}>
          <button onClick={runCallback} style={s.retryButton}>
            <RotateCcw size={18} />
            Tentar novamente
          </button>
          <a href="/painel-lojista" style={s.backButton}>
            Voltar ao painel
          </a>
        </div>
      )}
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    textAlign: "center",
    fontFamily:"'Manrope Variable', Manrope, system-ui, sans-serif",
    padding: 24,
    background: "var(--pc-color-surface)",
  },
  banner: {
    background: "var(--pc-color-muted)",
    color: "var(--pc-color-foreground)",
    padding: "12px 24px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: "0.95rem",
    fontWeight: 500,
    marginBottom: 24,
    border: "1px solid color-mix(in srgb, var(--pc-color-danger) 10%, var(--pc-color-surface))",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 8,
  },
  retryButton: {
    background: "var(--pc-color-foreground)",
    color: "white",
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    transition: "transform 0.1s",
  },
  backButton: {
    background: "transparent",
    color: "var(--pc-color-muted)",
    padding: "10px 20px",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid var(--pc-color-border)",
    fontWeight: 500,
  },
};

