import { supabase } from "../lib/supabase";

/**
 * Função utilitária para disparar o seed a partir do frontend (área Admin).
 * Importante: como o SQL direto é restrito via rede no ambiente de desenvolvimento para o Supabase externo,
 * esta função usa a REST API com a Service Key para popular as tabelas.
 */
export type ImportResult = {
  success: boolean;
  count: number;
  duplicates: number;
  stores: number;
  products: number;
  duration?: number;
  error?: string;
  errorReport?: Array<{
    type: string;
    entity: string;
    message: string;
    data: any;
  }>;
};

export async function runPriceImport(
  onProgress: (msg: string, current: number, total: number) => void,
): Promise<ImportResult> {
  const startTime = Date.now();
  const errorReport: ImportResult["errorReport"] = [];

  try {
    if (!supabase) throw new Error("Supabase não configurado.");
    onProgress("Carregando dados...", 0, 100);
    
    let data;
    try {
      const response = await fetch('/xlsx_data.json'); 
      if (!response.ok) throw new Error("Arquivo de dados não encontrado no servidor.");
      data = await response.json();
      onProgress(`Dados carregados: ${data.products?.length || 0} produtos e ${data.prices?.length || 0} preços.`, 5, 100);
    } catch (e) {
      onProgress("Dados do Excel não disponíveis. Usando catálogo de demonstração...", 5, 100);
      const { buildCatalog } = await import("./catalog");
      const local = buildCatalog();
      data = {
        establishments: local.stores.map(s => ({ id: s.id, name: s.name, brand_color: s.color, neighborhood: s.neighborhood, kind: 'market' })),
        products: local.products.map(p => ({ id: p.id, name: p.name, brand: p.brand, category: p.category, size: p.size, unit: p.unit, barcode: p.barcode })),
        prices: local.products.map(p => ({ product_id: p.id, establishment_id: p.establishmentId, value: p.minPrice, previous_value: p.previousPrice, captured_at: p.capturedAt }))
      };
    }

    const totalSteps = data.establishments.length + data.products.length + data.prices.length;
    let processed = 0;

    // 1. Sincronizar ESTABELECIMENTOS
    onProgress(`Sincronizando estabelecimentos...`, processed, totalSteps);
    const estUpsert = data.establishments.map((e: any) => ({
      id: e.id,
      name: e.name,
      neighborhood: e.neighborhood,
      brand_color: e.brand_color,
      kind: e.kind || 'market'
    }));

    // Tentativa um a um para capturar erros específicos por registro se o lote falhar
    const { error: estError } = await supabase.from("establishments").upsert(estUpsert, { onConflict: 'id' });
    if (estError) {
      // Se falhar em lote, tentamos individualmente para o relatório
      for (const est of estUpsert) {
        const { error: singleErr } = await supabase.from("establishments").upsert(est, { onConflict: 'id' });
        if (singleErr) {
          errorReport.push({ type: 'error', entity: 'estabelecimento', message: singleErr.message, data: est });
        }
      }
      if (errorReport.length === estUpsert.length) throw new Error(`Erro estabelecimentos: ${estError.message}`);
    }
    processed += data.establishments.length;

    // 2. Sincronizar PRODUTOS
    onProgress(`Sincronizando produtos...`, processed, totalSteps);
    const prodUpsert = data.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      size: p.size,
      unit: p.unit,
      barcode: p.barcode,
      image_url: p.image_url
    }));

    const { error: prodError } = await supabase.from("products").upsert(prodUpsert);
    if (prodError) {
      for (const prod of prodUpsert) {
        const { error: singleErr } = await supabase.from("products").upsert(prod);
        if (singleErr) {
          errorReport.push({ type: 'error', entity: 'produto', message: singleErr.message, data: prod });
        }
      }
      if (errorReport.length > data.establishments.length + prodUpsert.length * 0.5) throw new Error(`Erro produtos: ${prodError.message}`);
    }
    processed += data.products.length;

    // 3. Sincronizar PREÇOS em lotes
    onProgress(`Preparando preços...`, processed, totalSteps);
    const { data: existing } = await supabase.from("prices").select("product_id, establishment_id, value");
    const existingKeys = new Set((existing || []).map(p => `${p.product_id}_${p.establishment_id}_${p.value}`));

    const toInsert = data.prices.filter((p: any) => !existingKeys.has(`${p.product_id}_${p.establishment_id}_${p.value}`));
    const duplicates = data.prices.length - toInsert.length;

    if (toInsert.length === 0) {
      onProgress(`Concluído!`, totalSteps, totalSteps);
      return { success: true, count: 0, duplicates, stores: data.establishments.length, products: data.products.length, duration: Date.now() - startTime, errorReport };
    }

    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error } = await supabase.from("prices").insert(batch);
      if (error) {
        // Log individual do lote que falhou
        for (const p of batch) {
          const { error: singleErr } = await supabase.from("prices").insert(p);
          if (singleErr) errorReport.push({ type: 'error', entity: 'preço', message: singleErr.message, data: p });
          else inserted++;
        }
      } else {
        inserted += batch.length;
      }
      processed += batch.length;
      onProgress(`Importando preços (${inserted}/${toInsert.length})...`, processed, totalSteps);
    }

    return {
      success: true,
      count: inserted,
      duplicates,
      stores: data.establishments.length,
      products: data.products.length,
      duration: Date.now() - startTime,
      errorReport
    };
  } catch (err) {
    console.error("Erro na importação:", err);
    return { success: false, count: 0, duplicates: 0, stores: 0, products: 0, error: err instanceof Error ? err.message : "Erro desconhecido", errorReport };
  }
}

/**

 * Função para testar a conexão com o Supabase.
 */
export async function testSupabaseConnection(): Promise<{ 
  success: boolean; 
  latency: number; 
  tables: Record<string, number>; 
  error?: string 
}> {
  const start = Date.now();
  try {
    if (!supabase) throw new Error("Supabase não configurado.");
    const [stores, products, prices] = await Promise.all([
      supabase.from("establishments").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("prices").select("*", { count: "exact", head: true })
    ]);

    const error = stores.error || products.error || prices.error;
    if (error) throw new Error(error.message);

    return {
      success: true,
      latency: Date.now() - start,
      tables: {
        establishments: stores.count || 0,
        products: products.count || 0,
        prices: prices.count || 0
      }
    };
  } catch (err) {
    return {
      success: false,
      latency: Date.now() - start,
      tables: {},
      error: err instanceof Error ? err.message : "Falha na conexão"
    };
  }
}

/**
 * Função para enviar e-mail de redefinição de senha (simulada via API Rest do Supabase ou Provedor).
 * Como estamos em um frontend sem backend direto acessível para SMTP, 
 * usamos um webhook ou uma Edge Function do Supabase se disponível.
 */
export async function sendAdminResetEmail(email: string, user: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulação de chamada para provedor configurável (SendGrid/Resend/Postmark)
    // No cenário real, isso seria uma chamada para uma Edge Function que possui a API Key secreta.
    console.log(`[E-mail] Enviando link de redefinição para ${email} (Usuário: ${user})`);
    
    // Simulando latência de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Se fosse usar Supabase Auth real para reset:
    // const { error } = await supabase.auth.resetPasswordForEmail(email);
    // if (error) throw error;

    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Falha ao disparar e-mail" 
    };
  }
}
