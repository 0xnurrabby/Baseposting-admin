"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyDetail } from "../lib/types";
import { useToast } from "./Toast";

export const KeyDetailPanel = ({
  detail,
  onRefresh,
  onSaveString,
  onSaveHash,
  onSetTtl,
  onRename,
  onDelete
}: {
  detail: KeyDetail | null;
  onRefresh: () => Promise<void>;
  onSaveString: (value: string) => Promise<void>;
  onSaveHash: (entries: Record<string, string>, removed: string[]) => Promise<void>;
  onSetTtl: (ttl: number | null) => Promise<void>;
  onRename: (nextKey: string) => Promise<void>;
  onDelete: (confirm: string) => Promise<void>;
}) => {
  const { notify } = useToast();
  const [stringValue, setStringValue] = useState("");
  const [hashEntries, setHashEntries] = useState<[string, string][]>([]);
  const [ttlInput, setTtlInput] = useState("");
  const [renameInput, setRenameInput] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [prettyJson, setPrettyJson] = useState(false);
  const [removedFields, setRemovedFields] = useState<string[]>([]);

  useEffect(() => {
    if (!detail) return;
    setRenameInput(detail.key);
    if (detail.type === "string") {
      const value = typeof detail.value === "string" ? detail.value : "";
      setStringValue(value);
    }
    if (detail.type === "hash") {
      const entries = detail.value && typeof detail.value === "object" ? Object.entries(detail.value) : [];
      setHashEntries(entries);
    }
    setTtlInput(detail.ttl ? String(detail.ttl) : "");
    setRemovedFields([]);
  }, [detail]);

  const parsedPretty = useMemo(() => {
    if (!prettyJson) return stringValue;
    try {
      return JSON.stringify(JSON.parse(stringValue), null, 2);
    } catch {
      return stringValue;
    }
  }, [prettyJson, stringValue]);

  if (!detail) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-mist bg-white/60 text-sm text-slate-400">
        Select a key to inspect.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-mist bg-white/80 p-5 shadow-soft-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Key</div>
          <div className="mt-2 text-lg font-semibold text-ink">{detail.key}</div>
          <div className="mt-1 text-xs text-slate-400">
            Type: {detail.type.toUpperCase()} · TTL: {detail.ttl ?? "∞"} · Size: {detail.size ?? "—"}
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-full border border-mist px-3 py-1 text-xs text-slate-500 transition hover:border-accent/60"
        >
          Refresh
        </button>
      </div>

      {detail.type === "string" ? (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Value</label>
            <button
              onClick={() => setPrettyJson((prev) => !prev)}
              className="rounded-full border border-mist px-3 py-1 text-xs text-slate-500"
            >
              {prettyJson ? "Raw" : "Pretty JSON"}
            </button>
          </div>
          <textarea
            value={parsedPretty}
            onChange={(event) => setStringValue(event.target.value)}
            className="min-h-[200px] flex-1 rounded-2xl border border-mist bg-slate-50 p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            onClick={async () => {
              await onSaveString(stringValue);
              notify({ title: "String value updated", tone: "success" });
            }}
            className="self-start rounded-full bg-ink px-4 py-2 text-sm text-white"
          >
            Save Value
          </button>
        </div>
      ) : null}

      {detail.type === "hash" ? (
        <div className="flex flex-1 flex-col gap-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Fields</div>
          <div className="space-y-2 overflow-y-auto pr-1">
            {hashEntries.map(([field, value]) => (
              <div key={field} className="grid grid-cols-[140px_1fr_auto] items-center gap-2">
                <input
                  value={field}
                  readOnly
                  className="rounded-xl border border-mist bg-slate-100 px-2 py-2 text-xs text-slate-500"
                />
                <input
                  value={value}
                  onChange={(event) => {
                    setHashEntries((prev) =>
                      prev.map((entry) => (entry[0] === field ? [field, event.target.value] : entry))
                    );
                  }}
                  className="rounded-xl border border-mist bg-white px-2 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    setHashEntries((prev) => prev.filter((entry) => entry[0] !== field));
                    setRemovedFields((prev) => [...prev, field]);
                  }}
                  className="rounded-full border border-mist px-3 py-1 text-xs text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setHashEntries((prev) => [...prev, [`field_${prev.length + 1}`, ""]])}
            className="self-start rounded-full border border-mist px-4 py-2 text-xs text-slate-500"
          >
            Add Field
          </button>
          <button
            onClick={async () => {
              const entries = Object.fromEntries(hashEntries);
              await onSaveHash(entries, removedFields);
              notify({ title: "Hash updated", tone: "success" });
            }}
            className="self-start rounded-full bg-ink px-4 py-2 text-sm text-white"
          >
            Save Hash
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 rounded-2xl border border-mist bg-slate-50 p-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">TTL</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={ttlInput}
              onChange={(event) => setTtlInput(event.target.value)}
              placeholder="Seconds"
              className="w-32 rounded-xl border border-mist bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={async () => {
                await onSetTtl(ttlInput ? Number(ttlInput) : null);
                notify({ title: "TTL updated", tone: "success" });
              }}
              className="rounded-full border border-mist px-3 py-2 text-xs"
            >
              Save TTL
            </button>
            <button
              onClick={async () => {
                await onSetTtl(null);
                setTtlInput("");
                notify({ title: "TTL removed", tone: "success" });
              }}
              className="rounded-full border border-mist px-3 py-2 text-xs"
            >
              Remove Expiration
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Rename</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={renameInput}
              onChange={(event) => setRenameInput(event.target.value)}
              className="flex-1 rounded-xl border border-mist bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={async () => {
                if (!renameInput) return;
                await onRename(renameInput);
                notify({ title: "Key renamed", tone: "success" });
              }}
              className="rounded-full border border-mist px-3 py-2 text-xs"
            >
              Rename
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-red-400">Danger Zone</div>
          <div className="mt-2 flex flex-col gap-2">
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={`Type ${detail.key} to delete`}
              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={async () => {
                await onDelete(confirmText);
                setConfirmText("");
                notify({ title: "Key deleted", tone: "success" });
              }}
              className="rounded-full bg-red-500 px-4 py-2 text-sm text-white"
            >
              Delete Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
