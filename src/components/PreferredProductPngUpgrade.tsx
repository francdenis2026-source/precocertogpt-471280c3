import { useEffect } from "react";

type AssetMetadata = {
  url?: string;
  original_filename?: string;
  content_type?: string;
  created_at?: string;
};

type PngCandidate = {
  url: string;
  createdAt: number;
};

const pngAssetModules = import.meta.glob("../assets/*.png.asset.json", {
  eager: true,
  import: "default",
}) as Record<string, AssetMetadata>;

function normalizeImageKey(value: string) {
  const cleanValue = value.split("?")[0].split("#")[0];
  const filename = cleanValue.split("/").pop() ?? cleanValue;
  const withoutExtension = filename.replace(/\.(png|jpe?g|webp|avif)$/i, "");

  return decodeURIComponent(withoutExtension)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildPreferredPngMap() {
  const preferred = new Map<string, PngCandidate>();

  for (const [modulePath, metadata] of Object.entries(pngAssetModules)) {
    if (!metadata?.url) continue;
    if (metadata.content_type && metadata.content_type !== "image/png") continue;

    const sourceName = metadata.original_filename || modulePath.replace(/\.asset\.json$/i, "");
    const key = normalizeImageKey(sourceName);
    if (!key) continue;

    const createdAt = metadata.created_at ? Date.parse(metadata.created_at) || 0 : 0;
    const existing = preferred.get(key);

    if (!existing || createdAt >= existing.createdAt) {
      preferred.set(key, { url: metadata.url, createdAt });
    }
  }

  return preferred;
}

const preferredPngByName = buildPreferredPngMap();

function isAlreadyPng(source: string) {
  const cleanSource = source.split("?")[0].split("#")[0];
  return /\.png$/i.test(cleanSource);
}

function upgradeImage(image: HTMLImageElement) {
  const source = image.getAttribute("src") ?? "";
  if (!source || source.startsWith("data:") || source.startsWith("blob:") || isAlreadyPng(source)) return;

  const key = normalizeImageKey(source);
  if (!key) return;

  const preferred = preferredPngByName.get(key);
  if (!preferred || preferred.url === source) return;

  image.src = preferred.url;
}

function upgradeImages(root: ParentNode = document) {
  root.querySelectorAll<HTMLImageElement>("img[src]").forEach(upgradeImage);
}

/**
 * Faz o catálogo preferir automaticamente os PNGs enviados ao projeto.
 * A substituição ocorre apenas quando o nome normalizado do PNG corresponde
 * ao nome da imagem já aplicada ao produto. Imagens sem PNG equivalente
 * continuam usando a fonte atual.
 */
export function PreferredProductPngUpgrade() {
  useEffect(() => {
    upgradeImages();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
          upgradeImage(mutation.target);
          continue;
        }

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node instanceof HTMLImageElement) upgradeImage(node);
          upgradeImages(node);
        });
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
