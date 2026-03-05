import { EventoBitacoraAlmacen } from "../../../../domain/entities/almacen/bitacoraAlmacen/eventoBitacoraAlmacen";
import { Item } from "../../../interfaces/almacen/bitacoraAlmacen/eventoBitacoraAlmacen.response";

export class EventoBitacoraMapper {

    static eventosBitacoraToEntity( result:  Item): EventoBitacoraAlmacen {


    

        return {

            tevid: result.tevid,
            tevnombre:result.tevnombre,
            tevmodulo:result.tevmodulo,
            tevestatus:result.tevestatus,            
        }
    }
}