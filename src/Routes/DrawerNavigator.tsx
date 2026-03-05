import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from '@ui-kitten/components';
import { HomeScreen } from '../presentation/screens/home/HomeScreen';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" fill={color} width={size} height={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Product"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="box-outline" fill={color} width={size} height={size} />
          ),
        }}
      />
      
    </Drawer.Navigator>
  );
};