import {Products} from '../../domain/entities/products';
import {Item} from '../interfaces/product.response';

export class ProductMapper {
  static productToEntity(item: Item): Products {
    return {
      totalrecs: item.totalrecs,
      prdid: item.prdid,
      prdclave: item.prdclave,
      prdupc: item.prdupc,
      prdclaveext: item.prdclaveext,
      prdnombre: item.prdnombre,
      prdempid: item.prdempid,
      prdestatus: item.prdestatus,
      prdlinid: item.prdlinid,
      plinombre: item.plinombre,
      prdfamid: item.prdfamid,
      pfanombre: item.pfanombre,
      prdtprid: item.prdtprid,
      ptinombre: item.ptinombre,
      prdinventario: item.prdinventario,
      prdventa: item.prdventa,
      prdcompuesto: item.prdcompuesto,
      prdcosto: item.prdcosto,
      prdmoncosto: item.prdmoncosto,
      prdprecio: item.prdprecio,
      prdmonprecio: item.prdmonprecio,
      prdualid: item.prdualid,
      ualnombre: item.ualnombre,
      prdinner: item.prdinner,
      prdpeso: item.prdpeso,
      prdunipeso: item.prdunipeso,
      prdvolumen: item.prdunipeso,
      prdunivol: item.prdunivol,
      prdopc1: item.prdopc1,
      prdopc2: item.prdopc2,
      prdopc3: item.prdopc3,
      prdopc4: item.prdopc4,
      prdopc5: item.prdopc5,
    };
  }
}
