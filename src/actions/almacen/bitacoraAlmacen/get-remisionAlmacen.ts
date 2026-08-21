import { loginApi } from '../../../config/api/loginApi';

export interface RemisionAlmacen {
  remid: number;
  remempid?: number;
  remalmid?: string;
  remmalid?: number | string;
  remfecdocto?: string | null;
  remreferencia1?: string | null;
  remreferencia2?: string | null;
  empresa?: string;
  almacen?: string;
}

/**
 * GET /almacen/remisionmovil/?empresa=&almacen=&clave=
 * Valida la existencia de una remisión filtrando por empresa y almacén.
 * Devuelve el header de la remisión, o null si no existe / no aplica.
 */
export const getRemisionAlmacen = async (
  clave: string,
  empresa: string | number,
  almacen: string,
): Promise<RemisionAlmacen | null> => {
  const q: string[] = [];
  q.push(`empresa=${encodeURIComponent(String(empresa))}`);
  q.push(`almacen=${encodeURIComponent(String(almacen))}`);
  q.push(`clave=${encodeURIComponent(clave)}`);
  const url = `/almacen/remisionmovil/?${q.join('&')}`;

  try {
    const { data } = await loginApi.get<any>(url);
    console.log('[getRemisionAlmacen] GET', url);
    console.log('[getRemisionAlmacen] raw response:', JSON.stringify(data));

    if (!data) return null;

    // Caso 1: { items: [{...}] } (Oracle APEX)
    if (Array.isArray(data.items) && data.items.length > 0) {
      const valido = data.items.find(
        (it: any) => it && it.remid !== null && it.remid !== undefined,
      );
      if (valido) return valido as RemisionAlmacen;
    }
    // Caso 2: { success: true, data: {...} }
    if (data.success && data.data) {
      const inner = data.data;
      if (Array.isArray(inner)) {
        return inner.length > 0 ? (inner[0] as RemisionAlmacen) : null;
      }
      if (inner.remid) return inner as RemisionAlmacen;
    }
    // Caso 3: objeto directo
    if (data.remid) return data as RemisionAlmacen;

    return null;
  } catch (error: any) {
    console.error('[getRemisionAlmacen] error status:', error?.response?.status);
    console.error('[getRemisionAlmacen] error body:', JSON.stringify(error?.response?.data));
    console.error('[getRemisionAlmacen] error message:', error?.message);
    return null;
  }
};
