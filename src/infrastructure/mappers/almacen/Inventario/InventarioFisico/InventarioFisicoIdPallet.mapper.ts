import { InventarioFisicoIdPallet } from "../../../../../domain/entities/almacen/InventarioFisico/InventarioFisicoIdPallet";
import { Item } from "../../../../interfaces/almacen/inventarioFisico/inventarioIdPallet.response";

export class InventarioFisicoIdPalletMapper {
  static InventarioFisicoIdPalletToEntity(result: Item): InventarioFisicoIdPallet {
    return {
        racid:           result.racid,
        raclote:         result.raclote,
        racfeccaducidad: result.racfeccaducidad,
        racubiid:        result.racubiid,
        disponible:      result.disponible,
        racprdid:        result.racprdid,
        prdclave:        result.prdclave,
        prdnombre:       result.prdnombre,
        prdualid:        result.prdualid,
        prdinner:        result.prdinner,
        racreal:         result.racreal,
        racreservado:    result.racreservado,
    };
  }
}
