import { CambioEstatus } from "../../../../domain/entities/almacen/movimientosInternos/cambioEstatus";
import { Item } from "../../../interfaces/almacen/movimientosInternos/cambioEstatus.response";

export class CambioEstatusMapper {

    static cambioEstatusToEntity( result:  Item): CambioEstatus {
      

        return {

            racid: result.racid,
            prdid: result.prdid,
            prdclave: result.prdclave,
            prdnombre: result.prdnombre,
            raclote: result.raclote,
            racfeccaducidad: result.racfeccaducidad,
            racubiid: result.racubiid,
            disponible: result.disponible,
            racineid: result.racineid,
            raccoms: result.raccoms
            
        }
    }
}