import { loginApi } from "../../../config/api/loginApi";


export const enviarBitacoraAlmacen = async (valores: any): Promise<any> => {
    try {
      const response = await loginApi.post('/almacen/bitacora/', valores);
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