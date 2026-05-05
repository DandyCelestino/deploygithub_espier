// Edge function: admin/gerente rejeita candidatura
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "Sessão inválida" }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roles } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id);
    const ok = (roles ?? []).some((r) => r.role === "admin" || r.role === "gerente");
    if (!ok) return json({ error: "Sem permissão" }, 403);

    const { candidatura_id, motivo } = await req.json();
    if (!candidatura_id) return json({ error: "candidatura_id obrigatório" }, 400);

    await admin.from("candidaturas").update({
      status: "rejeitado",
      avaliado_por: userData.user.id,
      avaliado_em: new Date().toISOString(),
      observacoes_internas: motivo ?? null,
    }).eq("id", candidatura_id);

    await admin.from("activity_logs").insert({
      user_id: userData.user.id,
      action: "candidatura_rejeitada",
      entity_type: "candidaturas",
      entity_id: candidatura_id,
      details: { motivo: motivo ?? null },
    });

    return json({ success: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
