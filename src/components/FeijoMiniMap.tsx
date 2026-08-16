import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair, MapPin } from "lucide-react";
import "./FeijoMiniMap.css";

/** Centro urbano de Feijó (AC) — o mapa nunca sai desta área. */
export const FEIJO_CENTER = { lat: -8.1644, lng: -70.3536 };
export const FEIJO_BOUNDS = { minLat: -8.195, maxLat: -8.135, minLng: -70.385, maxLng: -70.322 };
const MIN_ZOOM = 13;
const MAX_ZOOM = 16;
const TILE = 256;

export type MapPoint = { id: string; name: string; lat: number; lng: number; sponsored?: boolean; verified?: boolean };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lngToWorld = (lng: number, size: number) => ((lng + 180) / 360) * size;
const latToWorld = (lat: number, size: number) => {
  const rad = (clamp(lat, -85, 85) * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * size;
};

/** Confirma que a coordenada está realmente dentro da área urbana de Feijó. */
export const isInFeijo = (lat?: number | null, lng?: number | null) =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= FEIJO_BOUNDS.minLat && lat <= FEIJO_BOUNDS.maxLat && lng >= FEIJO_BOUNDS.minLng && lng <= FEIJO_BOUNDS.maxLng;

type Props = {
  points: MapPoint[];
  selectedId?: string | null;
  missingCount?: number;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
};

export function FeijoMiniMap({ points, selectedId, missingCount = 0, onSelect, onOpen }: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(14);
  const [center, setCenter] = useState(FEIJO_CENTER);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect;
      if (box) setSize({ width: Math.round(box.width), height: Math.round(box.height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const selected = useMemo(() => points.find(point => point.id === selectedId) ?? null, [points, selectedId]);
  useEffect(() => { if (selected) setCenter({ lat: selected.lat, lng: selected.lng }); }, [selected]);

  const project = useCallback((lat: number, lng: number) => {
    const world = TILE * 2 ** zoom;
    return {
      x: lngToWorld(lng, world) - (lngToWorld(center.lng, world) - size.width / 2),
      y: latToWorld(lat, world) - (latToWorld(center.lat, world) - size.height / 2),
    };
  }, [center, size, zoom]);

  const tiles = useMemo(() => {
    if (!size.width || !size.height) return [] as { key: string; url: string; left: number; top: number }[];
    const world = TILE * 2 ** zoom;
    const originX = lngToWorld(center.lng, world) - size.width / 2;
    const originY = latToWorld(center.lat, world) - size.height / 2;
    const count = 2 ** zoom;
    const list: { key: string; url: string; left: number; top: number }[] = [];
    for (let x = Math.floor(originX / TILE); x <= Math.floor((originX + size.width) / TILE); x += 1) {
      for (let y = Math.floor(originY / TILE); y <= Math.floor((originY + size.height) / TILE); y += 1) {
        if (x < 0 || y < 0 || x >= count || y >= count) continue;
        list.push({ key: `${zoom}/${x}/${y}`, url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`, left: x * TILE - originX, top: y * TILE - originY });
      }
    }
    return list;
  }, [center, size, zoom]);

  const reset = () => { setZoom(14); setCenter(FEIJO_CENTER); };

  return (
    <div className="fmap" role="group" aria-label="Mapa dos estabelecimentos em Feijó, Acre">
      <div className="fmap__frame" ref={frameRef}>
        <div className="fmap__tiles" aria-hidden="true">
          {tiles.map(tile => (
            <img key={tile.key} src={tile.url} alt="" loading="lazy" decoding="async" width={TILE} height={TILE} style={{ left: tile.left, top: tile.top }} />
          ))}
        </div>
        <div className="fmap__pins">
          {points.map(point => {
            const position = project(point.lat, point.lng);
            if (position.x < -24 || position.y < -32 || position.x > size.width + 24 || position.y > size.height + 32) return null;
            const active = point.id === selectedId;
            return (
              <button
                key={point.id}
                type="button"
                className={`fmap__pin${active ? " is-active" : ""}${point.sponsored ? " is-sponsored" : ""}`}
                style={{ left: position.x, top: position.y }}
                aria-label={`${point.name} — ver no mapa`}
                aria-pressed={active}
                onClick={() => onSelect?.(point.id)}
                onDoubleClick={() => onOpen?.(point.id)}
              >
                <MapPin size={14} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        {selected && (
          <div className="fmap__callout" role="status">
            <strong>{selected.name}</strong>
            {onOpen && <button type="button" onClick={() => onOpen(selected.id)}>Abrir catálogo</button>}
          </div>
        )}
        {!points.length && (
          <p className="fmap__note">Nenhum estabelecimento com localização cadastrada{missingCount ? ` (${missingCount} sem coordenadas)` : ""}.</p>
        )}
        <div className="fmap__controls">
          <button type="button" onClick={() => setZoom(value => clamp(value + 1, MIN_ZOOM, MAX_ZOOM))} aria-label="Aproximar mapa"><Plus size={14} /></button>
          <button type="button" onClick={() => setZoom(value => clamp(value - 1, MIN_ZOOM, MAX_ZOOM))} aria-label="Afastar mapa"><Minus size={14} /></button>
          <button type="button" onClick={reset} aria-label="Centralizar em Feijó"><Crosshair size={14} /></button>
        </div>
        <span className="fmap__credit">Feijó-AC · © OpenStreetMap</span>
      </div>
    </div>
  );
}
