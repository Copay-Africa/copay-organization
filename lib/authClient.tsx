"use client";
import Cookies from "js-cookie";

const TOKEN_KEY = "copay_org_token";
const COOP_KEY = "copay_org_cooperative";

export type LoginBody = {
    phone: string;
    pin: string;
};

export type LoginResponse = {
    accessToken: string;
    expiresIn?: number;
    user?: Record<string, unknown>;
};

export async function loginRequest(body: LoginBody) {
    const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
    const url = base ? `${base.replace(/\/$/, "")}/auth/login` : `/api/v1/auth/login`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const msg = payload?.message || `Login failed: ${res.status}`;
        throw new Error(msg);
    }

    const data = (await res.json()) as LoginResponse;
    return data;
}

export function saveToken(token: string, opts?: { expiresDays?: number }) {
    const days = opts?.expiresDays ?? 7;
    Cookies.set(TOKEN_KEY, token, { expires: days, sameSite: "lax" });
}

export function saveCooperativeId(id: string) {
    if (!id) return;
    // store cooperative id in a non-httpOnly cookie so middleware and client can access it
    Cookies.set(COOP_KEY, id, { sameSite: "lax" });
}

export function getCooperativeId(): string | undefined {
    return Cookies.get(COOP_KEY);
}

export function clearCooperativeId() {
    Cookies.remove(COOP_KEY);
}

export function saveAuth(resp: LoginResponse) {
    if (!resp) return;
    if (resp.accessToken) saveToken(resp.accessToken, { expiresDays: Math.ceil((resp.expiresIn ?? 604800) / (60 * 60 * 24)) });
    // user object shape is dynamic; allow indexing here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coop = (resp.user as any)?.cooperativeId ?? (resp.user as any)?.cooperative?.id;
    if (coop) saveCooperativeId(coop);
}

export function clearToken() {
    Cookies.remove(TOKEN_KEY);
}

export function getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
}
