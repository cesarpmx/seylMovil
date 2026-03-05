import axios from "axios";
import { loginApi } from "../../../config/api/loginApi";
import { InventarioFisicoResponse } from "../../../infrastructure/interfaces/almacen/inventarioFisico/inventarioFisico.response";
import { InventarioFisicoMapper } from "../../../infrastructure/mappers/almacen/Inventario/InventarioFisico/InventarioFisico.mapper";
import { InventarioFisicoIDPallet } from "../../../infrastructure/interfaces/almacen/inventarioFisico/inventarioIdPallet.response";
import { InventarioFisicoIdPalletMapper } from "../../../infrastructure/mappers/almacen/Inventario/InventarioFisico/InventarioFisicoIdPallet.mapper";
import { ProductoResponse } from "../../../infrastructure/interfaces/almacen/producto/producto.response";
import { ProductoMapper } from "../../../infrastructure/mappers/almacen/Inventario/producto/Producto.mapper";

export const getInventarioFisico = async (clave: string) => {
    try {
      const { data } = await loginApi.get<InventarioFisicoResponse>(
        `/almacen/invfisico/?clave=${clave}`
      );
  
      if (!data || !Array.isArray(data.items)) {
        console.error('Data does not contain items array:', data);
        throw new Error('Invalid response structure');
      }
  
      return data.items.map((item) =>
        InventarioFisicoMapper.InventarioFisicoToEntity(item)
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };

  export const getIdPallet = async (clave: string) => {
    try {
      const { data } = await loginApi.get<InventarioFisicoIDPallet>(
        `/almacen/idpallet/?clave=${clave}`
      );
  
       if (!data || !Array.isArray(data.items)) {
         console.error('Data does not contain items array:', data);
         throw new Error('Invalid response structure');
       }
       
       return data.items.map((item) =>
        InventarioFisicoIdPalletMapper.InventarioFisicoIdPalletToEntity(item)
       );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };

  export const getProductByClave = async (empresa: string,clave: string) => {
    try {
      const { data } = await loginApi.get<ProductoResponse>(
        `/ventas/productos/?empresa=${empresa}&estatus=A&clave=${clave}`
      );
  
       if (!data || !Array.isArray(data.items)) {
         console.error('Data does not contain items array:', data);
         throw new Error('Invalid response structure');
       }
       
       return data.items.map((item) =>
        ProductoMapper.InventarioProductoToEntity(item)
       );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error getting products');
    }
  };

  export const postInventario = async (valores: any): Promise<any> => {
    try {
      const response = await loginApi.post('/almacen/invfisico/', valores);
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
  