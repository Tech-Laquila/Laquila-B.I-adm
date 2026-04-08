"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useSupabaseRealtime() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase.channel("dashboard-realtime");

        // Ouve todas as mudanças em leads
        channel.on(
            "postgres_changes",
            { event: "*", schema: "public", table: "leads" },
            () => {
                queryClient.invalidateQueries();
            }
        );

        // Ouve todas as mudanças em vendas
        channel.on(
            "postgres_changes",
            { event: "*", schema: "public", table: "vendas" },
            () => {
                queryClient.invalidateQueries();
            }
        );

        // Ouve todas as mudanças em facebook_ads 
        channel.on(
            "postgres_changes",
            { event: "*", schema: "public", table: "facebook_ads" },
            () => {
                queryClient.invalidateQueries();
            }
        );

        channel.subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, supabase]);
}
