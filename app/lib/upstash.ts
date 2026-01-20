type RedisResponse<T> = {
  result: T;
  error?: string;
};

const getEnv = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Upstash REST credentials");
  }
  return { url, token };
};

export const callRedis = async <T>(command: string, args: (string | number)[] = []) => {
  const { url, token } = getEnv();
  const path = [command, ...args.map((arg) => encodeURIComponent(String(arg)))].join("/");
  const response = await fetch(`${url}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  const data = (await response.json()) as RedisResponse<T>;
  if (!response.ok || data.error) {
    throw new Error(data.error ?? "Upstash error");
  }
  return data.result;
};
