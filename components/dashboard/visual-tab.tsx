"use client";

import { useActionState } from "react";
import { atualizarVisuais } from "@/app/actions/empresa";
import ImageUploader from "./image-uploader";
import { Button } from "@/components/ui/button";
import type { Empresa } from "@/types/database";

interface Props {
    empresa: Empresa;
}

export default function VisualTab({ empresa }: Props) {
    const [state, formAction, isPending] = useActionState(atualizarVisuais, null);

    return (
        <form action={formAction}
            className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
            <h3 className="text-[#00e5a0] text-[10px] font-semibold uppercase tracking-widest">
                Customização Visual
            </h3>
            <input type="hidden" name="empresa_id" value={empresa.id} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs text-gray-400 block mb-2">Logotipo</label>
                    <ImageUploader empresaId={empresa.id} tipo="logo"
                        currentUrl={empresa.logo_url}
                        onUploaded={(url) => {
                            const input = document.getElementById('logo_url') as HTMLInputElement;
                            if (input) input.value = url;
                        }} />
                    <input type="hidden" name="logo_url" id="logo_url" defaultValue={empresa.logo_url || ""} />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-2">Personagem</label>
                    <ImageUploader empresaId={empresa.id} tipo="personagem"
                        currentUrl={empresa.personagem_url}
                        onUploaded={(url) => {
                            const input = document.getElementById('personagem_url') as HTMLInputElement;
                            if (input) input.value = url;
                        }} />
                    <input type="hidden" name="personagem_url" id="personagem_url" defaultValue={empresa.personagem_url || ""} />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-2">Background</label>
                    <ImageUploader empresaId={empresa.id} tipo="bg"
                        currentUrl={empresa.background_url}
                        onUploaded={(url) => {
                            const input = document.getElementById('background_url') as HTMLInputElement;
                            if (input) input.value = url;
                        }} />
                    <input type="hidden" name="background_url" id="background_url" defaultValue={empresa.background_url || ""} />
                </div>
            </div>

            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            {state?.success && <p className="text-green-400 text-sm">Visual atualizado!</p>}
            <Button type="submit" disabled={isPending} className="bg-[#00e5a0] hover:bg-[#00c08b] text-black font-semibold border-none">
                {isPending ? "Salvando..." : "Salvar Configurações Visuais"}
            </Button>
        </form>
    );
}
