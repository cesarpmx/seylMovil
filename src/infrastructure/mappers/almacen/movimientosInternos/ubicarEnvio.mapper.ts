import { UbicarEnvio } from "../../../../domain/entities/almacen/movimientosInternos/UbicarEnvio";
import { Item } from "../../../interfaces/almacen/movimientosInternos/ubicarEnvio.response";

export class UbicarEnvioMapper {

    static ubicarEnvioToEntity( result:  Item): UbicarEnvio {


      /*
       "embid": 4129171,
      "embempid": 207,
      "empnombre": "3M",
      "embref1": 2990751,
      "embref2": "42045",
      "embcajas": 27,
      "clinombre": "PROCTER & GAMBLE MANUFACTURING",
      "embfecrec": "2025-02-19T06:00:00Z",
      "embfeccita": null,
      "destino": "LERMA, ESTADO DE MEXICO"
      */

        return {

            embid: result.embid,
            embempid: result.embempid,
            empnombre: result.empnombre,
            embref1: result.embref1,
            embref2: result.embref2,
            embcajas:result.embcajas,
            clinombre:result.clinombre,
            embfecrec: result.embfecrec,
            embfeccita:result.embfeccita,
            destino:result.destino,
            embubicacion:result.embubicacion

            
            
            
        }
    }
}