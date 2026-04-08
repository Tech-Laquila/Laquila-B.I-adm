import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitOptions = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export default function rateLimit(options?: RateLimitOptions) {
    const intervalMs = options?.interval ?? 60000;

    return {
        check: async (limit: number, tokenKey: string): Promise<void> => {
            try {
                const supabase = createAdminClient();
                const windowStart = new Date(Date.now() - intervalMs).toISOString();

                const { count } = await supabase
                    .from("rate_limits")
                    .select("id", { count: "exact", head: true })
                    .eq("key", tokenKey)
                    .gte("created_at", windowStart);

                if ((count ?? 0) >= limit) {
                    throw new Error("Rate limit exceeded");
                }

                await supabase.from("rate_limits").insert({ key: tokenKey });

                supabase
                    .from("rate_limits")
                    .delete()
                    .lt("created_at", new Date(Date.now() - intervalMs * 2).toISOString())
                    .then(() => {});
            } catch (err) {
                if (err instanceof Error && err.message === "Rate limit exceeded") {
                    throw err;
                }
            }
        },
    };
}
