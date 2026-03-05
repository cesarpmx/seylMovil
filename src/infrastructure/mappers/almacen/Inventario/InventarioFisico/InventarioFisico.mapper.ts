import {InventarioFisico} from '../../../../../domain/entities/almacen/InventarioFisico/InventarioFisico';
import {Item} from '../../../../interfaces/almacen/inventarioFisico/inventarioFisico.response';

export class InventarioFisicoMapper {
  static InventarioFisicoToEntity(result: Item): InventarioFisico {
    return {
      infid: result.infid,
      infempid: result.infempid,
      infalmid: result.infalmid,
      infineid: result.infineid,
      infracid: result.infracid,
      infubiid: result.infubiid,
      infprdid: result.infprdid,
      prdclave: result.prdclave,
      prdnombre: result.prdnombre,
      prdualid: result.prdualid,
      prdinner: result.prdinner,
      inflote: result.inflote,
      inffeccad: result.inffeccad,
      infuno: result.infuno,
      infdos: result.infdos,
      inftres: result.inftres,
      infaplicar: result.infaplicar,
      infestatus: result.infestatus,
      eifnombre: result.eifnombre,
    };
  }
}
