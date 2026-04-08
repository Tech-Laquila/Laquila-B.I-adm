/**
 * Limite máximo de linhas por query de agregação.
 * O PostgREST retorna no máximo 1000 rows por padrão — sem este limite
 * explícito, queries com mais registros são silenciosamente truncadas,
 * causando KPIs e cálculos incorretos.
 */
export const QUERY_MAX_ROWS = 10000;
