import {loginApi} from '../../../config/api/loginApi';

export interface DetalleSurtidoItem {
  dprid: number;
  dprpreid: number;
  dprempid?: number;
  dpralmid?: string;
  dprmalid?: number | string;
  dprprdid: number;
  prdclave: string;
  prdnombre: string;
  prdualid: string;
  prdinner: number;
  dprcantidad: number;
  dprsurtido: number;
  dprfecha?: string;
  dprreferencia?: string | null;
  racid?: number;
  racineid?: string;
  racubiid?: string;
  racinicial?: number;
  racreal?: number;
  racreservado?: number;
  raclote?: string | null;
  racfeccaducidad?: string | null;
  racpedimento?: string | null;
  racptoentrada?: string | null;
  racfecimportacion?: string | null;
  raccoms?: string | null;
  inesurtido?: string;
  [key: string]: any;
}

/**
 * Trae el detalle de partidas de una orden/PL desde
 * /almacen/detpackinglist/?ordensurtido=<pl>&empresa=<emp>&almacen=<alm>.
 * Este endpoint ya viene ordenado por ubicación y sólo devuelve las partidas
 * con diferencia entre cantidad pedida y surtida (las que faltan por surtir).
 * También sirve como validación de existencia de la PL: si la orden no fue
 * creada para esa empresa/almacén, el backend devuelve items vacío.
 */
export const getDetalleSurtidoGrid = async (
  ordenSurtido: string | number,
  empresa?: string | number,
  almacen?: string,
): Promise<DetalleSurtidoItem[]> => {
  const q: string[] = [];
  q.push(`ordensurtido=${encodeURIComponent(String(ordenSurtido))}`);
  if (empresa !== undefined && empresa !== null && String(empresa) !== '') {
    q.push(`empresa=${encodeURIComponent(String(empresa))}`);
  }
  if (almacen) {
    q.push(`almacen=${encodeURIComponent(String(almacen))}`);
  }
  const url = `/almacen/detpackinglist/?${q.join('&')}`;
  console.log('[getDetalleSurtidoGrid] URL:', url);
  try {
    const {data} = await loginApi.get<any>(url);

    if (!data) return [];

    // Oracle APEX: { items: [...] }
    if (Array.isArray(data.items)) {
      return data.items.filter(
        (it: any) => it && it.dprid !== null && it.dprid !== undefined,
      ) as DetalleSurtidoItem[];
    }

    // Wrapper Java: { success, data: [...] }
    if (data.success && Array.isArray(data.data)) {
      return data.data as DetalleSurtidoItem[];
    }

    // Array directo
    if (Array.isArray(data)) return data as DetalleSurtidoItem[];

    return [];
  } catch (error: any) {
    console.error('[getDetalleSurtidoGrid] status:', error?.response?.status);
    console.error('[getDetalleSurtidoGrid] body:', JSON.stringify(error?.response?.data));
    console.error('[getDetalleSurtidoGrid] message:', error?.message);
    return [];
  }
};
