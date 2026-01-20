"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartCard } from "./components/ChartCard";
import { KeyDetailPanel } from "./components/KeyDetailPanel";
import { KeyList } from "./components/KeyList";
import { KpiCard } from "./components/KpiCard";
import { Skeleton } from "./components/Skeleton";
import { ToastProvider, useToast } from "./components/Toast";
import { DashboardStats, KeyDetail, KeySummary } from "./lib/types";

const palette = ["#4f7cff", "#9b8cff", "#6ee7b7", "#fbbf24", "#f87171", "#60a5fa"];

const Dashboard = () => {
  const { notify } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pattern, setPattern] = useState("*");
  const [keyType, setKeyType] = useState("all");
  const [keys, setKeys] = useState<KeySummary[]>([]);
  const [cursor, setCursor] = useState("0");
  const [keysLoading, setKeysLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<KeyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSession = useCallback(async () => {
    setAuthLoading(true);
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
    setAuthLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const response = await fetch("/api/dashboard");
    if (response.ok) {
      const data = (await response.json()) as DashboardStats;
      setStats(data);
    }
    setStatsLoading(false);
  }, []);

  const loadKeys = useCallback(
    async (nextCursor = "0") => {
      setKeysLoading(true);
      const response = await fetch(
        `/api/keys/scan?pattern=${encodeURIComponent(pattern)}&cursor=${nextCursor}&type=${keyType}`
      );
      if (response.ok) {
        const data = (await response.json()) as { keys: KeySummary[]; cursor: string };
        setKeys(data.keys);
        setCursor(data.cursor);
      }
      setKeysLoading(false);
    },
    [pattern, keyType]
  );

  const loadDetail = useCallback(async (key: string) => {
    setDetailLoading(true);
    const response = await fetch(`/api/keys/detail?key=${encodeURIComponent(key)}`);
    if (response.ok) {
      const data = (await response.json()) as KeyDetail;
      setDetail(data);
      setSelectedKey(key);
    }
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!authenticated) return;
    loadStats();
    loadKeys();
  }, [authenticated, loadKeys, loadStats]);

  const handleLogin = async () => {
    setLoginLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (response.ok) {
      notify({ title: "Welcome back", tone: "success" });
      setAuthenticated(true);
      loadStats();
      loadKeys();
    } else {
      const data = await response.json();
      notify({ title: data.error ?? "Login failed", tone: "error" });
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setStats(null);
    setKeys([]);
    setDetail(null);
  };

  const detailActions = useMemo(
    () => ({
      onRefresh: async () => {
        if (selectedKey) {
          await loadDetail(selectedKey);
        }
      },
      onSaveString: async (value: string) => {
        if (!selectedKey) return;
        await fetch("/api/keys/update-string", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: selectedKey, value })
        });
        await loadDetail(selectedKey);
      },
      onSaveHash: async (entries: Record<string, string>, removed: string[]) => {
        if (!selectedKey) return;
        await fetch("/api/keys/update-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: selectedKey, entries, removed })
        });
        await loadDetail(selectedKey);
      },
      onSetTtl: async (ttl: number | null) => {
        if (!selectedKey) return;
        await fetch("/api/keys/ttl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: selectedKey, ttl })
        });
        await loadDetail(selectedKey);
      },
      onRename: async (nextKey: string) => {
        if (!selectedKey) return;
        await fetch("/api/keys/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: selectedKey, newKey: nextKey })
        });
        setSelectedKey(nextKey);
        await loadDetail(nextKey);
        await loadKeys();
      },
      onDelete: async (confirm: string) => {
        if (!selectedKey || confirm !== selectedKey) {
          notify({ title: "Confirmation text mismatch", tone: "error" });
          return;
        }
        await fetch("/api/keys/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: selectedKey })
        });
        setSelectedKey(null);
        setDetail(null);
        await loadKeys();
      }
    }),
    [loadDetail, loadKeys, notify, selectedKey]
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud">
        <div className="text-sm text-slate-400">Checking session...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud p-6">
        <div className="w-full max-w-md rounded-3xl border border-mist bg-white/90 p-6 shadow-soft-lg">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Redis Control Room</div>
          <h1 className="mt-3 text-2xl font-semibold text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Secure access required for all controls.</p>
          <div className="mt-6 space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
            />
            <input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm"
            />
            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full rounded-2xl bg-ink px-4 py-3 text-sm text-white transition hover:bg-ink/90"
            >
              {loginLoading ? "Signing in..." : "Enter Control Room"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloud px-6 pb-10 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Redis Control Room</div>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Apple-like light dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Full-screen visibility + precision edits.</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-mist px-4 py-2 text-xs text-slate-500"
        >
          Sign out
        </button>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsLoading || !stats ? (
          [...Array(4)].map((_, index) => <Skeleton key={index} className="h-28" />)
        ) : (
          <>
            <KpiCard label="Total Keys" value={String(stats.totalKeys)} />
            <KpiCard label="Memory" value={stats.memory ?? "—"} helper="Used memory" />
            <KpiCard label="Ops/Sec" value={stats.opsPerSec ?? "—"} helper="Instantaneous" />
            <KpiCard label="Clients" value={stats.clients ?? "—"} helper="Connected" />
          </>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <ChartCard title="Daily Posts Trend">
          {stats ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyTrend} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e6e9f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f7cff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full" />
          )}
        </ChartCard>
        <ChartCard title="Top Prefixes">
          {stats ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.prefixDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                  {stats.prefixDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full" />
          )}
        </ChartCard>
        <ChartCard title="Key Types">
          {stats ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.typeBreakdown} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                  {stats.typeBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[(index + 2) % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full" />
          )}
        </ChartCard>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-3xl border border-mist bg-white/80 p-5 shadow-soft-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Keys</div>
              <div className="mt-1 text-lg font-semibold text-ink">Browse & search</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="Pattern (e.g. user:*)"
                className="rounded-full border border-mist bg-white px-4 py-2 text-xs"
              />
              <select
                value={keyType}
                onChange={(event) => setKeyType(event.target.value)}
                className="rounded-full border border-mist bg-white px-3 py-2 text-xs"
              >
                <option value="all">All types</option>
                <option value="string">String</option>
                <option value="hash">Hash</option>
                <option value="list">List</option>
                <option value="set">Set</option>
                <option value="zset">ZSet</option>
                <option value="stream">Stream</option>
              </select>
              <button
                onClick={() => loadKeys("0")}
                className="rounded-full bg-ink px-4 py-2 text-xs text-white"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {keysLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-12" />
                ))}
              </div>
            ) : (
              <KeyList keys={keys} selectedKey={selectedKey} onSelect={loadDetail} />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Cursor: {cursor}</span>
            <button
              onClick={() => loadKeys(cursor)}
              className="rounded-full border border-mist px-3 py-1"
            >
              Load next page
            </button>
          </div>
        </div>

        <div className="min-h-[520px]">
          {detailLoading ? (
            <Skeleton className="h-full" />
          ) : (
            <KeyDetailPanel
              detail={detail}
              onRefresh={detailActions.onRefresh}
              onSaveString={detailActions.onSaveString}
              onSaveHash={detailActions.onSaveHash}
              onSetTtl={detailActions.onSetTtl}
              onRename={detailActions.onRename}
              onDelete={detailActions.onDelete}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default function Home() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
