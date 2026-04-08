"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
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

type State = { error?: string; success?: boolean } | null;

export default function RecuperarSenhaPage() {
    const [state, formAction, isPending] = useActionState<State, FormData>(
        forgotPasswordAction,
        null
    );

    if (state?.success) {
        return (
            <Card className="border-neutral-800 bg-[#111] text-white">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">E-mail enviado</CardTitle>
                    <CardDescription className="text-center text-neutral-400">
                        Se o e-mail estiver cadastrado, você receberá as instruções de recuperação em breve.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                    <Link href="/login" className="text-amber-500 hover:text-amber-400 text-sm underline underline-offset-4">
                        Voltar ao login
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border-neutral-800 bg-[#111] text-white">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Recuperar senha</CardTitle>
                <CardDescription className="text-center text-neutral-400">
                    Informe seu e-mail para receber as instruções de recuperação.
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60"
                    >
                        {isPending ? "Enviando..." : "Enviar instruções"}
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
