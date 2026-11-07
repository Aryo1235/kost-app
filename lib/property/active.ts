"use client";

import { useSyncExternalStore } from "react";

// Properti yang sedang dipilih di navbar. Disimpan di cookie hanya untuk tampilan.
// Server tetap memeriksa akses di setiap permintaan (AGENTS.md aturan 2).
export const ACTIVE_PROPERTY_COOKIE = "kost_property";
export type ActiveProperty = number | "all" | null;

const EVENT = "kost-active-property";

// Membaca nilai dari teks cookie. Nilai yang tidak dikenal menghasilkan null.
export function parseActiveProperty(raw: string | null | undefined): ActiveProperty {
  if (raw === undefined || raw === null || raw === "") return null;
  if (raw === "all") return "all";
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function setActiveProperty(value: Exclude<ActiveProperty, null>): void {
  document.cookie = `${ACTIVE_PROPERTY_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

function snapshot(): string {
  return readCookie(document.cookie, ACTIVE_PROPERTY_COOKIE) ?? "";
}

// Pilihan properti yang tersimpan. Sebelum hidrasi dianggap belum dipilih.
export function useActiveProperty(): ActiveProperty {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return parseActiveProperty(raw);
}
