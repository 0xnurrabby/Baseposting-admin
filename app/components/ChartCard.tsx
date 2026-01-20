import { ReactNode } from "react";

export const ChartCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-3xl border border-mist bg-white/80 p-5 shadow-soft-md">
    <div className="text-sm font-medium text-slate-600">{title}</div>
    <div className="mt-4 h-64 w-full">{children}</div>
  </div>
);
