import { loginApi } from '../../config/api/loginApi';

export interface PostProductoImagenPayload {
  pimprdid: string;
  pimimagen: string; // data:image/jpeg;base64,...
  // Si viene, el backend ACTUALIZA la imagen existente. Si no, INSERTA una nueva.
  pimid?: string;
  // idUsuario del usuario en sesión → backend valida permisos sobre el contexto.
  idUsuario: string | number;
}

export interface PostProductoImagenResponse {
  success: string | boolean;
  message?: string;
}

export const postProductoImagen = async (
  clave: string | number,
  payload: PostProductoImagenPayload,
): Promise<PostProductoImagenResponse> => {
  const url = `/archivos/productos/?clave=${encodeURIComponent(String(clave))}`;
  try {
    console.log('[postProductoImagen] POST', url);
    console.log('[postProductoImagen] payload (sin base64):', JSON.stringify({
      ...payload,
      pimimagen: `[base64 ${payload.pimimagen?.length ?? 0} chars]`,
    }));
    const response = await loginApi.post<PostProductoImagenResponse>(url, payload);
    console.log('[postProductoImagen] HTTP status:', response.status);
    console.log('[postProductoImagen] response body:', JSON.stringify(response.data));
    // Mapeo de códigos custom del PL/SQL para saber qué acceso nos dio el backend.
    // 200 → OK (update o insert exitoso)
    // 210 → idUsuario faltante / usuario inválido
    // 211 → sin permiso de UPDATE (acceso < 3)
    // 212 → sin permiso de INSERT (acceso < 2)
    // 201/202 → errores SQL
    const accesoDetectado =
      response.status === 200
        ? '≥ 2 (INSERT) o ≥ 3 (UPDATE)'
        : response.status === 211
        ? '< 3 (UPDATE denegado)'
        : response.status === 212
        ? '< 2 (INSERT denegado)'
        : response.status === 210
        ? 'idUsuario faltante/invalido'
        : 'desconocido';
    console.log('[postProductoImagen] 🔐 acceso detectado:', accesoDetectado);
    return response.data;
  } catch (error: any) {
    console.error('[postProductoImagen] error:', error?.message);
    console.error('[postProductoImagen] HTTP status:', error?.response?.status);
    console.error('[postProductoImagen] body:', JSON.stringify(error?.response?.data));
    throw error;
  }
};
