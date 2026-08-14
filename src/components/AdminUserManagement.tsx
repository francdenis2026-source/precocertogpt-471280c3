import { AppRole, loadSessionProfile, supabase } from "../lib/roles";
import { useState, useEffect } from "react";
import { Shield, UserPlus, UserMinus, Search, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    if (!supabase) return;
    setLoading(true);
    try {
      // Nota: Listar usuários do auth.users requer service_role ou API de Admin.
      // Em clientes públicos, listamos apenas quem já tem papel atribuído na public.user_roles.
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          created_at
        `);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function updateRole(userId: string, currentRole: AppRole, newRole: AppRole) {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId)
        .eq("role", currentRole);
      
      if (error) throw error;
      loadUsers();
    } catch (err: any) {
      alert("Erro ao atualizar papel: " + err.message);
    }
  }

  const filtered = users.filter(u => u.user_id.includes(search));

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Gestão de Acessos</h2>
          <p>Gerencie papéis e permissões de usuários autenticados.</p>
        </div>
      </div>

      <div className="admin-filters">
        <label style={{ flex: 1 }}>
          <Search size={16}/>
          <input 
            placeholder="Buscar por ID de usuário..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </label>
      </div>

      <div className="admin-table">
        <div className="admin-tr admin-th">
          <span>Usuário (ID)</span>
          <span>Papel Atual</span>
          <span style={{ textAlign: 'right' }}>Ações de Privilégio</span>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : filtered.length > 0 ? filtered.map((u) => (
          <div className="admin-tr" key={`${u.user_id}-${u.role}`}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{u.user_id}</span>
            <span>
              <span className={`status ${u.role === 'admin' || u.role === 'super_admin' ? 'ok' : 'pending'}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                {u.role.toUpperCase()}
              </span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {u.role === 'consumer' ? (
                <button 
                  className="button button--small button--outline"
                  onClick={() => updateRole(u.user_id, u.role, 'admin')}
                >
                  <UserPlus size={14}/> Promover Admin
                </button>
              ) : (
                <button 
                  className="button button--small button--outline"
                  style={{ color: 'var(--pc-color-danger)' }}
                  onClick={() => updateRole(u.user_id, u.role, 'consumer')}
                >
                  <UserMinus size={14}/> Rebaixar
                </button>
              )}
            </span>
          </div>
        )) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pc-color-primary)' }}>
            {error ? <div style={{ color: 'var(--pc-color-danger)' }}><AlertCircle size={20}/> {error}</div> : "Nenhum usuário com papel atribuído encontrado."}
          </div>
        )}
      </div>
      
      <div className="admin-card-foot">
        <small style={{ color: 'var(--pc-color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={12}/> Alterações são registradas no log de auditoria via RLS.
        </small>
      </div>
    </section>
  );
}
