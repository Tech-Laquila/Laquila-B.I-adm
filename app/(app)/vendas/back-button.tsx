"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();

    return (
        <button 
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-neutral-400 hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
        </button>
    );
}
