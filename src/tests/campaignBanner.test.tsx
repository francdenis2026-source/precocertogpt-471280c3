// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FestivalAcaiBar } from '../components/FestivalAcaiBar';

class MockBroadcastChannel {
  static channels=new Map<string,Set<MockBroadcastChannel>>();
  onmessage:((event:MessageEvent)=>void)|null=null;
  constructor(private name:string){
    const members=MockBroadcastChannel.channels.get(name)??new Set();
    members.add(this);MockBroadcastChannel.channels.set(name,members);
  }
  postMessage(data:unknown){
    MockBroadcastChannel.channels.get(this.name)?.forEach(channel=>{
      if(channel!==this)channel.onmessage?.({data} as MessageEvent);
    });
  }
  close(){MockBroadcastChannel.channels.get(this.name)?.delete(this)}
  static reset(){MockBroadcastChannel.channels.clear()}
}

const loadActiveCampaigns=vi.fn();
vi.mock('../lib/campaigns',()=>({loadActiveCampaigns:()=>loadActiveCampaigns()}));
const campaign={id:'campaign-1',kind:'announcement',placement:'top_bar',title:'Campanha persistente',subtitle:'Volta ao reabrir',imageUrl:null,linkUrl:'/buscar',linkLabel:'Ver',theme:'indigo',priority:1,isActive:true,isDismissible:true,startsAt:null,endsAt:null,createdAt:null,updatedAt:null};
const mount=()=>render(<MemoryRouter><FestivalAcaiBar/></MemoryRouter>);

describe('banner administrável',()=>{
  afterEach(()=>{cleanup();vi.clearAllMocks();MockBroadcastChannel.reset();vi.unstubAllGlobals()});
  it('fecha somente na visualização atual e reaparece ao reabrir',async()=>{
    loadActiveCampaigns.mockResolvedValue([campaign]);
    const first=mount();
    await waitFor(()=>expect(screen.getByText('Campanha persistente')).toBeTruthy());
    fireEvent.click(screen.getByRole('button',{name:'Fechar banner'}));
    expect(screen.queryByText('Campanha persistente')).toBeNull();
    first.unmount();
    mount();
    await waitFor(()=>expect(screen.getByText('Campanha persistente')).toBeTruthy());
    expect(loadActiveCampaigns).toHaveBeenCalledTimes(2);
  });
  it('sincroniza o fechamento entre abas abertas sem persistir ao reabrir',async()=>{
    vi.stubGlobal('BroadcastChannel',MockBroadcastChannel);
    loadActiveCampaigns.mockResolvedValue([campaign]);
    const first=mount();
    const second=mount();
    await waitFor(()=>expect(screen.getAllByText('Campanha persistente')).toHaveLength(2));
    fireEvent.click(screen.getAllByRole('button',{name:'Fechar banner'})[0]);
    await waitFor(()=>expect(screen.queryAllByText('Campanha persistente')).toHaveLength(0));

    first.unmount();
    mount();
    await waitFor(()=>expect(screen.getAllByText('Campanha persistente')).toHaveLength(1));
    second.unmount();
  });
});
