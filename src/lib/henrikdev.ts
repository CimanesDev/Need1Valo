import type { ValorantAccount, ValorantMMR, ValorantMatch } from "@/lib/types";

const BASE_URL = "https://api.henrikdev.xyz";
const API_KEY = import.meta.env.VITE_HENRIKDEV_API_KEY as string;

type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };

async function apiFetch<T>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: API_KEY },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { error: body?.errors?.[0]?.message ?? `API error ${res.status}` };
    }
    const json = await res.json();
    return { data: json.data as T };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

export function fetchAccount(name: string, tag: string) {
  return apiFetch<ValorantAccount>(
    `/valorant/v2/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
}

export function fetchMMR(name: string, tag: string, region = "ap") {
  return apiFetch<ValorantMMR>(
    `/valorant/v3/mmr/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
}

export function fetchMatchHistory(name: string, tag: string, region = "ap") {
  return apiFetch<ValorantMatch[]>(
    `/valorant/v4/matches/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=10`
  );
}
