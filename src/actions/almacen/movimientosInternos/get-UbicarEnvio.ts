import axios from "axios";
import { loginApi } from "../../../config/api/loginApi";
import { UbicarEnvioResponse } from "../../../infrastructure/interfaces/almacen/movimientosInternos/ubicarEnvio.response";
import { UbicarEnvioMapper } from "../../../infrastructure/mappers/almacen/movimientosInternos/ubicarEnvio.mapper";

export const getUbicarEnvio = async (clave: String) => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<UbicarEnvioResponse>(
        `/almacen/ubicarenvio/?clave=${clave}`
      );

      console.log(`/almacen/ubicarenvio/?clave=${clave}`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        UbicarEnvioMapper.ubicarEnvioToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };

  export const enviaUbicarEnvio = async (movimiento: any): Promise<any> => {
    try {
      const response = await loginApi.post('/almacen/ubicarenvio/', movimiento);
      console.log('Movimiento enviado con éxito:', response.data);

      // Asegurar que response.data siempre existe y tiene los valores esperados
      return response.data ?? { success: "false", message: "Respuesta vacía del servidor" };
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error en la respuesta del servidor:', error.response.data);
          throw new Error(error.response.data.message || 'Error al procesar la solicitud');
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor:', error.request);
          throw new Error('No se pudo conectar con el servidor');
        }
      }
      console.error('Error desconocido:', error);
      throw new Error('Error desconocido al enviar el movimiento');
    }
};
