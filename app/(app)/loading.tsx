import { Loader2 } from "lucide-react";

export default function AppLoading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            <Loader2 className="w-8 h-8 text-[#00e5a0] animate-spin" />
            <p className="text-neutral-500 text-sm tracking-widest uppercase">Carregando...</p>
        </div>
    );
}
