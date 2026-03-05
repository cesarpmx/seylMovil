import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {ProductScreen} from '../presentation/screens/product/ProductScreen';
import {HomeScreen} from '../presentation/screens/home/HomeScreen';
import {useAuthStore} from '../presentation/store/modules/useModulesStore';
import CustomDrawerContent from '../presentation/components/CustomDrawerContent';
import { CambioUbicacionScreen } from '../presentation/screens/almacen/movimientosInternos/CambioUbicacionScreen';
import { BottomTabsNavigator } from './BottomTabsNavigator';
import { InventarioFisicoScreen } from '../presentation/screens/almacen/inventario/InventarioFisicoScreen';
import { ConsultaExistenciaScreen } from '../presentation/screens/almacen/consulta/ConsultaExistenciaScreen';
import { CambioEstatusScreen } from '../presentation/screens/almacen/movimientosInternos/CambioEstatusScreen';
import { VerificadorScreen } from '../presentation/screens/embarque/VerificadorScreen';
import { IngresoProductoScreen } from '../presentation/screens/almacen/ingresos/IngresoProductoScreen';
import { SurtidoPlScreen } from '../presentation/screens/almacen/surtido/SurtidoPlScreen';
import { BitacoraAlmacenScreen } from '../presentation/screens/almacen/bitacora/BitacoraAlmacenScreen';
import { VerificadorEmbarqueScreen } from '../presentation/screens/embarque/VerificadorEmbarqueScreen';
import { UbicarEnvioScreen } from '../presentation/screens/almacen/movimientosInternos/UbicarEnvioScreen';

const Drawer = createDrawerNavigator();

const ScreenMapping = {
  '/home': HomeScreen,
  '/almacen/productos/central/': ProductScreen, // Aquí asignas las vistas a las rutas del JSON
  '/almacen/movinternos/cambioubicacion/': CambioUbicacionScreen,
  '/almacen/movinternos/cambioestatus/': CambioEstatusScreen,
  '/almacen/consulta/idpallet/': ConsultaExistenciaScreen,
  '/almacen/inventariofisico/': InventarioFisicoScreen,
  //'/almacen/embarque/verificarqr/': VerificadorScreen,
  '/almacen/ingreso/recibirproducto/': IngresoProductoScreen,
  '/almacen/surtido/surtirpl/': SurtidoPlScreen,
  '/almacen/ingresos/verificarqr/': VerificadorScreen,
  '/almacen/bitacora/': BitacoraAlmacenScreen,
  '/almacen/embarque/verificarqr/':VerificadorEmbarqueScreen,
  '/almacen/movinternos/ubicarenvio/':UbicarEnvioScreen,

};

export const SideMenuNavigator = () => {

  const {modules} = useAuthStore();

  return (
    <Drawer.Navigator
      drawerContent={props => (
        <CustomDrawerContent {...props} modules={modules} />
      )}
      screenOptions={{
        drawerType: 'slide',
        headerShown: false, 
        drawerStyle: {
          backgroundColor: '#fff',
          width: 240,
        },
      }}>

<Drawer.Screen
        name="Tabs"
        component={BottomTabsNavigator}
        options={{ title: 'Navegación de Tabs' }}
      />
        
      {Object.entries(ScreenMapping).map(([route, component]) => (
        <Drawer.Screen
          key={route}
          name={route}
          component={component}
          options={{title: route}}
        />
      ))}
    </Drawer.Navigator>
  );
};