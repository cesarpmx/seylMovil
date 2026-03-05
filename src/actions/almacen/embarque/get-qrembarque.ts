import axios from "axios";
import { loginApi } from "../../../config/api/loginApi";
import { QREmbarqueResponse } from "../../../infrastructure/interfaces/almacen/embarque/qrEmbarque.response";
import { QrEmbarqueMapper } from "../../../infrastructure/mappers/almacen/embarque/qrEmbarque.mapper";


export const getQrEmbarque = async (parametros: string) => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<QREmbarqueResponse>(
        `/almacen/qrembarque/${parametros}`
      );

      console.log(`/almacen/qrembarque/${parametros}`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        QrEmbarqueMapper.qrEmbarqueToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };


  export const enviarConfirmacionEmbarqueQR = async (movimiento: any): Promise<any> => {
    try {
      const response = await loginApi.post('/almacen/qrembarque/', movimiento);
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