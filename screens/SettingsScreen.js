import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Impostazioni</Text>
      <Text style={styles.item}>- Versione app: 1.0.0</Text>
      <Text style={styles.item}>- SDK Expo: 54</Text>
      <Text style={styles.item}>- Lingua: Italiano</Text>
      <Text style={styles.note}>Nella prossima fase implementeremo preferenze, reset storico e controllo audio.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.primary, fontSize: 22, fontWeight: '700', marginBottom: 16 },
  item: { color: colors.text, marginBottom: 10 },
  note: { color: colors.textSecondary, marginTop: 10 },
});
