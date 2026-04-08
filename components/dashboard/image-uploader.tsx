"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
    empresaId: string;
    tipo: "logo" | "personagem" | "bg";
    currentUrl?: string | null;
    onUploaded: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function validateImage(file: File): Promise<string | null> {
    if (file.size > MAX_SIZE) return "O arquivo deve ter no máximo 5MB.";
    if (!ALLOWED_MIME.includes(file.type)) return "Formato não suportado. Use JPEG, PNG, WebP ou GIF.";

    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8;
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    const isWebP = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;

    if (!isJPEG && !isPNG && !isWebP && !isGIF) return "O arquivo não é uma imagem válida.";
    return null;
}

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function ImageUploader({ empresaId, tipo, currentUrl, onUploaded }: Props) {
    const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        const validationError = await validateImage(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = "";
            return;
        }

        setIsUploading(true);
        const ext = file.name.split(".").pop();
        const pasta = tipo === "logo" ? "LogoEmpresa" : tipo === "personagem" ? "Persona" : "BackGround";
        const path = `${empresaId}/${pasta}/${tipo}.${ext}`;

        const { error } = await supabase.storage
            .from("Mentorados")
            .upload(path, file, { upsert: true });

        if (!error) {
            const { data: { publicUrl } } = supabase.storage
                .from("Mentorados")
                .getPublicUrl(path);

            setPreview(publicUrl);
            onUploaded(publicUrl);
        } else {
            setUploadError("Erro ao enviar imagem. Tente novamente.");
        }

        setIsUploading(false);
    }

    return (
        <div className="space-y-2">
            {preview && (
                <img src={preview} alt={tipo} className="w-24 h-24 object-contain rounded-lg border border-[#1f1f1f]" />
            )}
            <label className={`cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="px-4 py-2 text-xs font-medium rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 transition-colors inline-block text-center">
                    {isUploading ? "Enviando..." : `Upload ${tipo}`}
                </div>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
            </label>
            {uploadError && (
                <p className="text-red-400 text-xs">{uploadError}</p>
            )}
        </div>
    );
}
