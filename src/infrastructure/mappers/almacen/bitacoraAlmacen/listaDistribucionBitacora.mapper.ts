
import { ListaDistribucionBitacoraAlmacen } from '../../../../domain/entities/almacen/bitacoraAlmacen/listaDistribucionBitacoraAlmacen';
import { Item } from '../../../interfaces/almacen/bitacoraAlmacen/listaDistribucionBitacoraAlmacen.response';

export class ListaDistribucionBitacoraMapper {

    static listaDistribucionBitacoraToEntity( result:  Item): ListaDistribucionBitacoraAlmacen {

        /*
        "eldid": 11,
      "eldempid": 600,
      "eldtevid": "A002",
      "tevnombre": "MATERIAL INCOMPLETO",
      "eldlistadist": "raysilvas181@gmail.com",
      "eldestatus": "A"
        */
    

        return {
            eldid:result.eldid,
            eldempid:result.eldempid,
            eldtevid: result.eldtevid,
            tevnombre:result.tevnombre,
            eldlistadist:result.eldlistadist,
            eldestatus:result.eldestatus

            
            


        }
    }
}