import {Input, Layout, Text, Button} from '@ui-kitten/components';
import React, {useState} from 'react';
import {Alert, Image, ScrollView, useWindowDimensions} from 'react-native';
import {MyIcon} from '../../components/ui/MyIcon';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParams} from '../../navigation/StackNavigator';
import {useAuthStore} from '../../store/modules/useModulesStore';
import LogoSeyl from '../../../assets/SeylLogin.png';

interface Props extends StackScreenProps<RootStackParams, 'LoginScreen'> {}

export const LoginScreen = ({navigation}: Props) => {
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false)
  const {login} = useAuthStore();

  const onLogin = async () => {
    if (email.length === 0 || password.length === 0) {
      return;
    }
    setIsPosting(true)
    const wasSuccessful = await login(email, password);
    setIsPosting(false)

    if (wasSuccessful) {
      // Navegar a la pantalla principal
      navigation.replace('Main');
      return;
    }

    Alert.alert('Error', 'Usuario o Contraseña Incorrectos');
  };

  const {height} = useWindowDimensions();

  return (
    <Layout style={{flex: 1}}>
      <ScrollView style={{marginHorizontal: 40}}>
        <Layout style={{paddingTop: height * 0.18}}>
          <Layout
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Image
              source={LogoSeyl}
              style={{width: 260, height: 250}}
            />
          </Layout>

          <Text category="h3">Seyl-WMS</Text>
          <Text category="p2">Ingrese para continuar</Text>
        </Layout>

        {/* {Inputs} */}
        <Layout style={{marginTop: 20}}>
          <Input
            placeholder="Usuario"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            accessoryLeft={<MyIcon name={'email-outline'} />}
            style={{marginBottom: 10}}
          />

          <Input
            placeholder="Contraseña"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            accessoryLeft={<MyIcon name={'lock-outline'} />}
            style={{marginBottom: 10}}
          />
        </Layout>

        {/* {Space} */}
        <Layout style={{height: 10}} />

        {/* {Botton} */}
        <Layout>
          <Button
            accessoryRight={<MyIcon name="arrow-forward-outline" white />}
            onPress={onLogin}
            disabled={isPosting}
            // onPress={handleLogin}
          >
            Ingresar
          </Button>
          {/* {error ? <Text status="danger">{error}</Text> : null} */}
        </Layout>

      </ScrollView>
    </Layout>
  );
};