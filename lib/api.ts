"use client";

import { getInitData } from "@/lib/telegram-client";

const INIT_DATA_HEADER = "x-telegram-init-data";

export class FetchError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** initData header bilan JSON so'rov yuboradi */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const initData = getInitData();
  if (initData) headers.set(INIT_DATA_HEADER, initData);

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let message = "So'rovda xatolik";
    try {
      const body = await res.json();
      message = body?.error ?? message;
    } catch {
      /* noop */
    }
    throw new FetchError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
