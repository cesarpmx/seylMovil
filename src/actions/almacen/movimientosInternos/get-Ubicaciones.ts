import { loginApi } from "../../../config/api/loginApi";
import { UbicacionResponse } from "../../../infrastructure/interfaces/almacen/movimientosInternos/ubicacion.response";
import { UbicacionMapper } from "../../../infrastructure/mappers/almacen/movimientosInternos/ubicacion.mapper";


export const getUbicacion = async (idEmpresa: string, idUbicacion: string) => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<UbicacionResponse>(
        `/configuracion/ubicaciones/?empresa=${idEmpresa}&ubicacion=${idUbicacion}`
      );

      console.log(`/configuracion/ubicaciones/?empresa=${idEmpresa}&ubicacion=${idUbicacion}`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        UbicacionMapper.ubicacionToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };