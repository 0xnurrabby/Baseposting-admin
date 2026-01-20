export type KeySummary = {
  key: string;
  type: string;
};

export type KeyDetail = {
  key: string;
  type: string;
  ttl: number | null;
  size: number | null;
  value?: string | Record<string, string>;
};

export type DashboardStats = {
  totalKeys: number;
  memory: string | null;
  opsPerSec: string | null;
  clients: string | null;
  dailyTrend: { date: string; count: number }[];
  prefixDistribution: { name: string; value: number }[];
  typeBreakdown: { name: string; value: number }[];
};
