import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("assistants")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

export async function POST(request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء." }, { status: 403 });
    }

    const { name, email, password } = await request.json();
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "بيانات ناقصة أو كلمة السر أقل من 6 أحرف." }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("assistants").insert([
      {
        name,
        email,
        role: "assistant",
        user_id: authData.user.id,
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "خطأ غير متوقع" }, { status: 500 });
  }
}
