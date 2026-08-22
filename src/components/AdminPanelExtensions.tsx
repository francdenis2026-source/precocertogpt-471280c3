import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { ExternalLink, PackagePlus } from 'lucide-react';

export function AdminPanelExtensions(){
  const location=useLocation();
  const [target,setTarget]=useState<Element|null>(null);
  useEffect(()=>{
    if(!location.pathname.startsWith('/admin')||location.pathname.startsWith('/admin/catalogo')||location.pathname.startsWith('/admin/ambientes')){setTarget(null);return;}
    const find=()=>setTarget(document.querySelector('.acc-sidebar nav'));
    find();const frame=requestAnimationFrame(find);return()=>cancelAnimationFrame(frame);
  },[location.pathname]);
  if(!target)return null;
  return createPortal(<><small>CATÁLOGO</small><a href="/admin/catalogo"><PackagePlus/><span>Produtos e lojas</span></a><a href="/admin/ambientes"><ExternalLink/><span>Ambientes</span></a></>,target);
}
