import { supabase } from './roles';

export type AdminSnapshot = {
  summary: Record<string, number>;
  applications: any[];
  merchants: any[];
  orders: any[];
  users: any[];
  prices: any[];
  priceMap: any[];
  audit: any[];
  activity: any[];
};

export async function loadAdminSnapshot(): Promise<AdminSnapshot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('admin_control_center_snapshot');
  if (error) throw error;
  return data as AdminSnapshot;
}

export async function reviewMerchantApplication(id: string, decision: 'approved' | 'rejected', notes?: string) {
  if (!supabase) return { error: 'Supabase indisponível' };
  const { error } = await supabase.rpc('review_merchant_application', { _application_id: id, _decision: decision, _admin_notes: notes || null });
  return { error: error?.message ?? null };
}

export async function updateMerchant(id: string, values: { status?: 'active' | 'inactive' | 'suspended'; onlineSalesEnabled?: boolean }) {
  if (!supabase) return { error: 'Supabase indisponível' };
  const { error } = await supabase.rpc('admin_update_merchant', {
    _merchant_id: id,
    _status: values.status ?? null,
    _online_sales_enabled: values.onlineSalesEnabled ?? null,
  });
  return { error: error?.message ?? null };
}

export async function setUserRole(userId: string, role: 'super_admin' | 'admin' | 'moderator' | 'merchant_owner' | 'merchant_staff' | 'consumer', enabled: boolean) {
  if (!supabase) return { error: 'Supabase indisponível' };
  const { error } = await supabase.rpc('admin_set_user_role', { _user_id: userId, _role: role, _enabled: enabled });
  return { error: error?.message ?? null };
}

export async function cancelOrder(orderId: string, reason: string) {
  if (!supabase) return { error: 'Supabase indisponível' };
  const { error } = await supabase.rpc('admin_cancel_order', { _order_id: orderId, _reason: reason });
  return { error: error?.message ?? null };
}
