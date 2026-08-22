import { createContext, type ReactNode, useContext, useRef, useState } from "react";
import { LoaderCircle, Pause, Play, Radio } from "lucide-react";
import "./PersistentRadio.css";

const JOVEM_PAN_STREAM = "https://26373.live.streamtheworld.com/JP_SP_FMAAC.aac";

type RadioState = {
  playing: boolean;
  loading: boolean;
  failed: boolean;
  toggle: () => void;
};

const RadioContext = createContext<RadioState | null>(null);

export function PersistentRadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setFailed(false);
    setLoading(true);
    void audio.play().catch(() => {
      setLoading(false);
      setPlaying(false);
      setFailed(true);
    });
  };

  return <RadioContext.Provider value={{ playing, loading, failed, toggle }}>
    {children}
    <audio
      ref={audioRef}
      src={JOVEM_PAN_STREAM}
      preload="none"
      onPlaying={() => { setPlaying(true); setLoading(false); setFailed(false); }}
      onPause={() => { setPlaying(false); setLoading(false); }}
      onWaiting={() => setLoading(true)}
      onError={() => { setPlaying(false); setLoading(false); setFailed(true); }}
    />
  </RadioContext.Provider>;
}

export function HeaderRadioPlayer() {
  const radio = useContext(RadioContext);
  if (!radio) return null;
  const label = radio.failed ? "Rádio indisponível" : radio.playing ? "Pausar Jovem Pan FM" : "Ouvir Jovem Pan FM";
  return <button className={`pc-radio${radio.playing ? " is-playing" : ""}${radio.failed ? " has-error" : ""}`} type="button" onClick={radio.toggle} aria-label={label} title={label}>
    <span className="pc-radio__control" aria-hidden="true">{radio.loading ? <LoaderCircle className="pc-radio__loader" /> : radio.playing ? <Pause /> : <Play />}</span>
    <span className="pc-radio__copy"><small><Radio aria-hidden="true" /> ao vivo</small><strong>JP FM</strong></span>
    <span className="pc-radio__signal" aria-hidden="true"><i /><i /><i /></span>
  </button>;
}
