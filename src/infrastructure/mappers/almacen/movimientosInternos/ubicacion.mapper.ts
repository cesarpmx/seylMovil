import { Ubicacion } from "../../../../domain/entities/almacen/movimientosInternos/ubicacion";
import { Item } from "../../../interfaces/almacen/movimientosInternos/ubicacion.response";

export class UbicacionMapper {

    static ubicacionToEntity( result:  Item): Ubicacion {

        /*
        totalrecs: number | null;
    ubiid: null | string;
    ubialmid: null | string;
    ubiprioridad: number | null;
    ubinivel: number | null;
    ubiestatus: null | string;
        
        */
      

        return {
            totalrecs:result.totalrecs,
            ubiid:result.ubiid,
            ubialmid:result.ubialmid,
            ubiprioridad:result.ubiprioridad,
            ubinivel: result.ubinivel,
            ubiestatus:result.ubiestatus
        }
    }
}