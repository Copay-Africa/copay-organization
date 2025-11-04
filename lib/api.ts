/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

export async function postJson<T = any>(url: string, body: unknown, token?: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // non-json response
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    const error: any = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
