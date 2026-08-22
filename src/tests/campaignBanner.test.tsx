// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FestivalAcaiBar } from '../components/FestivalAcaiBar';

const loadActiveCampaigns=vi.fn();
vi.mock('../lib/campaigns',()=>({loadActiveCampaigns:()=>loadActiveCampaigns()}));
const campaign={id:'campaign-1',kind:'announcement',placement:'top_bar',title:'Campanha persistente',subtitle:'Volta ao reabrir',imageUrl:null,linkUrl:'/buscar',linkLabel:'Ver',theme:'indigo',priority:1,isActive:true,isDismissible:true,startsAt:null,endsAt:null,createdAt:null,updatedAt:null};
const mount=()=>render(<MemoryRouter><FestivalAcaiBar/></MemoryRouter>);

describe('banner administrável',()=>{
  afterEach(()=>{cleanup();vi.clearAllMocks()});
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
});
