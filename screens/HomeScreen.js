import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../constants/colors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tabata Pro Athlete</Text>
      <Text style={styles.text}>Benvenuto! usa le schede in basso per costruire e avviare i tuoi circuiti Tabata.</Text>
      <Text style={styles.text}>Fase 1: Builder per creare il circuito.</Text>
      <Text style={styles.text}>Fase 2: Workout per gestire il timer e la voce/audio.</Text>
      <Text style={styles.text}>Fase 3: History per vedere record e sessioni salvate.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  text: { color: colors.text, marginBottom: 10, lineHeight: 22 },
});
