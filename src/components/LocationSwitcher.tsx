import { FormEvent, useMemo, useState } from "react";
import { LocateFixed, MapPin, X } from "lucide-react";
import "./LocationSwitcher.css";

type City = { name: string; state: "AC"; latitude: number; longitude: number };

const COVERAGE_CITY: City = { name: "Feijó", state: "AC", latitude: -8.164, longitude: -70.353 };
const ACRE_CITIES: City[] = [
  COVERAGE_CITY,
  { name: "Rio Branco", state: "AC", latitude: -9.975, longitude: -67.824 },
  { name: "Cruzeiro do Sul", state: "AC", latitude: -7.627, longitude: -72.675 },
  { name: "Tarauacá", state: "AC", latitude: -8.161, longitude: -70.766 },
  { name: "Sena Madureira", state: "AC", latitude: -9.065, longitude: -68.657 },
  { name: "Brasiléia", state: "AC", latitude: -11.016, longitude: -68.749 },
];

const LOCATION_KEY = "precocerto:visitor-city";

function distanceKm(latitude: number, longitude: number, city: City) {
  const radians = (value: number) => value * Math.PI / 180;
  const earthRadius = 6371;
  const deltaLatitude = radians(city.latitude - latitude);
  const deltaLongitude = radians(city.longitude - longitude);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(latitude)) * Math.cos(radians(city.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function readSavedCity() {
  try { return localStorage.getItem(LOCATION_KEY) || ""; } catch { return ""; }
}

export function LocationSwitcher() {
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [cityInput, setCityInput] = useState(readSavedCity);
  const [visitorCity, setVisitorCity] = useState(readSavedCity);
  const [message, setMessage] = useState("");
  const outsideCoverage = visitorCity && visitorCity.toLocaleLowerCase("pt-BR") !== "feijó";
  const status = useMemo(() => outsideCoverage
    ? `Você informou ${visitorCity}. Os preços disponíveis ainda são de Feijó.`
    : "Preços disponíveis para Feijó, Acre.", [outsideCoverage, visitorCity]);

  const saveCity = (city: string) => {
    const value = city.trim();
    if (!value) return;
    setVisitorCity(value);
    setCityInput(value);
    setMessage(value.toLocaleLowerCase("pt-BR") === "feijó"
      ? "Localização confirmada."
      : `Cidade registrada. A expansão para ${value} ainda não está disponível.`);
    try { localStorage.setItem(LOCATION_KEY, value); } catch { /* preferência opcional */ }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Seu navegador não oferece localização. Informe a cidade manualmente.");
      return;
    }
    setDetecting(true);
    setMessage("Solicitando sua localização…");
    navigator.geolocation.getCurrentPosition(position => {
      const nearest = ACRE_CITIES
        .map(city => ({ city, distance: distanceKm(position.coords.latitude, position.coords.longitude, city) }))
        .sort((a, b) => a.distance - b.distance)[0];
      if (nearest && nearest.distance <= 120) saveCity(nearest.city.name);
      else setMessage("Não identificamos uma cidade atendida. Informe sua cidade manualmente.");
      setDetecting(false);
    }, () => {
      setDetecting(false);
      setMessage("Localização não autorizada. Você pode informar a cidade manualmente.");
    }, { enableHighAccuracy: false, timeout: 7_000, maximumAge: 15 * 60_000 });
  };

  const submitCity = (event: FormEvent) => {
    event.preventDefault();
    saveCity(cityInput);
  };

  return <div className="pc-location">
    <button className="pc-location__chip" type="button" aria-expanded={open} aria-controls="pc-location-panel" onClick={() => setOpen(value => !value)}>
      <MapPin aria-hidden="true" /><span><small>{outsideCoverage ? "Sua cidade" : "Catálogo atual"}</small><strong>{outsideCoverage ? visitorCity : "Feijó, AC"}</strong></span><em>{outsideCoverage ? "Revisar" : "Trocar"}</em>
    </button>
    {open && <section className="pc-location__panel" id="pc-location-panel" aria-label="Escolher localização">
      <header><div><strong>Sua localização</strong><small>{status}</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar localização"><X /></button></header>
      <button className="pc-location__detect" type="button" disabled={detecting} onClick={detectLocation}><LocateFixed aria-hidden="true" />{detecting ? "Localizando…" : "Usar minha localização"}</button>
      <form onSubmit={submitCity}><label htmlFor="pc-location-city">Ou informe sua cidade</label><div><input id="pc-location-city" value={cityInput} onChange={event => setCityInput(event.target.value)} placeholder="Ex.: Rio Branco" autoComplete="address-level2" list="pc-acre-cities" /><button type="submit">Confirmar</button></div><datalist id="pc-acre-cities">{ACRE_CITIES.map(city => <option value={city.name} key={city.name} />)}</datalist></form>
      {message && <p role="status">{message}</p>}
    </section>}
  </div>;
}
