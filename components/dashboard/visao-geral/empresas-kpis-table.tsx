import type { EmpresaKPIsRow } from "@/types/database";

interface Props {
    empresas: EmpresaKPIsRow[];
}

const brl = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const num = (v: number) => v.toLocaleString("pt-BR");

const pct = (v: number) => `${v.toFixed(1)}%`;

export function EmpresasKpisTable({ empresas }: Props) {
    if (empresas.length === 0) {
        return (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
                <p className="text-neutral-500 text-sm">Nenhuma empresa encontrada para o período.</p>
            </div>
        );
    }

    const totais = empresas.reduce(
        (acc, e) => ({
            custo: acc.custo + e.custo,
            leads: acc.leads + e.leads,
            contratos: acc.contratos + e.contratos,
        }),
        { custo: 0, leads: 0, contratos: 0 }
    );

    const totalCac = totais.contratos > 0 ? totais.custo / totais.contratos : 0;
    const totalCpa = totais.leads > 0 ? totais.custo / totais.leads : 0;
    const totalTx = totais.leads > 0 ? (totais.contratos / totais.leads) * 100 : 0;

    return (
        <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-neutral-800 bg-neutral-900">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Custo
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Leads
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Contratos
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                CAC
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                CPA
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                TX Conv.
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {empresas.map((empresa, i) => (
                            <tr
                                key={empresa.empresaId}
                                className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors ${
                                    i % 2 === 0 ? "bg-transparent" : "bg-neutral-900/20"
                                }`}
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        {empresa.logoUrl && (
                                            <img
                                                src={empresa.logoUrl}
                                                alt={empresa.nome}
                                                className="h-6 w-6 object-contain rounded flex-shrink-0"
                                            />
                                        )}
                                        <span className="font-medium text-white">{empresa.nome}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                    {brl(empresa.custo)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                    {num(empresa.leads)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums font-semibold text-[#00e5a0]">
                                    {num(empresa.contratos)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                    {brl(empresa.cac)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                    {brl(empresa.cpa)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums text-neutral-300">
                                    {pct(empresa.txConversao)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-neutral-700 bg-neutral-900/80">
                            <td className="px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                Total ({empresas.length} empresas)
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-semibold text-white">
                                {brl(totais.custo)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-semibold text-white">
                                {num(totais.leads)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#00e5a0]">
                                {num(totais.contratos)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-semibold text-white">
                                {brl(totalCac)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-semibold text-white">
                                {brl(totalCpa)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-semibold text-white">
                                {pct(totalTx)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
