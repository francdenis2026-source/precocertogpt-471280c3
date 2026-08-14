import { Camera, CheckCircle2, Loader2, PackagePlus, Search, Store, Upload, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { getStoreLogoUrl } from "../data/storeLogos";

type StoreRecord = { id: string; name: string; neighborhood: string | null; brand_color: string | null };
type ProductRecord = {
  id: string; name: string; brand: string | null; category: string | null; size: string | null;
  unit: string | null; barcode: string | null; image_url: string | null;
};
type PriceRecord = {
  id: string; product_id: string; establishment_id: string; value: number | string;
  previous_value: number | string | null; captured_at: string | null;
};
type CatalogRow = { product: ProductRecord; price: PriceRecord; storeCount: number; minPrice: number };

const PAGE_SIZE = 1000;
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

async function readAll(table: "establishments" | "products" | "prices", columns: string) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) return rows;
  }
}

function latestPrices(rows: PriceRecord[]) {
  const byProduct = new Map<string, PriceRecord>();
  rows.forEach(row => {
    const current = byProduct.get(row.product_id);
    if (!current || Date.parse(row.captured_at ?? "") >= Date.parse(current.captured_at ?? "")) {
      byProduct.set(row.product_id, row);
    }
  });
  return byProduct;
}

async function uploadProductImage(productId: string, file: File) {
  if (!supabase) throw new Error("Supabase não configurado.");
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `products/${productId}-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("products").getPublicUrl(filePath);
  const { error: updateError } = await supabase.from("products").update({ image_url: data.publicUrl }).eq("id", productId);
  if (updateError) throw updateError;
  return data.publicUrl;
}

export function AdminStoreCatalog({ onAudit }: { onAudit: (message: string, type?: "success" | "warning" | "error") => void }) {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [mode, setMode] = useState<"catalog" | "missing" | "new">("catalog");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [priceTarget, setPriceTarget] = useState<ProductRecord | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [targetPhoto, setTargetPhoto] = useState<File | null>(null);
  const perPage = 40;

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [storeRows, productRows, priceRows] = await Promise.all([
        readAll("establishments", "id, name, neighborhood, brand_color"),
        readAll("products", "id, name, brand, category, size, unit, barcode, image_url"),
        readAll("prices", "id, product_id, establishment_id, value, previous_value, captured_at"),
      ]);
      const nextStores = storeRows as StoreRecord[];
      setStores(nextStores.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      setProducts(productRows as ProductRecord[]);
      setPrices(priceRows as PriceRecord[]);
      setSelectedStoreId(current => current || nextStores[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os catálogos.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => { setPage(1); }, [selectedStoreId, mode, query]);

  const productById = useMemo(() => new Map(products.map(product => [String(product.id), product])), [products]);
  const pricesByProduct = useMemo(() => {
    const map = new Map<string, PriceRecord[]>();
    prices.forEach(price => map.set(price.product_id, [...(map.get(price.product_id) ?? []), price]));
    return map;
  }, [prices]);
  const storePrices = useMemo(() => latestPrices(prices.filter(price => price.establishment_id === selectedStoreId)), [prices, selectedStoreId]);
  const selectedStore = stores.find(store => store.id === selectedStoreId);

  const summaries = useMemo(() => stores.map(store => {
    const unique = latestPrices(prices.filter(price => price.establishment_id === store.id));
    return { ...store, products: unique.size, missing: Math.max(products.length - unique.size, 0) };
  }), [stores, products.length, prices]);

  const rows = useMemo<CatalogRow[]>(() => {
    const source = mode === "missing"
      ? products.filter(product => !storePrices.has(String(product.id)) && (pricesByProduct.get(String(product.id))?.length ?? 0) > 0)
      : [...storePrices.keys()].map(id => productById.get(id)).filter((item): item is ProductRecord => Boolean(item));
    const q = normalize(query);
    return source.filter(product => !q || [product.name, product.brand ?? "", product.category ?? "", product.barcode ?? ""].some(value => normalize(value).includes(q)))
      .map(product => {
        const productPrices = pricesByProduct.get(String(product.id)) ?? [];
        const values = productPrices.map(item => Number(item.value)).filter(Number.isFinite);
        return {
          product,
          price: storePrices.get(String(product.id)) ?? productPrices[0],
          storeCount: new Set(productPrices.map(item => item.establishment_id)).size,
          minPrice: values.length ? Math.min(...values) : 0,
        };
      }).sort((a, b) => a.product.name.localeCompare(b.product.name, "pt-BR"));
  }, [mode, products, storePrices, pricesByProduct, productById, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const visibleRows = rows.slice((page - 1) * perPage, page * perPage);

  const saveExistingPrice = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !priceTarget || !selectedStoreId) return;
    const value = Number(targetPrice.replace(",", "."));
    if (mode === "missing" && (!Number.isFinite(value) || value <= 0)) { setError("Informe um preço válido."); return; }
    setSaving(true); setError("");
    try {
      if (mode !== "missing") {
        if (!targetPhoto) throw new Error("Selecione uma foto para o produto.");
        await uploadProductImage(priceTarget.id, targetPhoto);
        onAudit(`Foto atualizada: ${priceTarget.name}`);
        setNotice(`A foto de ${priceTarget.name} foi atualizada.`);
        setPriceTarget(null); setTargetPhoto(null); await load();
        return;
      }
      const { data: existing, error: checkError } = await supabase.from("prices").select("id").eq("product_id", priceTarget.id).eq("establishment_id", selectedStoreId).limit(1);
      if (checkError) throw checkError;
      if (existing?.length) throw new Error("Este produto já possui preço nesse estabelecimento.");
      if (targetPhoto) await uploadProductImage(priceTarget.id, targetPhoto);
      const { error: insertError } = await supabase.from("prices").insert({
        product_id: priceTarget.id, establishment_id: selectedStoreId, value, previous_value: null, captured_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      onAudit(`Preço cadastrado: ${priceTarget.name} em ${selectedStore?.name}`);
      setNotice(`${priceTarget.name} foi incluído no catálogo de ${selectedStore?.name}.`);
      setPriceTarget(null); setTargetPrice(""); setTargetPhoto(null);
      await load();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Erro ao cadastrar preço.";
      setError(message); onAudit(`Falha ao cadastrar preço: ${message}`, "error");
    } finally { setSaving(false); }
  };

  const saveNewProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !selectedStoreId) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const price = Number(String(data.get("price") ?? "").replace(",", "."));
    const photo = data.get("photo");
    if (!name || !Number.isFinite(price) || price <= 0) { setError("Preencha o nome e um preço válido."); return; }
    setSaving(true); setError("");
    try {
      const barcode = String(data.get("barcode") ?? "").trim();
      const normalizedName = normalize(name);
      const duplicate = products.find(product => normalize(product.name) === normalizedName || (barcode && product.barcode === barcode));
      if (duplicate) throw new Error("Esse produto já existe. Use a aba “Faltam nesta loja” para cadastrar apenas o preço.");
      const { data: created, error: productError } = await supabase.from("products").insert({
        name,
        brand: String(data.get("brand") ?? "-").trim() || "-",
        category: String(data.get("category") ?? "outros").trim() || "outros",
        size: String(data.get("size") ?? "-").trim() || "-",
        unit: String(data.get("unit") ?? "un").trim() || "un",
        barcode: barcode || null,
      }).select("id").single();
      if (productError) throw productError;
      if (photo instanceof File && photo.size) await uploadProductImage(String(created.id), photo);
      const { error: priceError } = await supabase.from("prices").insert({
        product_id: created.id, establishment_id: selectedStoreId, value: price, previous_value: null, captured_at: new Date().toISOString(),
      });
      if (priceError) throw priceError;
      onAudit(`Novo produto cadastrado: ${name} em ${selectedStore?.name}`);
      setNotice(`${name} foi cadastrado com foto e preço em ${selectedStore?.name}.`);
      form.reset(); setMode("catalog"); await load();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Erro ao cadastrar produto.";
      setError(message); onAudit(`Falha ao cadastrar produto: ${message}`, "error");
    } finally { setSaving(false); }
  };

  if (loading && !stores.length) return <section className="store-catalog-loading"><Loader2/> Carregando catálogos completos…</section>;

  return <div className="store-catalog-admin">
    <section className="store-catalog-intro">
      <div><span className="eyebrow">Cobertura do banco</span><h2>Catálogos por estabelecimento</h2><p>Veja o que cada loja possui, descubra produtos disponíveis nos concorrentes e complete preços e imagens.</p></div>
      <button className="button button--outline" onClick={() => void load()} disabled={loading}>{loading ? <Loader2 className="spin"/> : <Upload/>} Atualizar dados</button>
    </section>

    {error && <div className="store-catalog-message error"><X/> {error}<button onClick={() => setError("")}><X/></button></div>}
    {notice && <div className="store-catalog-message success"><CheckCircle2/> {notice}<button onClick={() => setNotice("")}><X/></button></div>}

    <section className="store-summary-grid">
      {summaries.map(store => {
        const logoUrl = getStoreLogoUrl(store.name);
        return <button key={store.id} className={store.id === selectedStoreId ? "active" : ""} onClick={() => setSelectedStoreId(store.id)}>
          <i className={logoUrl ? "has-image" : ""} style={{ background: store.brand_color ?? "var(--pc-color-primary)" }}>
            {logoUrl ? <img src={logoUrl} alt={`Logomarca ${store.name}`} loading="lazy" /> : <Store/>}
          </i><span><b>{store.name}</b><small>{store.neighborhood || "Bairro não informado"}</small></span><strong>{store.products}</strong><em>produtos</em>
        </button>;
      })}
    </section>

    <section className="store-catalog-workspace">
      <header>
        <div><small>Estabelecimento selecionado</small><h3>{selectedStore?.name}</h3><p>{storePrices.size} produtos cadastrados · {Math.max(products.length - storePrices.size, 0)} oportunidades de cobertura</p></div>
        <div className="store-catalog-tabs">
          <button className={mode === "catalog" ? "active" : ""} onClick={() => setMode("catalog")}>Catálogo ({storePrices.size})</button>
          <button className={mode === "missing" ? "active" : ""} onClick={() => setMode("missing")}>Faltam nesta loja</button>
          <button className={mode === "new" ? "active" : ""} onClick={() => setMode("new")}><PackagePlus/> Novo produto</button>
        </div>
      </header>

      {mode === "new" ? <form className="store-product-form" onSubmit={saveNewProduct}>
        <div className="store-form-photo"><Camera/><b>Foto do produto</b><small>JPG, PNG ou WebP · máximo 5 MB</small><input type="file" name="photo" accept="image/*"/></div>
        <div className="store-form-fields">
          <label className="wide">Nome do produto *<input name="name" required placeholder="Ex.: Arroz Tio Urbano 5kg"/></label>
          <label>Marca<input name="brand" placeholder="Ex.: Tio Urbano"/></label>
          <label>Categoria<input name="category" placeholder="Ex.: Mercearia"/></label>
          <label>Tamanho<input name="size" placeholder="Ex.: 5kg"/></label>
          <label>Unidade<select name="unit" defaultValue="un"><option value="un">Unidade</option><option value="kg">Quilograma</option><option value="g">Grama</option><option value="L">Litro</option><option value="ml">Mililitro</option></select></label>
          <label>Código de barras<input name="barcode" inputMode="numeric" placeholder="Opcional"/></label>
          <label>Preço em {selectedStore?.name} *<input name="price" inputMode="decimal" required placeholder="0,00"/></label>
          <button className="button button--primary wide" disabled={saving}>{saving ? <Loader2 className="spin"/> : <PackagePlus/>} Cadastrar produto e preço</button>
        </div>
      </form> : <>
        <div className="store-catalog-toolbar"><label><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por produto, marca, categoria ou código…"/></label><span>{rows.length} resultados</span></div>
        <div className="store-product-table">
          <div className="store-product-row heading"><span>Produto</span><span>Categoria</span><span>{mode === "missing" ? "Cobertura atual" : "Preço"}</span><span>Ação</span></div>
          {visibleRows.map(({ product, price, storeCount, minPrice }) => <div className="store-product-row" key={product.id}>
            <span className="store-product-identity">{product.image_url ? <img src={product.image_url} alt=""/> : <i><Camera/></i>}<span><b>{product.name}</b><small>{product.brand || "Sem marca"} · {product.size || product.unit || "un"}</small></span></span>
            <span><b>{product.category || "Outros"}</b><small>{product.barcode || "Sem código de barras"}</small></span>
            <span>{mode === "missing" ? <><b>{storeCount} {storeCount === 1 ? "loja" : "lojas"}</b><small>A partir de {money(minPrice)}</small></> : <><b>{money(Number(price?.value ?? 0))}</b><small>{price?.captured_at ? new Date(price.captured_at).toLocaleDateString("pt-BR") : "Sem data"}</small></>}</span>
            <span>{mode === "missing" ? <button className="button button--primary button--small" onClick={() => { setPriceTarget(product); setTargetPrice(minPrice ? String(minPrice).replace(".", ",") : ""); }}><PackagePlus/> Cadastrar preço</button> : <button className="button button--outline button--small" onClick={() => { setPriceTarget(product); setTargetPrice(String(price?.value ?? "").replace(".", ",")); }}><Camera/> Enviar foto</button>}</span>
          </div>)}
          {!visibleRows.length && <div className="store-catalog-empty"><PackagePlus/><b>Nenhum produto encontrado</b><p>Ajuste a busca ou cadastre um novo produto para esta loja.</p></div>}
        </div>
        {pageCount > 1 && <footer className="store-catalog-pagination"><span>Página {page} de {pageCount}</span><div><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>Anterior</button><button disabled={page === pageCount} onClick={() => setPage(value => value + 1)}>Próxima</button></div></footer>}
      </>}
    </section>

    {priceTarget && <div className="admin-modal-overlay"><form className="admin-modal-content compact" onSubmit={saveExistingPrice}>
      <div className="admin-modal-head"><div><small>{selectedStore?.name}</small><h3>{mode === "missing" ? "Cadastrar preço" : "Atualizar foto"}</h3></div><button type="button" className="icon-button" onClick={() => { setPriceTarget(null); setTargetPhoto(null); }}><X/></button></div>
      <div className="admin-modal-body store-price-modal"><div className="selected-product"><b>{priceTarget.name}</b><small>{priceTarget.brand || "Sem marca"} · {priceTarget.category || "Outros"}</small></div>
        {mode === "missing" && <label>Preço no estabelecimento *<input value={targetPrice} onChange={event => setTargetPrice(event.target.value)} inputMode="decimal" required placeholder="0,00"/></label>}
        <label>Foto do produto <input type="file" accept="image/*" onChange={event => setTargetPhoto(event.target.files?.[0] ?? null)}/><small>A foto é opcional e atualiza o produto em todos os estabelecimentos.</small></label>
        <button className="button button--primary button--full" disabled={saving || (mode !== "missing" && !targetPhoto)}>{saving ? <Loader2 className="spin"/> : <Upload/>} Salvar informações</button>
      </div>
    </form></div>}
  </div>;
}
