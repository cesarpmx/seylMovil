import React, {PropsWithChildren, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '../navigation/StackNavigator';
import {useAuthStore} from '../store/modules/useModulesStore';

export const AuthProvider = ({children}: PropsWithChildren) => {

  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const {status, checkAuthStatus} = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (status !== 'checking') {
      if (status === 'authenticated') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      }
    }
  }, [status, navigation]);

  return (
    <>{children}</>
  );
};
