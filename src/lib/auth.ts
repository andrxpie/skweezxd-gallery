import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

export function isAdminConfigured(): boolean {
  return Boolean(adminPassword());
}

/**
 * Порівняння сталої тривалості: звичайне === завершується на першому різному
 * символі й тим підказує, скільки початкових символів пароля вгадано.
 */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function sign(expiresAt: number, key: string): string {
  return createHmac("sha256", key).update(String(expiresAt)).digest("hex");
}

export function verifyPassword(candidate: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  return safeEqual(candidate, password);
}

export async function createSession(): Promise<void> {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD не налаштований");

  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const store = await cookies();

  store.set(COOKIE_NAME, `${expiresAt}.${sign(expiresAt, password)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;

  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const separator = raw.indexOf(".");
  if (separator === -1) return false;

  const expiresAt = Number(raw.slice(0, separator));
  const signature = raw.slice(separator + 1);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return safeEqual(signature, sign(expiresAt, password));
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Немає доступу. Увійди в адмінку ще раз.");
  }
}
