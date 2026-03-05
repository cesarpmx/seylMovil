import { ConsultaExistencia } from "../../../../domain/entities/almacen/consulta/consultaExistencia";
import { Item } from "../../../interfaces/almacen/consulta/consultaExistencia.response";

export class ConsultaExistencianMapper {

    static consultaExistenciaToEntity( result:  Item): ConsultaExistencia {


        /* racid:           number;
    raclote:         null;
    racfeccaducidad: null;
    racubiid:        string;
    disponible:      number;
    racprdid:        number;
    prdclave:        string;
    prdnombre:       string;
    prdualid:        string;
    prdinner:        number; */
      

        return {

            racid: result.racid,
            raclote: result.raclote,
            racfeccaducidad:result.racfeccaducidad,
            racubiid: result.racubiid,
            disponible: result.disponible,
            racprdid: result.racprdid,
            prdclave: result.prdclave,
            prdnombre: result.prdnombre,
            prdualid: result.prdualid,
            prdinner:result.prdinner,
            racreal: result.racreal,
            racreservado: result.racreservado,
            racineid:result.racineid

            
            
        }
    }
}