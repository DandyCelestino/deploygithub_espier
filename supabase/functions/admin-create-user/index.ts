// Edge function: admin/gerente cria usuário aprovado a partir de candidatura
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ReqBody = {
  candidatura_id: string;
  role: "admin" | "gerente" | "tecnico" | "vendedor" | "financeiro";
  senha_temporaria: string;
};

const ROLES = ["admin", "gerente", "tecnico", "vendedor", "financeiro"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }

    // Cliente com JWT do usuário para validar quem é
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Sessão inválida" }, 401);
    }
    const requester = userData.user;

    // Cliente admin (service role)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verifica role do solicitante
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", requester.id);
    const requesterRoles = (roles ?? []).map((r) => r.role);
    if (!requesterRoles.some((r) => r === "admin" || r === "gerente")) {
      return json({ error: "Apenas admin/gerente pode aprovar" }, 403);
    }

    const body = (await req.json()) as ReqBody;
    if (!body.candidatura_id || !body.role || !body.senha_temporaria) {
      return json({ error: "Dados incompletos" }, 400);
    }
    if (!ROLES.includes(body.role)) {
      return json({ error: "Role inválida" }, 400);
    }
    // Apenas admin pode criar admin/gerente
    if (
      (body.role === "admin" || body.role === "gerente") &&
      !requesterRoles.includes("admin")
    ) {
      return json({ error: "Apenas admin pode atribuir essa role" }, 403);
    }
    if (body.senha_temporaria.length < 8) {
      return json({ error: "Senha temporária precisa de 8+ caracteres" }, 400);
    }

    // Busca candidatura
    const { data: cand, error: candErr } = await admin
      .from("candidaturas")
      .select("*")
      .eq("id", body.candidatura_id)
      .single();
    if (candErr || !cand) {
      return json({ error: "Candidatura não encontrada" }, 404);
    }
    if (cand.status === "aprovado" && cand.user_id_criado) {
      return json({ error: "Candidatura já foi aprovada" }, 409);
    }

    // Cria usuário
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: cand.email,
        password: body.senha_temporaria,
        email_confirm: true,
        user_metadata: { full_name: cand.nome_completo },
      });
    if (createErr || !created.user) {
      return json(
        { error: createErr?.message ?? "Falha ao criar usuário" },
        400,
      );
    }

    const newUserId = created.user.id;

    // handle_new_user trigger já cria profile. Atribui role
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role: body.role });
    if (roleErr) {
      return json({ error: "Falha ao atribuir role: " + roleErr.message }, 500);
    }

    // Atualiza candidatura
    await admin
      .from("candidaturas")
      .update({
        status: "aprovado",
        avaliado_por: requester.id,
        avaliado_em: new Date().toISOString(),
        user_id_criado: newUserId,
      })
      .eq("id", cand.id);

    // Log
    await admin.from("activity_logs").insert({
      user_id: requester.id,
      action: "candidatura_aprovada",
      entity_type: "candidaturas",
      entity_id: cand.id,
      details: {
        novo_user_id: newUserId,
        role: body.role,
        email: cand.email,
      },
    });

    return json({
      success: true,
      user_id: newUserId,
      email: cand.email,
      role: body.role,
    });
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
