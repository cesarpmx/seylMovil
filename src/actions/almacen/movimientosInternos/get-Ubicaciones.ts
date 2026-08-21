import { loginApi } from "../../../config/api/loginApi";
import { UbicacionResponse } from "../../../infrastructure/interfaces/almacen/movimientosInternos/ubicacion.response";
import { UbicacionMapper } from "../../../infrastructure/mappers/almacen/movimientosInternos/ubicacion.mapper";


export const getUbicacion = async (idAlmacen: string, idUbicacion: string) => {
    try {
      const ubi = (idUbicacion || '').toUpperCase();
      // Nuevo endpoint que sí hace búsqueda por prefijo (LIKE).
      const { data } = await loginApi.get<UbicacionResponse>(
        `/almacen/ubicacionesCmb/?almacen=${encodeURIComponent(idAlmacen)}&ubicacion=${encodeURIComponent(ubi)}`
      );

      console.log(`/almacen/ubicacionesCmb/?almacen=${idAlmacen}&ubicacion=${ubi}`)

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

// Endpoint legacy — búsqueda por empresa (se usa en ConsultaExistenciaScreen
// mientras no tenga selector de almacén).
export const getUbicacionByEmpresa = async (idEmpresa: string, idUbicacion: string) => {
    try {
      const ubi = (idUbicacion || '').toUpperCase();
      const { data } = await loginApi.get<UbicacionResponse>(
        `/configuracion/ubicaciones/?empresa=${encodeURIComponent(idEmpresa)}&ubicacion=${encodeURIComponent(ubi)}`
      );

      console.log(`/configuracion/ubicaciones/?empresa=${idEmpresa}&ubicacion=${ubi}`)
  
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