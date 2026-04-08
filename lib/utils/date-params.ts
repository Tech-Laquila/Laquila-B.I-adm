const TZ = "America/Sao_Paulo";

/**
 * Retorna componentes da data/hora atual no fuso horário de São Paulo (GMT-3).
 */
function nowBR() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return {
        year: parseInt(get("year")),
        month: parseInt(get("month")) - 1, // 0-indexed como JS Date
        day: parseInt(get("day")),
        dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
    };
}

/**
 * Retorna a data de hoje em São Paulo como string YYYY-MM-DD.
 */
export function todayBR(): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/**
 * Retorna o início do período (mês/semana/dia) no fuso de São Paulo como string YYYY-MM-DD.
 */
export function startOfBR(unit: "month" | "week" | "day"): string {
    const { year, month, day, dayOfWeek } = nowBR();
    if (unit === "month") {
        return `${year}-${String(month + 1).padStart(2, "0")}-01`;
    }
    if (unit === "week") {
        // Recua até segunda-feira (semana começa na segunda)
        const daysToMonday = (dayOfWeek + 6) % 7;
        const d = new Date(year, month, day - daysToMonday);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    // day
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Lógica comum para extrair e validar filtros de data e teses dos searchParams.
 */
export function parseDashboardParams(params: { inicio?: string; fim?: string; teses?: string }) {
    const { year, month } = nowBR();

    const dataInicio = params.inicio ?? startOfBR("month");

    const dataFim =
        params.fim ??
        (() => {
            const lastDay = new Date(year, month + 1, 0).getDate();
            return `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        })();

    const tesesFiltro = params.teses ? params.teses.split(",").filter(Boolean) : [];
    const tesesParam = tesesFiltro.length > 0 ? tesesFiltro : undefined;

    return {
        dataInicio,
        dataFim,
        tesesFiltro,
        tesesParam,
    };
}
