import { Link, useLocation } from 'react-router-dom';
import { Video } from 'lucide-react';
import './AdminVideoQuickAccess.css';

export function AdminVideoQuickAccess(){
 const {pathname}=useLocation();
 if(!pathname.startsWith('/admin')||pathname.startsWith('/admin/videos')) return null;
 return <Link className="admin-video-quick" to="/admin/videos" aria-label="Abrir gerador de vídeos"><Video/><span>Vídeos</span></Link>;
}
