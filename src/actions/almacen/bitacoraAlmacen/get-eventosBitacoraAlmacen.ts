import { loginApi } from "../../../config/api/loginApi";
import { EventoBitacoraAlmacenResponse } from "../../../infrastructure/interfaces/almacen/bitacoraAlmacen/eventoBitacoraAlmacen.response";
import { EventoBitacoraMapper } from "../../../infrastructure/mappers/almacen/bitacoraAlmacen/eventoBitacora.mapper";


export const getEventosBitacoraAlmacen = async () => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<EventoBitacoraAlmacenResponse>(
        `/configuracion/eventos/?modulo=ALMACEN`
      );

      console.log(`load_cl/configuracion/eventos/?modulo=ALMACEN`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        EventoBitacoraMapper.eventosBitacoraToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };