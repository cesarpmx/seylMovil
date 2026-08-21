import {loginApi} from '../../../config/api/loginApi';

export interface DetRemisionProductoPayload {
  prdclave: string;
  prdid: string;
  dreprdid: string;
  prdnombre: string;
  prdualid: string;
  prdinner: string;
  racmonid: string;
  prdcosto: string;
  raccosto: string;
  drecantidad: string;
  racineid: string;
  drereferencia: string;
  racubiid: string;
  drelote: string;
  drefeccaducidad: string;
  racpedimento: string;
  racptoentrada: string;
  racfecimportacion: string;
  raccoms: string;
  dreusuid: string;
  dreempid: string;
  dreremid: string;
  drealmid: string;
  dremalid: string;
  drefecdocto: string;
  // opcionales que envía el front original
  dreid?: string;
  racid?: string;
  'idcmbproducto-inputEl'?: string;
}

export interface DetRemisionProductoResponse {
  success: string | boolean;
  message?: string;
}

export const postDetRemisionProducto = async (
  remid: string | number,
  payload: DetRemisionProductoPayload,
): Promise<DetRemisionProductoResponse> => {
  const url = `/almacen/detremisiones/?remision=${encodeURIComponent(String(remid))}`;
  try {
    const {data} = await loginApi.post<DetRemisionProductoResponse>(url, payload);
    console.log('[postDetRemisionProducto] POST', url);
    console.log('[postDetRemisionProducto] response:', JSON.stringify(data));
    return data;
  } catch (error: any) {
    console.error('[postDetRemisionProducto] error:', error?.message);
    console.error('[postDetRemisionProducto] body:', JSON.stringify(error?.response?.data));
    throw error;
  }
};
