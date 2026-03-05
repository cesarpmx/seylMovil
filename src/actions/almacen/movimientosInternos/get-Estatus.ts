import { loginApi } from '../../../config/api/loginApi';
import { EstatusInventarioResponse } from '../../../infrastructure/interfaces/almacen/movimientosInternos/estatusInventario.response';
import { EstatusInventarioMapper } from '../../../infrastructure/mappers/almacen/movimientosInternos/estatusInventario.mapper';
export const getEstatusInventario = async () => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<EstatusInventarioResponse>(
        `/configuracion/estinventario/`
      );

      console.log(`load_cl/configuracion/estinventario/?estatus=A`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        EstatusInventarioMapper.estatusInventarioToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };