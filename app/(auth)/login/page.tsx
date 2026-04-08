"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
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

type ActionState = { error?: string } | null;

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        loginAction,
        null
    );

    return (
        <Card className="border-neutral-800 bg-[#111] text-white">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Acessar Laquila B.I ADM</CardTitle>
                <CardDescription className="text-center text-neutral-400">
                    Insira seu e-mail e senha para entrar.
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
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            className="bg-neutral-900 border-neutral-800"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Senha</Label>
                            <Link href="/recuperar-senha" className="text-sm font-medium text-amber-500 hover:text-amber-400">
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            className="bg-neutral-900 border-neutral-800"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60"
                    >
                        {isPending ? "Entrando..." : "Entrar"}
                    </Button>
                    <div className="text-center text-sm text-neutral-400">
                        Não tem uma conta?{" "}
                        <Link href="/cadastro" className="text-amber-500 hover:text-amber-400 underline underline-offset-4">
                            Cadastre-se
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
