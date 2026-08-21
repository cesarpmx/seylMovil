import React from 'react';
import {StyleSheet, ImageBackground, View} from 'react-native';
import backgroundImage from '../../../assets/inteligencia-artificial-en-almacenamiento-1038x686.jpeg';

export const HomeScreen = () => {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      imageStyle={styles.imageStyle}>
      <View style={styles.container} />
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
  container: {
    flex: 1,
    padding: 20,
  },
});
