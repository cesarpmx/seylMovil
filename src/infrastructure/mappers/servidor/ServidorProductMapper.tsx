import {ItemServidor} from '../../../domain/entities/products';
import {Item} from '../../interfaces/servidor.response';

export class ServidorProductMapper {
  static ServidorToEntity(item: Item): ItemServidor {
    return {
      ecoid: item.ecoid,
      empresa: item.empresa,
      ecologo: item.ecologo,
      ecohost: item.ecohost,
      ecoport: item.ecoport,
      ecomail: item.ecomail,
      ecoauth: item.ecoauth,
      ecouser: item.ecouser,
      ecopassword: item.ecopassword,
      ecossl: item.ecossl,
    };
  }
}
