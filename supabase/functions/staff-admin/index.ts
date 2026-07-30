import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StaffBody {
  action: "bootstrap_admin" | "create_cashier" | "toggle_active" | "delete_staff" | "list_staff";
  email?: string;
  password?: string;
  full_name?: string;
  role?: "admin" | "cashier";
  staff_id?: string;
  is_active?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = (await req.json()) as StaffBody;

    // ---------- bootstrap_admin ----------
    // Creates the initial admin@bcapital.com account if it doesn't exist yet.
    // This action is only callable when no admin exists yet (idempotent + safe).
    if (body.action === "bootstrap_admin") {
      const { data: existing } = await admin
        .from("staff_profiles")
        .select("id, email")
        .eq("role", "admin")
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ message: "Admin already exists", email: existing.email, exists: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const email = (body.email || "admin@bcapital.com").toLowerCase().trim();
      const password = body.password || "12345678";
      const full_name = body.full_name || "System Administrator";

      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: "admin" },
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await admin.from("staff_profiles").insert({
        id: created.user.id,
        email,
        full_name,
        role: "admin",
        is_active: true,
      });

      return new Response(
        JSON.stringify({ message: "Admin account created", email }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- bootstrap_cashier ----------
    // Creates the initial cashier@bcapital.com account if no cashier exists yet.
    // Idempotent + safe, callable without auth (demo seeding only).
    if (body.action === "bootstrap_cashier") {
      const { data: existing } = await admin
        .from("staff_profiles")
        .select("id, email")
        .eq("role", "cashier")
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ message: "Cashier already exists", email: existing.email, exists: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const email = (body.email || "cashier@bcapital.com").toLowerCase().trim();
      const password = body.password || "cashier123";
      const full_name = body.full_name || "Front Desk Cashier";

      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: "cashier" },
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await admin.from("staff_profiles").insert({
        id: created.user.id,
        email,
        full_name,
        role: "cashier",
        is_active: true,
      });

      return new Response(
        JSON.stringify({ message: "Cashier account created", email }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- For all other actions, require an authenticated staff caller ----------
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = userData.user.id;
    const { data: caller } = await admin
      .from("staff_profiles")
      .select("role, is_active")
      .eq("id", callerId)
      .maybeSingle();

    if (!caller || !caller.is_active) {
      return new Response(
        JSON.stringify({ error: "Forbidden: not an active staff member" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- list_staff ----------
    if (body.action === "list_staff") {
      const { data, error } = await admin
        .from("staff_profiles")
        .select("id, email, full_name, role, is_active, created_at")
        .order("created_at", { ascending: true });
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ staff: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- create_cashier (admin only) ----------
    if (body.action === "create_cashier") {
      if (caller.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin role required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const email = (body.email || "").toLowerCase().trim();
      const password = body.password || "";
      const full_name = body.full_name || "";
      if (!email || !password || !full_name) {
        return new Response(
          JSON.stringify({ error: "email, password and full_name are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: body.role || "cashier" },
      });
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await admin.from("staff_profiles").insert({
        id: created.user.id,
        email,
        full_name,
        role: body.role || "cashier",
        is_active: true,
      });

      return new Response(
        JSON.stringify({ message: "Cashier account created", email }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- toggle_active (admin only) ----------
    if (body.action === "toggle_active") {
      if (caller.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin role required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error } = await admin
        .from("staff_profiles")
        .update({ is_active: body.is_active })
        .eq("id", body.staff_id);
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ message: "Staff status updated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- delete_staff (admin only) ----------
    if (body.action === "delete_staff") {
      if (caller.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin role required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (body.staff_id === callerId) {
        return new Response(
          JSON.stringify({ error: "Cannot delete your own account" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error: delErr } = await admin
        .from("staff_profiles")
        .delete()
        .eq("id", body.staff_id);
      if (delErr) {
        return new Response(
          JSON.stringify({ error: delErr.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error: authErr } = await admin.auth.admin.deleteUser(body.staff_id!);
      if (authErr) {
        return new Response(
          JSON.stringify({ error: authErr.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ message: "Staff account deleted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
