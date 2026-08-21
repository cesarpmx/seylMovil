import axios from "axios";
import { loginApi } from "../../../config/api/loginApi";
import { QrReciboResponse } from "../../../infrastructure/interfaces/almacen/ingresos/qrRecibo.response";
import { QrReciboMapper } from "../../../infrastructure/mappers/almacen/ingresos/qrRecibo.mapper";


export const getQrRecibo = async (parametros: string) => {
    try {
      // OJO: no se debe URL-encode aquí porque el QR trae un query
      // string completo (?empresa=...&almacen=...&clave=...) que Oracle
      // interpreta como parámetros. Encodearlo rompía a 404.
      const url = `/almacen/qrrecibo/${parametros}`;

      console.log('[getQrRecibo] clave recibida:', JSON.stringify(parametros));
      console.log('[getQrRecibo] longitud:', parametros.length);
      console.log('[getQrRecibo] URL final:', url);

      const { data } = await loginApi.get<QrReciboResponse>(url);

      console.log('[getQrRecibo] items devueltos:', data?.items?.length ?? 0);

      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }

      return data.items.map((item) =>
        QrReciboMapper.qrReciboToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };

  export const enviarConfirmacionReciboQR = async (movimiento: any): Promise<any> => {
    try {
      const response = await loginApi.post('/almacen/qrrecibo/', movimiento);
      console.log('Movimiento enviado con éxito:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          console.error('Error en la respuesta del servidor:', error.response.data);
          throw new Error(error.response.data.message || 'Error al procesar la solicitud');
        } else if (error.request) {
          // No se recibió respuesta del servidor
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se pudo conectar con el servidor');
        }
      }
      // Otros errores no relacionados con Axios
      console.error('Error desconocido:', error);
      throw new Error('Error desconocido al enviar el movimiento');
    }
  };