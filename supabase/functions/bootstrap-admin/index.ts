// Edge function: garante usuário admin inicial e reseta a senha padrão.
// Idempotente — pode ser chamada várias vezes; sempre garante a credencial padrão.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL = "admin@espier.com.br";
const SENHA = "Espier#Adm!2026$Secure";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Procura usuário existente
    const { data: list, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) return json({ ok: false, error: listErr.message }, 500);

    let user = list.users.find((u) => u.email === EMAIL);

    if (!user) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: EMAIL,
        password: SENHA,
        email_confirm: true,
        user_metadata: { full_name: "Administrador" },
      });
      if (createErr || !created.user) {
        return json({ ok: false, error: createErr?.message ?? "create failed" }, 500);
      }
      user = created.user;
    } else {
      // Reseta senha e confirma e-mail
      const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
        password: SENHA,
        email_confirm: true,
      });
      if (updErr) return json({ ok: false, error: updErr.message }, 500);
    }

    // Garante role admin
    const { data: existingRole } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!existingRole) {
      await admin.from("user_roles").insert({ user_id: user.id, role: "admin" });
    }

    return json({
      ok: true,
      message: "Admin garantido e senha redefinida.",
      email: EMAIL,
      senha: SENHA,
    });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});

function json(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
