import React from 'react';
import {createStackNavigator, StackCardStyleInterpolator} from '@react-navigation/stack';
import {LoadingScreen} from '../screens/loading/LoadingScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {ProductScreen} from '../screens/product/ProductScreen';
import { SideMenuNavigator } from '../../Routes/SideMenuNavigator';
import { SettingScreen } from '../screens/home/SettingScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { BottomTabsNavigator } from '../../Routes/BottomTabsNavigator';

export type RootStackParams = {
  LoadingScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  Main: undefined; // Aquí usamos el SideMenuNavigator
  ProductScreen: {productId: string};
};

const Stack = createStackNavigator<RootStackParams>();

const fadeAnimation: StackCardStyleInterpolator = ({current}) => {
  return {
    cardStyle: {
      opacity: current.progress,
    },
  };
};

export const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />

      <Stack.Screen
        options={{cardStyleInterpolator: fadeAnimation}}
        name="LoginScreen"
        component={LoginScreen}
      />

      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

      <Stack.Screen name="Main" component={SideMenuNavigator} /> 

      <Stack.Screen name="HomeScreen" component={HomeScreen} />

      <Stack.Screen name="SettingScreen" component={SettingScreen} />

      <Stack.Screen name="BottomTabsNavigator" component={BottomTabsNavigator} />

    </Stack.Navigator>
  );
};
