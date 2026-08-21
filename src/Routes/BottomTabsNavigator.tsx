import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from '../presentation/screens/home/HomeScreen';
import {SettingScreen} from '../presentation/screens/home/SettingScreen';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Product2Screen} from '../presentation/screens/product/Product2Screen';
import {MyIcon} from '../presentation/components/ui/MyIcon';

const Tab = createBottomTabNavigator();

export const BottomTabsNavigator = ({navigation}) => {
  const screenOptions = ({route}) => ({
    headerLeft: () => {

      const menuScreens = ['Seyl-WMS', 'Usuario', 'Configuracion'];

      if (menuScreens.includes(route.name)) {
        return (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.iconContainer}>
            <MyIcon name="menu-outline" style={styles.icon} />
          </TouchableOpacity>
        );
      }

      return null; // Deja el comportamiento predeterminado
    },
    headerTitleAlign: 'center',
  });

  return (
    <Tab.Navigator screenOptions={screenOptions} >
      <Tab.Screen
        name="Seyl-WMS"
        component={HomeScreen}
        options={{
          tabBarIcon: ({size}) => (
            <MyIcon name="home-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Usuario"
        component={Product2Screen}
        options={{
          tabBarIcon: ({size}) => (
            <MyIcon name="person-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={SettingScreen}
        options={{
          tabBarIcon: ({size}) => (
            <MyIcon name="settings-outline" size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginLeft: 15,
  },
  icon: {
    fontSize: 24, 
    color: '#000', 
  },
});
