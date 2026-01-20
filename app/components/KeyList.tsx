import { KeySummary } from "../lib/types";

export const KeyList = ({
  keys,
  selectedKey,
  onSelect
}: {
  keys: KeySummary[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    {keys.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-mist bg-white/60 p-4 text-center text-sm text-slate-400">
        No keys found.
      </div>
    ) : (
      keys.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
            selectedKey === item.key
              ? "border-accent bg-accent/10 text-ink"
              : "border-mist bg-white/70 text-slate-600 hover:border-accent/50"
          }`}
        >
          <span className="truncate font-medium">{item.key}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            {item.type}
          </span>
        </button>
      ))
    )}
  </div>
);
