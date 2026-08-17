import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadSessionProfile, supabase } from "../lib/roles";

export function AdminLoginRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const sendAdminToPanel = async () => {
      const profile = await loadSessionProfile();
      if (!active || !profile?.isAdmin) return;
      navigate("/admin", { replace: true });
    };

    if (location.pathname === "/login") void sendAdminToPanel();

    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      window.setTimeout(() => void sendAdminToPanel(), 0);
    });

    const handleAuthChange = () => window.setTimeout(() => void sendAdminToPanel(), 0);
    window.addEventListener("pc:auth-changed", handleAuthChange);

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
      window.removeEventListener("pc:auth-changed", handleAuthChange);
    };
  }, [location.pathname, navigate]);

  return null;
}
