import { loginApi } from "../../../config/api/loginApi";
import { ListaDistribucionBitacoraResponse } from '../../../infrastructure/interfaces/almacen/bitacoraAlmacen/listaDistribucionBitacoraAlmacen.response';
import { ListaDistribucionBitacoraMapper } from "../../../infrastructure/mappers/almacen/bitacoraAlmacen/listaDistribucionBitacora.mapper";


export const getListaDistribucionBitacora = async (empresa: string , clave: string ) => {
    try {
      // Construir la URL con el ID de pallet
      const { data } = await loginApi.get<ListaDistribucionBitacoraResponse>(
        `/configuracion/listdisteven/?clave=${clave}&empresa=${empresa}`
      );

      console.log(`/configuracion/listdisteven/?clave=${clave}&empresa=${empresa}`)
  
      // Validar y mapear los datos
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        ListaDistribucionBitacoraMapper.listaDistribucionBitacoraToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };


  

  