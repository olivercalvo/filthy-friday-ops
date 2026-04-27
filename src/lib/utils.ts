import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Capitaliza la primera letra. `toLocaleDateString('es-PA')` devuelve
// "viernes, 25 de abril" en minúsculas; el spec del Home pide la inicial
// en mayúscula.
export function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "2026-04-25" → "Viernes, 25 de abril" (formato del Home).
// Usa T12:00:00 para evitar que el offset de TZ haga retroceder un día.
export function formatEventDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return capitalizeFirst(
    d.toLocaleDateString("es-PA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
}

// Recorta la fracción de segundos de un `time` SQL ("13:30:00" → "13:30").
// Postgres devuelve los `time without time zone` en formato HH:MM:SS, pero
// para el UI sólo queremos HH:MM.
export function shortTime(t: string | null | undefined): string {
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
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
