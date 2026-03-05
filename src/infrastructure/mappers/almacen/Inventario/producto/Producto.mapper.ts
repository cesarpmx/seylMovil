import { InventarioProducto } from "../../../../../domain/entities/almacen/producto/InventarioProducto";
import { Item } from "../../../../interfaces/almacen/producto/producto.response";

export class ProductoMapper {
  static InventarioProductoToEntity(result: Item): InventarioProducto {
    return {
        prdid:         result.prdid,
        prdclave:      result.prdclave,
        prdnombre:     result.prdnombre,
        prdualid:      result.prdualid,
        prdinner:      result.prdinner,
        prdmoncosto:   result.prdmoncosto,
        prdcosto:      result.prdcosto,
        prdinventario: result.prdinventario,
        precio:        result.precio,
    };
  }
}
