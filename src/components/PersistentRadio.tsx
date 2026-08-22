import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from "lucide-react";
import "./PersistentRadio.css";

// Endereços usados pelo player oficial da Jovem Pan em agosto de 2026.
// O segundo host funciona como contingência quando o balanceador principal falha.
export const JOVEM_PAN_STREAMS = [
  "https://stream.zeno.fm/c45wbq2us3buv",
  "https://stream-284.zeno.fm/c45wbq2us3buv",
] as const;

type RadioState={playing:boolean;loading:boolean;failed:boolean;volume:number;toggle:()=>void;retry:()=>void;setVolume:(value:number)=>void};
const RadioContext=createContext<RadioState|null>(null);

export function PersistentRadioProvider({children}:{children:ReactNode}){
  const audioRef=useRef<HTMLAudioElement>(null),timeoutRef=useRef<number|undefined>(undefined),streamRef=useRef(0),wantsPlay=useRef(false);
  const[playing,setPlaying]=useState(false),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false),[volume,setVolumeState]=useState(0.78);
  const clearTimer=()=>{if(timeoutRef.current)window.clearTimeout(timeoutRef.current);timeoutRef.current=undefined};
  useEffect(()=>()=>clearTimer(),[]);
  const armTimeout=()=>{clearTimer();timeoutRef.current=window.setTimeout(()=>void tryStream(streamRef.current+1),12000)};
  const tryStream=async(index:number)=>{const audio=audioRef.current;if(!audio)return;clearTimer();if(index>=JOVEM_PAN_STREAMS.length){wantsPlay.current=false;setLoading(false);setPlaying(false);setFailed(true);return;}streamRef.current=index;audio.src=JOVEM_PAN_STREAMS[index];audio.load();setFailed(false);setLoading(true);armTimeout();try{await audio.play()}catch{if(wantsPlay.current)void tryStream(index+1);else{clearTimer();setLoading(false)}}};
  const toggle=()=>{const audio=audioRef.current;if(!audio)return;if(!audio.paused){wantsPlay.current=false;audio.pause();return;}wantsPlay.current=true;void tryStream(streamRef.current)};
  const retry=()=>{streamRef.current=0;wantsPlay.current=true;void tryStream(0)};
  const setVolume=(value:number)=>{const next=Math.max(0,Math.min(1,value));setVolumeState(next);if(audioRef.current)audioRef.current.volume=next};
  const handleFailure=()=>{if(wantsPlay.current)void tryStream(streamRef.current+1)};

  // Rádio ao vivo não possui uma faixa de legendas sincronizada pelo provedor.
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <RadioContext.Provider value={{playing,loading,failed,volume,toggle,retry,setVolume}}>{children}<audio ref={audioRef} preload="none" onLoadedMetadata={()=>{if(audioRef.current)audioRef.current.volume=volume}} onPlaying={()=>{clearTimer();setPlaying(true);setLoading(false);setFailed(false)}} onCanPlay={()=>{if(wantsPlay.current)clearTimer()}} onPause={()=>{clearTimer();setPlaying(false);setLoading(false)}} onWaiting={()=>{if(wantsPlay.current){setLoading(true);armTimeout()}}} onStalled={handleFailure} onError={handleFailure}/></RadioContext.Provider>;
}

export function HeaderRadioPlayer(){
  const radio=useContext(RadioContext);if(!radio)return null;
  const status=radio.failed?"Transmissão indisponível":radio.loading?"Conectando…":radio.playing?"Tocando agora":"Jovem Pan FM";
  const label=radio.failed?"Tentar conectar novamente":radio.playing?"Pausar Jovem Pan FM":"Ouvir Jovem Pan FM";
  return <div className={`pc-radio${radio.playing?" is-playing":""}${radio.loading?" is-loading":""}${radio.failed?" has-error":""}`}>
    <button className="pc-radio__play" type="button" onClick={radio.failed?radio.retry:radio.toggle} aria-label={label} title={label}>
      <span className="pc-radio__control" aria-hidden="true">{radio.loading?<LoaderCircle className="pc-radio__loader"/>:radio.failed?<RotateCcw/>:radio.playing?<Pause/>:<Play/>}</span>
      <span className="pc-radio__copy"><small><i/>RÁDIO AO VIVO</small><strong>{status}</strong></span>
    </button>
    <span className="pc-radio__signal" aria-hidden="true"><i/><i/><i/><i/></span>
    <label className="pc-radio__volume" title="Volume da rádio">{radio.volume===0?<VolumeX/>:radio.volume<.5?<Volume1/>:<Volume2/>}<input type="range" min="0" max="1" step="0.05" value={radio.volume} onChange={event=>radio.setVolume(Number(event.target.value))} aria-label="Volume da rádio"/></label>
    <span className="pc-radio__announcement" aria-live="polite">{radio.failed?"Não foi possível conectar. Tente novamente.":radio.loading?"Conectando à transmissão.":""}</span>
  </div>;
}
