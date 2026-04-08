import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function criarVinculoSeConvite(user: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
}) {
  const { empresa_id, papel } = user.user_metadata as {
    empresa_id?: string;
    papel?: string;
  };

  if (!empresa_id) {
    console.log("[callback] user_metadata sem empresa_id — não é convite:", user.user_metadata);
    return;
  }

  const adminClient = createAdminClient();

  // 1. Criar registro na tabela usuarios (nome padrão = parte do email antes do @)
  const nomeDefault = user.email?.split("@")[0] ?? "Usuário";
  const { error: userError } = await adminClient
    .from("usuarios")
    .upsert(
      {
        id: user.id,
        email: user.email,
        nome: nomeDefault,
        empresa_atual_id: empresa_id,
      },
      { onConflict: "id" }
    );

  if (userError) {
    console.error("[callback] Erro ao criar registro em usuarios:", userError);
  }

  // 2. Criar vínculo usuario_empresa
  const { error: relError } = await adminClient.from("usuario_empresa").insert({
    usuario_id: user.id,
    empresa_id: empresa_id,
    papel: papel || "vendedor",
  });

  if (relError && relError.code !== "23505") {
    console.error("[callback] Erro ao criar vínculo usuario_empresa:", relError);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Fluxo token_hash (OTP/email link direto)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "invite" | "magiclink" | "email",
    });

    if (error) {
      console.error("[callback] Erro ao verificar token_hash:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    // Para convites, criar registro e vínculo com a empresa
    if (type === "invite") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await criarVinculoSeConvite(user);
      }
    }

    return NextResponse.redirect(`${origin}/redefinir-senha`);
  }

  // Fluxo PKCE (code exchange)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    console.error("Erro ao trocar code por sessão:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const user = data.session?.user;
  console.log("[callback] user_metadata recebido:", JSON.stringify(user?.user_metadata));
  const isInvite = user?.user_metadata?.empresa_id != null;

  if (isInvite && user) {
    await criarVinculoSeConvite(user);
  }

  return NextResponse.redirect(`${origin}/redefinir-senha`);
}
