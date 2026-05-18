import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "gerente" | "tecnico" | "vendedor" | "financeiro";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  hasRole: (...r: AppRole[]) => boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRoles(uid: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => fetchRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchRoles(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Realtime: papéis mudados por admin refletem imediatamente
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`user-roles-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => fetchRoles(user.id)
      )
      .subscribe();

    const onFocus = () => fetchRoles(user.id);
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("focus", onFocus);
    };
  }, [user?.id]);

  return {
    user,
    session,
    loading,
    roles,
    hasRole: (...r) => r.some((x) => roles.includes(x)),
    isAdmin: roles.includes("admin"),
    signOut: async () => {
      await supabase.auth.signOut();
      setRoles([]);
    },
  };
}
