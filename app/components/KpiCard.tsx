export const KpiCard = ({ label, value, helper }: { label: string; value: string; helper?: string }) => (
  <div className="rounded-3xl border border-mist bg-white/80 p-5 shadow-soft-md">
    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
    <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
    {helper ? <div className="mt-1 text-xs text-slate-400">{helper}</div> : null}
  </div>
);
