import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Icon } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import iconConfig from '../../assets/iconConfig';

type Module = {
  modnombre: string;
  modcontexto?: string;
  modicono?: string;
  modulos?: Module[];
  subModulos?: Module[];
};

type Props = {
  modules: Module[];
  navigation: any;
};

/* ============================================================================
 *  LÓGICA DE RESOLUCIÓN DE ICONOS (orden de prioridad)
 * ----------------------------------------------------------------------------
 *  Para cada módulo del menú se elige UN icono siguiendo este orden:
 *
 *    1) nameIconOverride[nombre_normalizado]
 *         → Icono "bonito" (Eva Icons) por NOMBRE del módulo. Tiene prioridad
 *           sobre lo que venga de la base, para dar apariencia consistente
 *           a las categorías conocidas (Almacén, Productos, Ingresos, etc.).
 *
 *    2) routeIconFallback[modcontexto]
 *         → Icono Eva asignado por RUTA para módulos hoja que ya tienen
 *           pantalla real (ver ScreenMapping en SideMenuNavigator.tsx).
 *           Se usa cuando el nombre no coincide con el override.
 *
 *    3) iconConfig[modicono]  (icono PNG que viene de la base de datos)
 *         → Se respeta el icono legacy si el módulo no cayó en 1) ni 2).
 *
 *    4) PARENT_FALLBACK_ICON ('folder-outline')
 *         → Genérico para módulos padre (agrupadores) sin nada de lo anterior.
 *
 *    5) Punto neutro (dot)
 *         → Cuando no aplica ninguno de los casos anteriores.
 * ==========================================================================*/

// (1) Overrides por NOMBRE — icono "bonito" para categorías conocidas.
//     Las llaves están en minúsculas y sin acentos (ver normalizeName()).
const nameIconOverride: Record<string, string> = {
  'almacen': 'archive-outline',
  'productos': 'cube-outline',
  'central de productos': 'grid-outline',
  'consultar existencia': 'search-outline',
  'movimientos internos': 'swap-outline',
  'cambio de ubicacion': 'pin-outline',
  'cambio de estatus': 'sync-outline',
  'ubicar envio': 'navigation-2-outline',
  'inventario': 'clipboard-outline',
  'inventario fisico': 'clipboard-outline',
  'bitacora de almacen': 'book-open-outline',
  'bitacora': 'book-open-outline',
  'tareas por usuario': 'people-outline',
  'ingresos': 'download-outline',
  'recibir producto': 'archive-outline',
  'verificar qr': 'checkmark-square-outline',
  'surtido': 'shopping-cart-outline',
  'surtir pl': 'shopping-cart-outline',
  'aplicar pl': 'checkmark-circle-2-outline',
  'embarque': 'car-outline',
  'inicio': 'home-outline',
  'home': 'home-outline',
  'configuracion': 'settings-2-outline',
  'usuario': 'person-outline',
  'usuarios': 'people-outline',
  'reportes': 'pie-chart-outline',
};

// (2) Iconos por RUTA para módulos hoja con pantalla real
//     (ver ScreenMapping en SideMenuNavigator.tsx).
const routeIconFallback: Record<string, string> = {
  '/home': 'home-outline',
  '/almacen/productos/central/': 'grid-outline',
  '/almacen/movinternos/cambioubicacion/': 'pin-outline',
  '/almacen/movinternos/cambioestatus/': 'sync-outline',
  '/almacen/movinternos/ubicarenvio/': 'navigation-2-outline',
  '/almacen/consulta/idpallet/': 'search-outline',
  '/almacen/inventariofisico/': 'clipboard-outline',
  '/almacen/ingreso/recibirproducto/': 'archive-outline',
  '/almacen/ingresos/verificarqr/': 'checkmark-square-outline',
  '/almacen/surtido/surtirpl/': 'shopping-cart-outline',
  '/almacen/surtido/aplicarpl/': 'checkmark-circle-2-outline',
  '/almacen/bitacora/': 'book-open-outline',
  '/almacen/embarque/verificarqr/': 'car-outline',
};

// (4) Icono genérico para padres sin resolución previa
const PARENT_FALLBACK_ICON = 'folder-outline';

