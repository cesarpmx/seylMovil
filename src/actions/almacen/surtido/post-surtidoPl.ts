import {loginApi} from '../../../config/api/loginApi';

export interface SurtidoPlPayload {
  dprid: number;
  cantidad: number;
  dprempid: number | string;
  dpralmid: string;
  idUsuario: string | number;
}

export interface SurtidoPlResponse {
  success: string | boolean;
  message?: string;
  dprid?: number;
  surtido?: number;
  cantidad?: number;
  pendiente?: number;
}

/**
 * POST al procedimiento REST_POST_SURTIDOPL.
 * Endpoint: /almacen/detpackinglist/  (ORDS resource dedicado a ejecutar
 * el procedimiento de surtido — NO el AutoREST de la tabla detsurtido).
 * Registra una cantidad surtida sobre una partida específica (dprid).
 */
export const postSurtidoPl = async (
  payload: SurtidoPlPayload,
): Promise<SurtidoPlResponse> => {
  const url = '/almacen/detpackinglist/';
  try {
    console.log('[postSurtidoPl] POST', url);
    console.log('[postSurtidoPl] payload:', JSON.stringify(payload));

    const {data} = await loginApi.post<SurtidoPlResponse>(url, payload);
    console.log('[postSurtidoPl] response:', JSON.stringify(data));
    return data;
  } catch (error: any) {
    // Oracle devuelve 212 con { success:"false", message:"..." } en fallos de validación,
    // pero axios los trata como error → intentamos rescatar el body.
    const resp = error?.response?.data;
    console.error('[postSurtidoPl] status:', error?.response?.status);
    console.error('[postSurtidoPl] body:', JSON.stringify(resp));
    if (resp && (resp.success !== undefined || resp.message)) {
      return resp as SurtidoPlResponse;
    }
    throw new Error(error?.message || 'Error al enviar el surtido.');
  }
};
