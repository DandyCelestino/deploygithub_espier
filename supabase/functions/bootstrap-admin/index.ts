// Edge function: cria usuário admin inicial APENAS se não existir nenhum admin ainda.
// Idempotente e segura — pode ser chamada por qualquer um, mas só funciona uma vez.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Já existe algum admin?
    const { data: existing } = await admin.from("user_roles").select("id").eq("role", "admin").limit(1);
    if (existing && existing.length > 0) {
      return json({ ok: true, message: "Admin já existe — bootstrap ignorado.", created: false });
    }

    const EMAIL = "admin@espier.com.br";
    const SENHA = "Admin@2024!";

    // Cria usuário
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: SENHA,
      email_confirm: true,
      user_metadata: { full_name: "Administrador" },
    });
    if (createErr || !created.user) {
      // Se já existe usuário, busca
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list.users.find((u) => u.email === EMAIL);
      if (!found) return json({ ok: false, error: createErr?.message ?? "create failed" }, 500);
      await admin.from("user_roles").insert({ user_id: found.id, role: "admin" });
      return json({ ok: true, message: "Role admin atribuída ao usuário existente.", created: false });
    }

    await admin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });

    return json({
      ok: true,
      message: "Admin criado com sucesso.",
      created: true,
      email: EMAIL,
      senha: SENHA,
    });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});

function json(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
