import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea un timestamp ISO en hora Panamá ("hh:mm a. m./p. m.") sin usar
// `Intl.DateTimeFormat`. La razón: Node y Chromium empaquetan versiones de
// ICU distintas y a veces emiten caracteres invisibles diferentes (NBSP vs
// NNBSP) entre la hora y el am/pm — mismo render visual, bytes distintos —
// lo que dispara hydration mismatch en SSR. Esta función es 100% string-only
// y por lo tanto determinística entre server y client.
//
// Acepta ISO con cualquier offset; si no trae offset asume UTC.
export function formatPanamaTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // -05:00 fijo para Panamá (no observa DST)
  const panamaMs = d.getTime() - 5 * 60 * 60 * 1000;
  const utc = new Date(panamaMs);
  const h24 = utc.getUTCHours();
  const min = utc.getUTCMinutes();
  const ampm = h24 >= 12 ? "p. m." : "a. m.";
  const h12 = h24 % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ampm}`;
}
