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
import iconConfig from '../../assets/iconConfig';

type Module = {
  modnombre: string;
  modcontexto?: string;
  modicono?: string; // El nombre del ícono, como 'icn-usr'
  modulos?: Module[];
  subModulos?: Module[];
};

type Props = {
  modules: Module[];
  navigation: any; // Cambia a un tipo más específico si tienes configurado React Navigation correctamente
};

const CustomDrawerContent: React.FC<Props> = ({ modules, navigation }) => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const renderModules = (modules: Module[], indentLevel: number = 0) => {
    return modules.map((module) => {
      const hasChildren =
        (module.modulos && module.modulos.length > 0) ||
        (module.subModulos && module.subModulos.length > 0);

      // Obtén el ícono desde la configuración, si existe
      const iconSource = module.modicono ? iconConfig[module.modicono] : null;

      return (
        <View key={module.modnombre}>
          <TouchableOpacity
            onPress={() => {
              if (!hasChildren && module.modcontexto) {
                navigation.navigate(module.modcontexto);
              } else if (hasChildren) {
                toggleMenu(module.modnombre);
              }
            }}
            style={[
              styles.menuItem,
              { paddingLeft: 15 + indentLevel * 10 },
            ]}
          >
            {/* Renderiza el ícono del módulo si está disponible */}
            {iconSource && (
              <Image source={iconSource} style={styles.icon} />
            )}

            {/* Text del módulo */}
            <Text style={styles.menuText}>{module.modnombre}</Text>

            {/* Icono para expandir/cerrar menú */}
            {hasChildren && (
              <Icon
                name={
                  expandedMenus[module.modnombre]
                    ? 'arrow-ios-upward-outline'
                    : 'arrow-ios-downward-outline'
                }
                fill="rgba(0, 0, 0, 0.5)"
                style={styles.arrowIcon}
              />
            )}
          </TouchableOpacity>

          {/* Mostrar submenús si están expandidos */}
          {expandedMenus[module.modnombre] && hasChildren && (
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
    <DrawerContentScrollView>{renderModules(modules)}</DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  subMenu: {
    paddingLeft: 10,
  },
});


export default CustomDrawerContent;