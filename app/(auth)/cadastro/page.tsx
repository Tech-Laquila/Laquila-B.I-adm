import Link from "next/link";
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

export default function RegisterPage() {
    return (
        <Card className="border-neutral-800 bg-[#111] text-white">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Criar uma conta</CardTitle>
                <CardDescription className="text-center text-neutral-400">
                    Preencha seus dados para iniciar na plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" type="text" placeholder="João Silva" className="bg-neutral-900 border-neutral-800" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="nome@exemplo.com" className="bg-neutral-900 border-neutral-800" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" className="bg-neutral-900 border-neutral-800" />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium">Criar Conta</Button>
                <div className="text-center text-sm text-neutral-400">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-amber-500 hover:text-amber-400 underline underline-offset-4">
                        Entrar
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
