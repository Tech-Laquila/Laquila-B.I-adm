/**
 * Formata um número para moeda brasileira (BRL)
 */
export function moeda(v: number) {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formata um número para porcentagem com 2 casas decimais
 */
export function pct(v: number) {
    return `${v.toFixed(2)}%`;
}
