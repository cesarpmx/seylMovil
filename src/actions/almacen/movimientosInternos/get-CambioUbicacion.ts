import axios from "axios";
import { loginApi } from "../../../config/api/loginApi";
import { CambioUbicacion } from '../../../domain/entities/almacen/movimientosInternos/cambioUbicacion';
import { CambioUbicacionResponse } from "../../../infrastructure/interfaces/almacen/movimientosInternos/cambioUbicacion.response";
import { AuthResponse } from "../../../infrastructure/interfaces/auth.responses";
import { CambioUbicacionMapper } from "../../../infrastructure/mappers/almacen/movimientosInternos/cambioUbicacion.mapper";


export const getCambioUbicacion = async (empresa: String, almacen:String, idPallet: string, idUbicacion: string, idProducto: string) => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<CambioUbicacionResponse>(
        `/almacen/cambioubicacion/?empresa=${empresa}&almacen=${almacen}&ubicacion=${idUbicacion}&idpallet=${idPallet}&producto=${idProducto}`
      );

      console.log(`/almacen/cambioubicacion/?empresa=600&almacen=C1&ubicacion=${idUbicacion}&idpallet=${idPallet}&producto=${idProducto}`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        CambioUbicacionMapper.cambioUbicacionToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };
  

  export const enviarMovimiento = async (movimiento: any): Promise<any> => {
    try {
      const response = await loginApi.post('/almacen/cambioubicacion/', movimiento);
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
  
  
  
  