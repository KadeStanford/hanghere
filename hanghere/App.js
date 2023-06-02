import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';

const loadFonts = async () => {
  await Font.loadAsync({
    'BowlbyOneSC-Regular': require('./fonts/BowlbyOneSC-Regular.ttf'),
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAppFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };

    loadAppFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Render null or a loading screen while fonts are being loaded
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>HangHere</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a149e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'BowlbyOneSC-Regular',
    fontSize: 30,
    marginTop: -700,
    color: '#ffffff',
  },
});
