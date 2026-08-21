import {loginApi} from '../../../config/api/loginApi';

export interface SurtirPlMovilItem {
  dprid: number;
  dprpreid: number;
  dprempid: number;
  dpralmid: string;
  prdclave: string;
  prdnombre: string;
  dprcantidad: number;
  dprsurtido: number;
  [key: string]: any;
}

/**
 * GET /almacen/surtirplmovil/?ordensurtido=&empresa=&almacen=
 * Devuelve las partidas de una PL para validar si puede aplicarse.
 * Se usa solo como validación de existencia: si el arreglo viene
 * con items → la PL existe para ese contexto; si viene vacío → no.
 */
export const getSurtirPlMovil = async (
  ordenSurtido: string | number,
  empresa?: string | number,
  almacen?: string,
): Promise<SurtirPlMovilItem[]> => {
  const q: string[] = [];
  q.push(`ordensurtido=${encodeURIComponent(String(ordenSurtido))}`);
  if (empresa !== undefined && empresa !== null && String(empresa) !== '') {
    q.push(`empresa=${encodeURIComponent(String(empresa))}`);
  }
  if (almacen) {
    q.push(`almacen=${encodeURIComponent(String(almacen))}`);
  }
  const url = `/almacen/surtirplmovil/?${q.join('&')}`;
  console.log('[getSurtirPlMovil] URL:', url);

  try {
    const {data} = await loginApi.get<any>(url);
    if (!data) return [];

    if (Array.isArray(data.items)) {
      return data.items as SurtirPlMovilItem[];
    }
    if (data.success && Array.isArray(data.data)) {
      return data.data as SurtirPlMovilItem[];
    }
    if (Array.isArray(data)) return data as SurtirPlMovilItem[];
    return [];
  } catch (error: any) {
    console.error('[getSurtirPlMovil] status:', error?.response?.status);
    console.error('[getSurtirPlMovil] body:', JSON.stringify(error?.response?.data));
    console.error('[getSurtirPlMovil] message:', error?.message);
    return [];
  }
};
