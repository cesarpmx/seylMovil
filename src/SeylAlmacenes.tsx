import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StackNavigator} from './presentation/navigation/StackNavigator';
import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {useColorScheme} from 'react-native';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {AuthProvider} from './presentation/providers/AuthProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useAuthStore} from './presentation/store/modules/useModulesStore';
import {initAuthConfig} from './config/api/authMode';

export const SeylAlmacenes = () => {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? eva.dark : eva.light;
  const backgroudColor =
    colorScheme === 'dark'
      ? theme['color-basic-800']
      : theme['color-basic-100'];
  const {checkAuthStatus} = useAuthStore();

  useEffect(() => {
    (async () => {
      await initAuthConfig();
      await checkAuthStatus();
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={theme}>
        <NavigationContainer
          theme={{
            dark: theme === 'dark',
            colors: {
              primary: theme['color-primary-500'],
              background: backgroudColor,
              card: theme['color-basic-100'],
              text: theme['text-basic-100'],
              border: theme['color-basic-800'],
              notification: theme['color-primary-800'],
            },
            fonts: {
              regular: {
                fontFamily: 'System',
                fontWeight: 'normal',
              },
              medium: {
                fontFamily: 'System',
                fontWeight: '500',
              },
              bold: {
                fontFamily: 'System',
                fontWeight: '700',
              },
              heavy: {
                fontFamily: 'System',
                fontWeight: '900',
              },
            },
          }}>
          <AuthProvider>
            <StackNavigator />
          </AuthProvider>
        </NavigationContainer>
      </ApplicationProvider>
    </QueryClientProvider>
  );
};