// Normaliza nombre: minúsculas + sin acentos + espacios simples
const normalizeName = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const CustomDrawerContent: React.FC<Props> = ({ modules, navigation }) => {
  const insets = useSafeAreaInsets();
  // Comportamiento acordeón: solo un menú abierto por nivel de anidación.
  // La clave es el nivel (0 = raíz, 1 = hijos, ...) y el valor es el
  // nombre del módulo abierto en ese nivel (o null si ninguno).
  const [expandedByLevel, setExpandedByLevel] = useState<
    Record<number, string | null>
  >({});

  const toggleMenu = (menu: string, level: number) => {
    setExpandedByLevel(prev => {
      const next: Record<number, string | null> = {};
      // Conservamos solo los niveles superiores (padres del que se toca).
      for (const k of Object.keys(prev)) {
        const lvl = Number(k);
        if (lvl < level) next[lvl] = prev[lvl];
      }
      // Si el clicado ya estaba abierto → cerramos; si no → abrimos y
      // cerramos automáticamente cualquier hermano y descendientes.
      next[level] = prev[level] === menu ? null : menu;
      return next;
    });
  };

  const renderModules = (mods: Module[], indentLevel: number = 0) => {
    return mods.map(module => {
      const hasChildren =
        (module.modulos && module.modulos.length > 0) ||
        (module.subModulos && module.subModulos.length > 0);

      // --- Resolución del icono según la prioridad descrita arriba ---
      const nameKey = normalizeName(module.modnombre || '');
      const nameEvaIcon = nameIconOverride[nameKey]; // (1)
      const routeEvaIcon = module.modcontexto
        ? routeIconFallback[module.modcontexto]
        : undefined; // (2)
      const dbIconSource =
        module.modicono ? iconConfig[module.modicono] : null; // (3)

      // Elegimos el Eva icon si hay override por nombre o por ruta.
      const evaIconName = nameEvaIcon || routeEvaIcon || null;

      // Si NO hay eva icon y tampoco icono DB, usamos folder para padres.
      const parentFallback =
        !evaIconName && !dbIconSource && hasChildren
          ? PARENT_FALLBACK_ICON
          : null;

      const isExpanded = expandedByLevel[indentLevel] === module.modnombre;
      const isLeaf = !hasChildren && !!module.modcontexto;

      return (
        <View key={module.modnombre}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!hasChildren && module.modcontexto) {
                navigation.navigate(module.modcontexto);
              } else if (hasChildren) {
                toggleMenu(module.modnombre, indentLevel);
              }
            }}
            style={[
              styles.menuItem,
              indentLevel === 0 ? styles.menuItemRoot : styles.menuItemChild,
              { paddingLeft: 8 + indentLevel * 12 },
              isExpanded && indentLevel === 0 && styles.menuItemExpanded,
            ]}>
            <View style={styles.leftGroup}>
              <View
                style={[
                  styles.iconWrapper,
                  isLeaf && styles.iconWrapperLeaf,
                  hasChildren && styles.iconWrapperParent,
                ]}>
                {evaIconName ? (
                  // Icono Eva "bonito" (por nombre o por ruta)
                  <Icon
                    name={evaIconName}
                    fill={hasChildren ? '#1E3A8A' : '#334155'}
                    style={styles.iconEva}
                  />
                ) : dbIconSource ? (
                  // Icono PNG legacy que viene de la base de datos
                  <Image source={dbIconSource} style={styles.iconImg} />
                ) : parentFallback ? (
                  // Padre sin icono definido → folder genérico
                  <Icon
                    name={parentFallback}
                    fill="#1E3A8A"
                    style={styles.iconEva}
                  />
                ) : (
                  // Último recurso: punto neutro
                  <View style={styles.iconDot} />
                )}
              </View>

              <Text
                style={[
                  styles.menuText,
                  indentLevel === 0
                    ? styles.menuTextRoot
                    : styles.menuTextChild,
                ]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {module.modnombre}
              </Text>
            </View>

            {hasChildren && (
              <Icon
                name={
                  isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'
                }
                fill="#94A3B8"
                style={styles.arrowIcon}
              />
            )}
          </TouchableOpacity>

          {isExpanded && hasChildren && (
            <View style={styles.subMenu}>
              {module.modulos && renderModules(module.modulos, indentLevel + 1)}
              {module.subModulos &&
                renderModules(module.subModulos, indentLevel + 1)}
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <DrawerContentScrollView
      /* flexGrow:1 + marginTop:auto del footer = footer pegado al fondo
         aunque haya poco contenido, y desplazable cuando hay mucho. */
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 12 },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Header / Branding */}
      <View
        style={[
          styles.header,
          { paddingTop: 18 + Math.max(insets.top - 8, 0) },
        ]}>
        <View style={styles.logoCircle}>
          <Icon name="cube-outline" fill="#FFFFFF" style={styles.logoIcon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>Seyl WMS</Text>
          <Text style={styles.brandSubtitle}>Almacenes</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuContainer}>{renderModules(modules)}</View>

      {/* Footer pegado al fondo gracias a marginTop:'auto' */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>Seyl Almacenes</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 16,
    paddingBottom: 16,
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoIcon: { width: 24, height: 24 },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  brandSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 12,
    marginRight: 16,
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1.2,
    paddingLeft: 14,
    paddingRight: 16,
    marginBottom: 6,
  },

  menuContainer: { paddingLeft: 6, paddingRight: 8 },

  // Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  menuItemRoot: { backgroundColor: 'transparent' },
  menuItemChild: { backgroundColor: 'transparent' },
  menuItemExpanded: { backgroundColor: '#F1F5F9' },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  iconWrapperParent: { backgroundColor: '#EEF2FF' },
  iconWrapperLeaf: { backgroundColor: '#F8FAFC' },
  iconImg: { width: 18, height: 18, resizeMode: 'contain' },
  iconEva: { width: 18, height: 18 },
  iconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  menuText: { flex: 1, color: '#0F172A' },
  menuTextRoot: { fontSize: 14, fontWeight: '600' },
  menuTextChild: { fontSize: 13, fontWeight: '500', color: '#334155' },
  arrowIcon: { width: 18, height: 18 },

  subMenu: {
    marginLeft: 12,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    marginBottom: 4,
  },

  // Footer sticky al fondo
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default CustomDrawerContent;
