import { EstatusInventario } from "../../../../domain/entities/almacen/movimientosInternos/estatusInventario";
import { Item } from "../../../interfaces/almacen/movimientosInternos/estatusInventario.response";

export class EstatusInventarioMapper {

    static estatusInventarioToEntity( result:  Item): EstatusInventario {
      

        /* ineid:      string;
    inesurtido: string;
    ineventa:   string;
    ineestatus: string; */


        return {
            ineid: result.ineid,
            inesurtido:result.inesurtido,
            ineventa:result.ineventa,
            ineestatus:result.ineventa

        }
    }
}