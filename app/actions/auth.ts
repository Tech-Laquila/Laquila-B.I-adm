"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";

type AuthState = { error?: string } | null;

const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

// ── LOGIN ────────────────────────────────────────────────────────────────────
export async function loginAction(
    _prevState: AuthState,
    formData: FormData
): Promise<AuthState> {
    try {
        await limiter.check(5, "login_rate_limit"); // Límite de 5 tentativas por minuto
    } catch {
        return { error: "Muitas tentativas de login. Tente novamente em alguns minutos." };
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password
    });

    if (error) {
        return { error: "E-mail ou senha inválidos. Verifique os dados e tente novamente." };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

// ── LOGOUT ───────────────────────────────────────────────────────────────────
export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

// ── RECUPERAR SENHA ──────────────────────────────────────────────────────────
export async function forgotPasswordAction(
    _prevState: { error?: string; success?: boolean } | null,
    formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
    try {
        await limiter.check(3, "forgot_password_rate_limit");
    } catch {
        return { error: "Muitas tentativas. Tente novamente em alguns minutos." };
    }

    const email = formData.get("email") as string;
    if (!email) return { error: "E-mail é obrigatório." };

    const headersList = await headers();
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        headersList.get("origin") ??
        `https://${headersList.get("host")}`;

    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/callback`,
    });

    return { success: true };
}

// ── REDEFINIR SENHA ───────────────────────────────────────────────────────────
export async function updatePasswordAction(
    _prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | null> {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
        return { error: "Preencha todos os campos." };
    }

    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem." };
    }

    if (password.length < 6) {
        return { error: "A senha deve ter no mínimo 6 caracteres." };
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Sessão expirada ou inválida. Por favor, solicite um novo link de redefinição de senha." };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error("Erro ao atualizar senha:", error.message);
        return { error: "Não foi possível atualizar a senha. Tente novamente." };
    }

    redirect("/dashboard");
}
