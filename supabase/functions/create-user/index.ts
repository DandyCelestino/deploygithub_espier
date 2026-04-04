import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, password, full_name, matricula, role, roles } = await req.json();
    const rolesList: string[] = roles || (role ? [role] : []);

    if (!email || !password || !full_name || rolesList.length === 0) {
      return new Response(
        JSON.stringify({ error: "email, password, full_name e pelo menos uma role são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin (except for first user setup)
    const authHeader = req.headers.get("Authorization");
    
    // Check if any users exist
    const { count } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });
    const isFirstUser = count === 0;

    if (!isFirstUser) {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Autenticação necessária" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
      
      if (!caller) {
        return new Response(
          JSON.stringify({ error: "Token inválido" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: callerRoles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id);

      const isAdmin = callerRoles?.some((r: any) => r.role === "admin");
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Apenas administradores podem criar usuários" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    // Update profile with matricula
    if (matricula) {
      await supabaseAdmin
        .from("profiles")
        .update({ matricula, full_name })
        .eq("user_id", userId);
    }

    // Assign roles
    const roleInserts = rolesList.map((r: string) => ({ user_id: userId, role: r }));
    await supabaseAdmin.from("user_roles").insert(roleInserts);

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
