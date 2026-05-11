// Edge function: admin master gerencia usuários (criar / editar / trocar senha / excluir)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLES = ["admin", "gerente", "tecnico", "vendedor", "financeiro"];

type Action = "create" | "update_profile" | "set_password" | "delete" | "set_roles";

interface ReqBody {
  action: Action;
  user_id?: string;
  email?: string;
  password?: string;
  full_name?: string;
  matricula?: string;
  roles?: string[];
  active?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Sessão inválida" }, 401);
    const requester = userData.user;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Apenas admin pode usar essa função
    const { data: rolesRows } = await admin
      .from("user_roles").select("role").eq("user_id", requester.id);
    const isAdmin = (rolesRows ?? []).some((r) => r.role === "admin");
    if (!isAdmin) return json({ error: "Apenas admin master pode gerenciar usuários" }, 403);

    const body = (await req.json()) as ReqBody;
    if (!body.action) return json({ error: "Ação não informada" }, 400);

    if (body.action === "create") {
      if (!body.email || !body.password || !body.full_name || !body.roles?.length) {
        return json({ error: "Dados incompletos (email, senha, nome, roles)" }, 400);
      }
      for (const r of body.roles) if (!ROLES.includes(r)) return json({ error: `Role inválida: ${r}` }, 400);
      if (body.password.length < 8) return json({ error: "Senha mínima 8 caracteres" }, 400);

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { full_name: body.full_name },
      });
      if (createErr || !created.user) return json({ error: createErr?.message ?? "Falha ao criar" }, 400);

      const newUserId = created.user.id;
      if (body.matricula) {
        await admin.from("profiles").update({ matricula: body.matricula, full_name: body.full_name }).eq("user_id", newUserId);
      }
      const rows = body.roles.map((r) => ({ user_id: newUserId, role: r as any }));
      const { error: rErr } = await admin.from("user_roles").insert(rows);
      if (rErr) return json({ error: rErr.message }, 500);

      await admin.from("activity_logs").insert({
        user_id: requester.id, action: "user_created", entity_type: "profiles",
        entity_id: newUserId, details: { email: body.email, roles: body.roles },
      });
      return json({ success: true, user_id: newUserId });
    }

    if (body.action === "update_profile") {
      if (!body.user_id) return json({ error: "user_id obrigatório" }, 400);
      const patch: Record<string, unknown> = {};
      if (body.full_name !== undefined) patch.full_name = body.full_name;
      if (body.matricula !== undefined) patch.matricula = body.matricula;
      if (body.active !== undefined) patch.active = body.active;
      if (Object.keys(patch).length > 0) {
        const { error } = await admin.from("profiles").update(patch).eq("user_id", body.user_id);
        if (error) return json({ error: error.message }, 400);
      }
      await admin.from("activity_logs").insert({
        user_id: requester.id, action: "user_updated", entity_type: "profiles",
        entity_id: body.user_id, details: patch,
      });
      return json({ success: true });
    }

    if (body.action === "set_password") {
      if (!body.user_id || !body.password) return json({ error: "user_id e senha obrigatórios" }, 400);
      if (body.password.length < 8) return json({ error: "Senha mínima 8 caracteres" }, 400);
      const { error } = await admin.auth.admin.updateUserById(body.user_id, { password: body.password });
      if (error) return json({ error: error.message }, 400);
      await admin.from("activity_logs").insert({
        user_id: requester.id, action: "user_password_reset", entity_type: "profiles", entity_id: body.user_id, details: {},
      });
      return json({ success: true });
    }

    if (body.action === "set_roles") {
      if (!body.user_id || !body.roles) return json({ error: "user_id e roles obrigatórios" }, 400);
      for (const r of body.roles) if (!ROLES.includes(r)) return json({ error: `Role inválida: ${r}` }, 400);
      await admin.from("user_roles").delete().eq("user_id", body.user_id);
      if (body.roles.length > 0) {
        const rows = body.roles.map((r) => ({ user_id: body.user_id!, role: r as any }));
        const { error } = await admin.from("user_roles").insert(rows);
        if (error) return json({ error: error.message }, 400);
      }
      await admin.from("activity_logs").insert({
        user_id: requester.id, action: "user_roles_changed", entity_type: "profiles",
        entity_id: body.user_id, details: { roles: body.roles },
      });
      return json({ success: true });
    }

    if (body.action === "delete") {
      if (!body.user_id) return json({ error: "user_id obrigatório" }, 400);
      if (body.user_id === requester.id) return json({ error: "Não é possível excluir a si mesmo" }, 400);
      const { error } = await admin.auth.admin.deleteUser(body.user_id);
      if (error) return json({ error: error.message }, 400);
      await admin.from("activity_logs").insert({
        user_id: requester.id, action: "user_deleted", entity_type: "profiles", entity_id: body.user_id, details: {},
      });
      return json({ success: true });
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message ?? "Erro interno" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
