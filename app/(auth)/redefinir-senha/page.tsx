"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { updatePasswordAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type State = { error?: string } | null;

export default function RedefinirSenhaPage() {
    const [state, formAction, isPending] = useActionState<State, FormData>(
        updatePasswordAction,
        null
    );

    // Processa o hash #access_token=... do link legacy do Supabase,
    // estabelecendo a sessão em cookies para que o Server Action possa acessá-la.
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
            createClient().auth.getSession();
        }
    }, []);

    return (
        <Card className="border-neutral-800 bg-[#111] text-white">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Redefinir senha</CardTitle>
                <CardDescription className="text-center text-neutral-400">
                    Crie uma nova senha para sua conta.
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    {state?.error && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            {state.error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            className="bg-neutral-900 border-neutral-800"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repita a nova senha"
                            className="bg-neutral-900 border-neutral-800"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60"
                    >
                        {isPending ? "Redefinindo..." : "Redefinir senha"}
                    </Button>
                    <div className="text-center text-sm text-neutral-400">
                        <Link href="/login" className="text-amber-500 hover:text-amber-400 underline underline-offset-4">
                            Voltar ao login
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
