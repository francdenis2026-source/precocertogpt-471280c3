// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HeaderRadioPlayer, JOVEM_PAN_STREAMS, parseZenoMetadata, PersistentRadioProvider } from '../components/PersistentRadio';

describe('player persistente de rádio',()=>{
  beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{})});
  afterEach(()=>{cleanup();vi.restoreAllMocks()});
  it('usa o stream oficial atual e apresenta o estado tocando',async()=>{
    const{container}=render(<PersistentRadioProvider><HeaderRadioPlayer/></PersistentRadioProvider>);
    fireEvent.click(screen.getByRole('button',{name:'Ouvir Jovem Pan FM'}));
    const audio=container.querySelector('audio') as HTMLAudioElement;
    expect(audio.src).toContain(JOVEM_PAN_STREAMS[0]);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    fireEvent.playing(audio);
    await waitFor(()=>expect(screen.getByText('Tocando agora')).toBeTruthy());
    expect(screen.getByRole('button',{name:'Pausar Jovem Pan FM'})).toBeTruthy();
  });
  it('troca automaticamente para o stream de contingência em caso de erro',()=>{
    const{container}=render(<PersistentRadioProvider><HeaderRadioPlayer/></PersistentRadioProvider>);
    fireEvent.click(screen.getByRole('button',{name:'Ouvir Jovem Pan FM'}));
    const audio=container.querySelector('audio') as HTMLAudioElement;
    fireEvent.error(audio);
    expect(audio.src).toContain(JOVEM_PAN_STREAMS[1]);
  });
  it('interpreta o título enviado pela API de metadados da rádio',()=>{
    expect(parseZenoMetadata('{"streamTitle":"Artista — Música"}')).toBe('Artista — Música');
    expect(parseZenoMetadata('{"metadata":{"artist":"Artista","title":"Música"}}')).toBe('Artista — Música');
    expect(parseZenoMetadata('')).toBeNull();
  });
});
