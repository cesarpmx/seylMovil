import {ProductImage64} from '../../../../../domain/entities/products';
import {Item} from '../../../../interfaces/almacen/producto/productImage.response';

export class ImagenProductMapper {
  static productImageToEntity(item: Item): ProductImage64 {
    return {
      pimid: item.pimid,
      pimprdid: item.pimprdid,
      pimimagen: item.pimimagen,
    };
  }
}