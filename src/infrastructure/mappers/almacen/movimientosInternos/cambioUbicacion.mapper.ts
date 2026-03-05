import type { Item } from "../../../interfaces/almacen/movimientosInternos/cambioUbicacion.response";
import { CambioUbicacion } from '../../../../domain/entities/almacen/movimientosInternos/CambioUbicacion';


export class CambioUbicacionMapper {

    static cambioUbicacionToEntity( result:  Item): CambioUbicacion {
      

        return {
            racid: result.racid,
            prdid: result.prdid,
            prdclave: result.prdclave,
            prdnombre: result.prdnombre,
            raclote: result.raclote,
            racfeccaducidad: result.racfeccaducidad,
            racubiid: result.racubiid,
            disponible: result.disponible,
            racineid: result.racineid
            
        }
    }
}