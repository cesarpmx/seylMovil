import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text, Button, Card} from '@ui-kitten/components';
import {useAuthStore} from '../../store/modules/useModulesStore';

export const Product2Screen = () => {
  const {logout, usunombre, usumail} = useAuthStore();

  const user = {
    name: 'Juan Pérez',
    company: 'CIA.WMS',
    email: 'juan.perez@example.com',
  };

  const handlePasswordChange = () => {
    console.log('Cambio de contraseña');
  };

  return (
    <Layout style={styles.container}>
      {/* Tarjeta con información del usuario */}
      <Card style={styles.card}>
        <Text category="h5" style={styles.name}>
          {usunombre}
        </Text>
        {/* <Text appearance="hint" style={styles.text}>
          Empresa: {user.company}
        </Text> */}
        <Text appearance="hint" style={styles.text}>
          Correo: {usumail}
        </Text>
      </Card>

      {/* Botón para cambio de contraseña */}
      <Button style={styles.button} onPress={handlePasswordChange}>
        Cambiar contraseña
      </Button>

      {/* Botón para cerrar sesión */}
      <Button
        style={[styles.button, styles.logoutButton]}
        status="danger"
        onPress={logout}>
        Cerrar sesión
      </Button>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FC',
  },
  card: {
    padding: 20,
    borderRadius: 8,
  },
  name: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    marginBottom: 5,
    fontSize: 16,
  },
  button: {
    marginVertical: 10,
    borderRadius: 8,
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#FF3D71',
    borderColor: '#FF3D71',
  },
});
