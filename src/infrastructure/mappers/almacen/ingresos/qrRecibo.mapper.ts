import { QrRecibo } from "../../../../domain/entities/almacen/ingresos/QrRecibo";
import { Item } from "../../../interfaces/almacen/ingresos/qrRecibo.response";

export class QrReciboMapper {

    static qrReciboToEntity( result:  Item): QrRecibo {


      /*
       prrid:       number;
    prrfeccita:  Date;
    prrlineatr:  string;
    prrplacas:   string;
    prrchofer:   string;
    prrtcaid:    string;
    prrcantidad: number;
    prrtveid:    string;
    prrualid:    string;
    prrdocid:    string;
    prrestatus:  string;
    eprnombre:   string;
      */

        return {

            prrid: result.prrid,
            prrempid:result.prrempid,
            prralmid:result.prralmid,
            prrfeccita:result.prrfeccita,
            prrhoracita:result.prrhoracita,
            prrlineatr:result.prrlineatr,
            prrplacas:result.prrplacas,
            prrchofer:result.prrchofer,
            prrtcaid:result.prrtcaid,
            prrcantidad:result.prrcantidad,
            prrtveid:result.prrtveid,
            prrualid:result.prrualid,
            prrdocid:result.prrdocid,
            prrestatus:result.prrestatus,
            eprnombre:result.eprnombre

            
            
            
        }
    }
}