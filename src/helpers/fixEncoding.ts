/**
 * Corrige texto que llegó en UTF-8 pero fue decodificado como Latin-1
 * (mojibake tipo "ubicaciÃ³n" -> "ubicación").
 */
export const fixEncoding = (str: string | undefined | null): string => {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
};
