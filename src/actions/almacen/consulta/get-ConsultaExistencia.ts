import { loginApi } from "../../../config/api/loginApi";
import { ConsultaExistenciaResponse } from "../../../infrastructure/interfaces/almacen/consulta/consultaExistencia.response";
import { ConsultaExistencianMapper } from "../../../infrastructure/mappers/almacen/consulta/consultaExistencia.mapper";

export const getConsultaExistencia = async (empresa: string, idPallet: string, idUbicacion: string, idProducto: string) => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<ConsultaExistenciaResponse>(
        `/almacen/idpallet/?empresa=${empresa}&ubicacion=${idUbicacion}&clave=${idPallet}&idProducto=${idProducto}`
      );

      console.log(`/almacen/idpallet/?empresa=${empresa}&ubicacion=${idUbicacion}&clave=${idPallet}&idProducto=${idProducto}`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        ConsultaExistencianMapper.consultaExistenciaToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };