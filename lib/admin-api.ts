"use client";

export class AdminFetchError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/admin/login";
    throw new AdminFetchError(401, "Avtorizatsiya talab qilinadi");
  }

  if (!res.ok) {
    let message = "Xatolik";
    try {
      message = (await res.json())?.error ?? message;
    } catch {
      /* noop */
    }
    throw new AdminFetchError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(p: string) => request<T>(p, { method: "DELETE" }),
  upload: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ url: string }>("/api/admin/upload", {
      method: "POST",
      body: fd,
    });
  },
};
