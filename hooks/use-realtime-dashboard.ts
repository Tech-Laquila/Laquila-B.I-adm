"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export type RealtimeStatus = "connecting" | "connected" | "reconnecting" | "disconnected"

export function useRealtimeDashboard() {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<RealtimeStatus>("connecting")

    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel("dashboard-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, () => {
                queryClient.invalidateQueries()
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
                queryClient.invalidateQueries()
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "facebook_ads" }, () => {
                queryClient.invalidateQueries()
            })
            .subscribe((s) => {
                if (s === "SUBSCRIBED") setStatus("connected")
                else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("reconnecting")
                else if (s === "CLOSED") setStatus("disconnected")
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [queryClient])

    return { status }
}
