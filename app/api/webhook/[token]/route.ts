import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

const webhookSchema = z.object({
    funnel_stage: z.string().optional().nullable(),
    created_at: z.string().optional().nullable(),
    contact: z.object({
        name: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
    }).optional().nullable(),
    utm_source: z.string().optional().nullable(),
    utm_medium: z.string().optional().nullable(),
    utm_campaign: z.string().optional().nullable(),
    utm_term: z.string().optional().nullable(),
    utm_content: z.string().optional().nullable(),
    ad: z.object({
        campaign_id: z.string().optional().nullable(),
        adset_id: z.string().optional().nullable(),
        ad_id: z.string().optional().nullable(),
    }).optional().nullable(),
}).passthrough();

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const supabase = createAdminClient();
    const { token } = await params;

    try {
        await limiter.check(100, `webhook_rate_limit_${token}`);
    } catch {
        return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    try {
        const rawPayload = await req.json();

        let payload;
        try {
            payload = webhookSchema.parse(rawPayload);
        } catch (validationError) {
            console.error("Payload validation failed:", validationError);
            return NextResponse.json({ error: "Invalid payload format." }, { status: 400 });
        }

        const { data: empresa, error: empresaError } = await supabase
            .from("empresas")
            .select("id, funil_config")
            .eq("webhook_token", token)
            .single();

        if (empresaError || !empresa) {
            return NextResponse.json({ error: "Empresa não encontrada ou token inválido." }, { status: 404 });
        }

        const empresaId = empresa.id;

        const { data: logEntry } = await supabase
            .from("webhook_logs")
            .insert({
                empresa_id: empresaId,
                payload: rawPayload,
                status: "recebido"
            })
            .select("id")
            .single();

        const logId = logEntry?.id ?? null;

        const funilConfig = (empresa.funil_config as Record<string, string>) ?? {
            fez_contato: "Fez Contato",
            dados_solicitados: "Lista",
            link_enviado: "Link Enviado",
            contrato_fechado: "Comprou",
        };

        const etapa = payload.funnel_stage || "recebido";

        const fezContato = etapa === funilConfig.fez_contato
            || etapa === funilConfig.dados_solicitados
            || etapa === funilConfig.link_enviado
            || etapa === funilConfig.contrato_fechado;
        const dadosSolicitados = etapa === funilConfig.dados_solicitados
            || etapa === funilConfig.link_enviado
            || etapa === funilConfig.contrato_fechado;
        const linkEnviado = etapa === funilConfig.link_enviado
            || etapa === funilConfig.contrato_fechado;
        const contratoFechado = etapa === funilConfig.contrato_fechado;

        const whatsappContato = payload.contact?.phone || null;

        const agora = new Date().toISOString();

        const leadData = {
            empresa_id: empresaId,
            nome_contato: payload.contact?.name || "Desconhecido",
            whatsapp_contato: whatsappContato,
            etapa_jornada: etapa,
            fez_contato: fezContato,
            dados_solicitados: dadosSolicitados,
            link_enviado: linkEnviado,
            contrato_fechado: contratoFechado,
            data_inicial: payload.created_at || agora,
            ...(dadosSolicitados && { data_dados_solicitados: agora }),
            ...(linkEnviado && { data_link: agora }),
            ...(contratoFechado && { data_venda: agora }),
            utm_source: payload.utm_source || null,
            utm_medium: payload.utm_medium || null,
            utm_campaign: payload.utm_campaign || null,
            utm_term: payload.utm_term || null,
            utm_content: payload.utm_content || null,
            id_campanha: payload.ad?.campaign_id || null,
            id_conjunto: payload.ad?.adset_id || null,
            id_anuncio: payload.ad?.ad_id || null,
        };

        let insertError;

        if (whatsappContato) {
            const { error } = await supabase
                .from("leads")
                .upsert(leadData, {
                    onConflict: "empresa_id,whatsapp_contato",
                    ignoreDuplicates: false,
                });
            insertError = error;
        } else {
            const { error } = await supabase.from("leads").insert(leadData);
            insertError = error;
        }

        if (insertError) {
            console.error("Erro ao inserir lead:", insertError);

            if (logId) {
                await supabase
                    .from("webhook_logs")
                    .update({ status: "erro", payload: { error: insertError.message, ...rawPayload } })
                    .eq("id", logId);
            }

            return NextResponse.json({ error: "Erro interno ao processar lead." }, { status: 500 });
        }

        if (logId) {
            await supabase
                .from("webhook_logs")
                .update({ status: "ok" })
                .eq("id", logId);
        }

        return NextResponse.json({ success: true, message: "Lead processado com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error("Erro de parse ou processamento do webhook:", error);
        return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }
}
