import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../constants/colors';
import { getActiveCircuit } from '../storage';
import useWorkout from '../hooks/useWorkout';

export default function HomeScreen() {
  const [activeCircuit, setActiveCircuit] = useState(null);
  const { circuits, sessions } = useWorkout();

  useFocusEffect(
    React.useCallback(() => {
      const loadActive = async () => {
        const active = await getActiveCircuit();
        setActiveCircuit(active);
      };
      loadActive();
    }, [])
  );

  const lastSession = sessions && sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tabata Pro Athlete</Text>
      <Text style={styles.subtitle}>Benvenuto</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Circuito attivo</Text>
        <Text style={styles.cardValue}>{activeCircuit?.name || 'Nessun circuito impostato'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Circuiti salvati</Text>
        <Text style={styles.cardValue}>{circuits.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Ultima sessione</Text>
        {lastSession ? (
          <>
            <Text style={styles.cardValue}>{lastSession.circuitName || 'Sessione senza nome'}</Text>
            <Text style={styles.cardMeta}>Durata: {formatDuration(lastSession.totalDuration)}</Text>
            <Text style={styles.cardMeta}>Data: {new Date(lastSession.startedAt).toLocaleString()}</Text>
          </>
        ) : (
          <Text style={styles.cardValue}>Nessuna sessione ancora</Text>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Come iniziare</Text>
        <Text style={styles.infoText}>1. Usa la scheda <Text style={styles.bold}>Builder</Text> per creare il tuo circuito Tabata.</Text>
        <Text style={styles.infoText}>2. Vai su <Text style={styles.bold}>Workout</Text> per avviare l'allenamento con timer, voce e audio.</Text>
        <Text style={styles.infoText}>3. Consulta <Text style={styles.bold}>History</Text> per vedere tutte le tue sessioni salvate.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.primary, fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginBottom: 24 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  cardValue: { color: colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardMeta: { color: colors.textSecondary, fontSize: 12, marginBottom: 2 },
  infoSection: { marginTop: 24, padding: 16, backgroundColor: colors.surface, borderRadius: 12, borderColor: colors.border, borderWidth: 1 },
  infoTitle: { color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoText: { color: colors.text, fontSize: 14, marginBottom: 8, lineHeight: 20 },
  bold: { fontWeight: '700', color: colors.accent },
});
