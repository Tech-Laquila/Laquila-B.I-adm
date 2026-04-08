import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
            <div className="w-full max-w-md p-6">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="h-10 w-10 bg-amber-500 rounded-md mb-2"></div>
                    <h1 className="text-2xl font-bold tracking-tight">Laquila B.I ADM</h1>
                </div>
                {children}
            </div>
        </div>
    );
}
