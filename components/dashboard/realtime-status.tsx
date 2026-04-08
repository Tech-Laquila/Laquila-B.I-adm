"use client"

import { useRealtimeDashboard } from "@/hooks/use-realtime-dashboard"

const statusConfig = {
    connecting: { color: "bg-yellow-400", label: "conectando..." },
    connected: { color: "bg-[#00e5a0]", label: "ao vivo" },
    reconnecting: { color: "bg-orange-400 animate-pulse", label: "reconectando..." },
    disconnected: { color: "bg-red-500", label: "desconectado" },
}

export function RealtimeStatus() {
    const { status } = useRealtimeDashboard()
    const { color, label } = statusConfig[status]

    return (
        <div className="flex items-center gap-1.5" title={`Realtime: ${label}`}>
            <span className={`w-2 h-2 rounded-full ${color} ${status === "connected" ? "animate-pulse" : ""}`} />
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                {label}
            </span>
        </div>
    )
}
