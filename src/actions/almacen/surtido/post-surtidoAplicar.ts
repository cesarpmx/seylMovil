import {loginApi} from '../../../config/api/loginApi';

export interface SurtidoAplicarPayload {
  preid: number;
  idUsuario: string | number;
}

export interface SurtidoAplicarResponse {
  success: string | boolean;
  message?: string;
  id?: number; // id de la remisión generada
}

/**
 * POST al procedimiento REST_POST_APLICARPLMOVIL.
 * Endpoint: /almacen/surtirplmovil/  (mismo recurso que el GET; diferente método).
 * Cierra la orden de surtido (preestatus 'P' → 'S') y genera la remisión,
 * respetando lo que la app móvil escribió en dprsurtido (no auto-completa).
 * Payload mínimo: preid + idUsuario.
 */
export const postSurtidoAplicar = async (
  payload: SurtidoAplicarPayload,
): Promise<SurtidoAplicarResponse> => {
  const url = '/almacen/surtirplmovil/';
  try {
    console.log('[postSurtidoAplicar] POST', url);
    console.log('[postSurtidoAplicar] payload:', JSON.stringify(payload));

    const {data} = await loginApi.post<SurtidoAplicarResponse>(url, payload);
    console.log('[postSurtidoAplicar] response:', JSON.stringify(data));
    return data;
  } catch (error: any) {
    // Oracle regresa 212 con {success:"false", message:"..."} en errores
    // de validación; axios los trata como error → rescatamos el body.
    const resp = error?.response?.data;
    console.error('[postSurtidoAplicar] status:', error?.response?.status);
    console.error('[postSurtidoAplicar] body:', JSON.stringify(resp));
    if (resp && (resp.success !== undefined || resp.message)) {
      return resp as SurtidoAplicarResponse;
    }
    throw new Error(error?.message || 'Error al aplicar la orden.');
  }
};
