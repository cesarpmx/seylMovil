import { QREmbarque } from "../../../../domain/entities/almacen/embarque/QrEmbarque";
import { Item } from "../../../interfaces/almacen/embarque/qrEmbarque.response";

export class QrEmbarqueMapper {

    static qrEmbarqueToEntity( result:  Item): QREmbarque {


      /*
     "pemid": 46,
      "pemempid": 581,
      "pemalmid": "C1",
      "pemfeccarga": "2025-01-24T07:30:00Z",
      "proveedor": "22-PROVEDOS",
      "vehplacas": "BB01240",
      "chonombre": "chofer 3",
      "vehtveid": "CAM1.5",
      "pemruta": "BJ4223",
      "pemcoms": "333",
      "pemestatus": "A",
      "epenombre": "ASIGNADO",
      "pemtemid": "R",
      "temnombre": "REPARTOS"
      */

        return {

            pemid: result.pemid,
            proveedor:result.proveedor,
            pemempid:result.pemempid,
            pemalmid:result.pemalmid,
            pemfeccarga:result.pemfeccarga,
            vehplacas: result.vehplacas,
            chonombre: result.chonombre,
            vehtveid: result.vehtveid,
            pemruta: result.pemruta,
            pemcoms:result.pemcoms,
            pemestatus: result.pemestatus,
            epenombre:result.epenombre,
            pemtemid:result.pemtemid,
            temnombre:result.temnombre


            
            
            
        }
    }
}