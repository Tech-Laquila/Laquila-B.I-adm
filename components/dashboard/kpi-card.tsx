// components/dashboard/kpi-card.tsx
interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
}

export function KpiCard({ label, value, sub }: KpiCardProps) {
    return (
        <div className="flex flex-col justify-between p-4 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl min-h-[90px] hover:border-amber-500/30 transition-colors">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-amber-400 mt-2 tabular-nums">{value}</p>
            {sub && <p className="text-[10px] text-neutral-600 mt-1">{sub}</p>}
        </div>
    );
}
