// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FestivalAcaiBar } from '../components/FestivalAcaiBar';

const loadActiveCampaigns=vi.fn();
vi.mock('../lib/campaigns',()=>({loadActiveCampaigns:()=>loadActiveCampaigns()}));
const campaign={id:'campaign-1',kind:'announcement',placement:'top_bar',title:'Campanha persistente',subtitle:'Volta ao reabrir',imageUrl:null,linkUrl:'/buscar',linkLabel:'Ver',theme:'indigo',priority:1,isActive:true,isDismissible:true,startsAt:null,endsAt:null,createdAt:null,updatedAt:null};
const mount=()=>render(<MemoryRouter><FestivalAcaiBar/></MemoryRouter>);

describe('banner administrável',()=>{
  beforeEach(()=>sessionStorage.clear());
  afterEach(()=>{cleanup();vi.clearAllMocks()});
  it('continua fechado ao recarregar a mesma aba',async()=>{
    loadActiveCampaigns.mockResolvedValue([campaign]);
    const first=mount();
    await waitFor(()=>expect(screen.getByText('Campanha persistente')).toBeTruthy());
    fireEvent.click(screen.getByRole('button',{name:'Fechar banner'}));
    expect(screen.queryByText('Campanha persistente')).toBeNull();
    first.unmount();
    mount();
    await waitFor(()=>expect(loadActiveCampaigns).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Campanha persistente')).toBeNull();
  });
  it('reaparece em uma nova sessão de aba',async()=>{
    loadActiveCampaigns.mockResolvedValue([campaign]);
    const first=mount();
    await waitFor(()=>expect(screen.getByText('Campanha persistente')).toBeTruthy());
    fireEvent.click(screen.getByRole('button',{name:'Fechar banner'}));
    first.unmount();
    sessionStorage.clear();
    mount();
    await waitFor(()=>expect(screen.getByText('Campanha persistente')).toBeTruthy());
    expect(loadActiveCampaigns).toHaveBeenCalledTimes(2);
  });
});
