import React from 'react';
import { Layout, Text, Button, Card } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

export const SettingScreen = () => {

  return (
    <Layout style={styles.container}>
      <Card style={styles.card} status="warning">
        <Text category="h4" style={styles.title}>
          ¡En Construcción!
        </Text>
        <Text style={styles.subtitle}>
          Esta funcionalidad estará disponible en próximas actualizaciones.
        </Text>
      </Card>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  card: {
    alignItems: 'center',
    padding: 20,
    width: '90%',
  },
  title: {
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#8F9BB3',
  },
  button: {
    marginTop: 20, 
    width: '100%', 
    maxWidth: 200, 
    alignSelf: 'center',
  },
});