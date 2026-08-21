import {loginApi} from '../../../config/api/loginApi';

export interface DetalleSurtidoHeader {
  preid: number;
  preempid?: number;
  prealmid?: string;
  premalid?: string | number;
  precliid?: number;
  precenid?: number;
  clinombre?: string;
  censucursal?: string;
  concepto?: string;
  prefecha?: string;
  prefecdocto?: string | null;
  prefecsurtido?: string | null;
  prefecentrega?: string | null;
  preref1?: string | null;
  preref2?: string | null;
  precoms?: string | null;
  preestatus?: string;
  esunombre?: string;
  empresa?: string;
  almacen?: string;
  [key: string]: any;
}

/**
 * Valida si una orden/PL existe consultando /almacen/surtido/?clave=<pl>.
 * Devuelve el header de la orden si existe, o null si no encontró nada.
 */
// Devuelve el header SOLO si su preid coincide (como string) con el clave
// solicitado. Evita que Oracle nos entregue un registro "default" cuando el
// clave no existe.
const matchClave = (item: any, clave: string): boolean => {
  if (!item || item.preid === null || item.preid === undefined) return false;
  return String(item.preid).trim() === clave.trim();
};

export const getDetalleSurtido = async (
  clave: string,
): Promise<DetalleSurtidoHeader | null> => {
  const url = `/almacen/surtido/?clave=${encodeURIComponent(clave)}`;
  try {
    const {data} = await loginApi.get<any>(url);

    if (!data) return null;

    // Caso 1: { items: [{...}] } (Oracle APEX)
    if (Array.isArray(data.items) && data.items.length > 0) {
      const valido = data.items.find((it: any) => matchClave(it, clave));
      if (valido) return valido as DetalleSurtidoHeader;
      return null;
    }

    // Caso 2: { success: true, data: {...} }  (wrapper Java)
    if (data.success && data.data) {
      const inner = data.data;
      if (Array.isArray(inner)) {
        const v = inner.find((it: any) => matchClave(it, clave));
        return v ? (v as DetalleSurtidoHeader) : null;
      }
      if (matchClave(inner, clave)) return inner as DetalleSurtidoHeader;
      return null;
    }

    // Caso 3: objeto directo { preid: X, ... }
    if (matchClave(data, clave)) return data as DetalleSurtidoHeader;

    return null;
  } catch (error: any) {
    console.error('[getDetalleSurtido] status:', error?.response?.status);
    console.error('[getDetalleSurtido] body:', JSON.stringify(error?.response?.data));
    console.error('[getDetalleSurtido] message:', error?.message);
    return null;
  }
};
