import React from 'react';
import { StyleSheet, ScrollView, ImageBackground } from 'react-native';
import backgroundImage from '../../../assets/inteligencia-artificial-en-almacenamiento-1038x686.jpeg';

export const HomeScreen = () => {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      imageStyle={styles.imageStyle}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>

      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  imageStyle: {
    resizeMode: 'cover',
    opacity: 0.4,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  welcomeText: {
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 20,
  },
  transparentLayout: {
    backgroundColor: 'transparent', 
  },
  actionButton: {
    marginVertical: 10,
    borderRadius: 8,
  },
});