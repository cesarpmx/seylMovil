import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Button,
  Input,
  Layout,
  Text,
  Toggle,
  TopNavigation,
  TopNavigationAction,
  Divider,
} from '@ui-kitten/components';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParams} from '../../navigation/StackNavigator';
import {MyIcon} from '../../components/ui/MyIcon';
import {
  AuthMode,
  BasicAuthConfig,
  BearerAuthConfig,
  getAuthMode,
  getBasicConfig,
  getBearerConfig,
  setAuthMode,
  setBasicConfig,
  setBearerConfig,
} from '../../../config/api/authMode';
import {clearAccessToken} from '../../../config/api/oauthToken';
import {useAuthStore} from '../../store/modules/useModulesStore';

interface Props extends StackScreenProps<RootStackParams, 'ConfigScreen'> {}

export const ConfigScreen = ({navigation}: Props) => {
  const [authMode, setAuthModeState] = useState<AuthMode>(getAuthMode());
  const [basic, setBasic] = useState<BasicAuthConfig>(getBasicConfig());
  const [bearer, setBearer] = useState<BearerAuthConfig>(getBearerConfig());
  const [isSavingConn, setIsSavingConn] = useState(false);

  const {logout} = useAuthStore();

  useEffect(() => {
    setAuthModeState(getAuthMode());
    setBasic(getBasicConfig());
    setBearer(getBearerConfig());
  }, []);

  const updateBasic = <K extends keyof BasicAuthConfig>(
    key: K,
    value: BasicAuthConfig[K],
  ) => {
    setBasic(prev => ({...prev, [key]: value}));
  };

  const updateBearer = <K extends keyof BearerAuthConfig>(
    key: K,
    value: BearerAuthConfig[K],
  ) => {
    setBearer(prev => ({...prev, [key]: value}));
  };

  const onChangeMode = (useBearer: boolean) => {
    const nextMode: AuthMode = useBearer ? 'bearer' : 'basic';
    setAuthModeState(nextMode);
  };

  const onSaveConnection = async () => {
    if (authMode === 'basic') {
      if (!basic.apiUrl.trim() || !basic.username.trim() || !basic.password) {
        Alert.alert(
          'Datos incompletos',
          'Completa API URL, usuario y contraseña.',
        );
        return;
      }
    } else {
      if (
        !bearer.oauthTokenUrl.trim() ||
        !bearer.apiHostUrl.trim() ||
        !bearer.clientId.trim() ||
        !bearer.clientSecret
      ) {
        Alert.alert(
          'Datos incompletos',
          'Completa OAuth Token URL, API Host URL, Client ID y Client Secret.',
        );
        return;
      }
    }

    Alert.alert(
      'Guardar conexión',
      'Se guardará la nueva configuración y se cerrará la sesión actual. ¿Continuar?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Aceptar',
          style: 'destructive',
          onPress: async () => {
            setIsSavingConn(true);
            try {
              await setAuthMode(authMode);
              if (authMode === 'basic') {
                await setBasicConfig(basic);
              } else {
                await setBearerConfig(bearer);
              }
              clearAccessToken();
              await logout();
              navigation.reset({
                index: 0,
                routes: [{name: 'LoginScreen'}],
              });
            } catch {
              Alert.alert('Error', 'No se pudo guardar la conexión.');
            } finally {
              setIsSavingConn(false);
            }
          },
        },
      ],
    );
  };

  const BackAction = () => (
    <TopNavigationAction
      icon={<MyIcon name="arrow-back-outline" />}
      onPress={() => navigation.goBack()}
    />
  );

  return (
    <SafeAreaView style={{flex: 1}} edges={['top']}>
      <Layout style={{flex: 1}}>
        <TopNavigation
          title={() => (
            <Text category="h6" style={styles.headerTitle}>
              Configuración
            </Text>
          )}
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />

        <ScrollView contentContainerStyle={styles.container}>
          <Text category="s1" style={styles.sectionTitle}>
            Modo de autenticación
          </Text>
          <View style={styles.authRow}>
            <View style={{flex: 1}}>
              <Text category="s2" style={{fontWeight: '600'}}>
                {authMode === 'bearer' ? 'Bearer Token' : 'Basic Auth'}
              </Text>
              <Text appearance="hint" category="c1">
                {authMode === 'bearer'
                  ? 'Oracle Cloud (OAuth client_credentials).'
                  : 'Usuario y contraseña.'}
              </Text>
            </View>
            <Toggle checked={authMode === 'bearer'} onChange={onChangeMode}>
              {authMode === 'bearer' ? 'Bearer' : 'Basic'}
            </Toggle>
          </View>

          <Text category="s1" style={[styles.sectionTitle, {marginTop: 24}]}>
            Conexión
          </Text>

          {authMode === 'basic' ? (
            <>
              <Field label="API URL:">
                <Input
                  value={basic.apiUrl}
                  onChangeText={t => updateBasic('apiUrl', t)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="https://tenant.com/apps/..."
                  size="small"
                  numberOfLines={1}
                  multiline={false}
                  textStyle={styles.inputText}
                />
              </Field>
              <Field label="Usuario:">
                <Input
                  value={basic.username}
                  onChangeText={t => updateBasic('username', t)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="small"
                />
              </Field>
              <Field label="Contraseña:">
                <Input
                  value={basic.password}
                  onChangeText={t => updateBasic('password', t)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="small"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="OAuth Token URL:">
                <Input
                  value={bearer.oauthTokenUrl}
                  onChangeText={t => updateBearer('oauthTokenUrl', t)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="https://....oraclecloudapps.com/ords/.../oauth/token"
                  size="small"
                  numberOfLines={1}
                  multiline={false}
                  textStyle={styles.inputText}
                />
              </Field>
              <Field label="API Host URL:">
                <Input
                  value={bearer.apiHostUrl}
                  onChangeText={t => updateBearer('apiHostUrl', t)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="https://....oraclecloudapps.com/ords/"
                  size="small"
                  numberOfLines={1}
                  multiline={false}
                  textStyle={styles.inputText}
                />
              </Field>
              <Field label="Client ID:">
                <Input
                  value={bearer.clientId}
                  onChangeText={t => updateBearer('clientId', t)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="small"
                />
              </Field>
              <Field label="Client Secret:">
                <Input
                  value={bearer.clientSecret}
                  onChangeText={t => updateBearer('clientSecret', t)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="small"
                />
              </Field>
            </>
          )}

          <View style={styles.actions}>
            <Button onPress={onSaveConnection} disabled={isSavingConn}>
              Guardar conexión
            </Button>
          </View>
          <Text appearance="hint" category="c1" style={styles.authHint}>
            Al guardar se cerrará la sesión actual.
          </Text>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <View style={styles.field}>
    <Text style={styles.label} category="s2">
      {label}
    </Text>
    <View style={styles.control}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: 'bold',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    width: 140,
    paddingRight: 12,
    fontWeight: '600',
  },
  control: {
    flex: 1,
  },
  actions: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  authHint: {
    marginTop: 8,
  },
  inputText: {
    minHeight: 0,
  },

  // === Status card (estado de conexión actual) ===
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  statusCardBearer: {
    backgroundColor: '#ECFEFF',
    borderColor: '#5EEAD4',
    shadowColor: '#0F766E',
  },
  statusCardBasic: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    shadowColor: '#1D4ED8',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  statusIconWrapBearer: {
    backgroundColor: '#0F766E',
    shadowColor: '#0F766E',
  },
  statusIconWrapBasic: {
    backgroundColor: '#1D4ED8',
    shadowColor: '#1D4ED8',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusDotBearer: {
    backgroundColor: '#0F766E',
  },
  statusDotBasic: {
    backgroundColor: '#1D4ED8',
  },
  statusPillLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statusHint: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  statusHostBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
  },
  statusHost: {
    fontSize: 11,
    color: '#334155',
    fontFamily: 'Courier',
    flex: 1,
    fontWeight: '600',
  },
});
