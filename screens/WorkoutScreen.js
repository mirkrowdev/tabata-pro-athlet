import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import useWorkout from '../hooks/useWorkout';
import useTimer from '../hooks/useTimer';
import TimerDisplay from '../components/TimerDisplay';
import colors from '../constants/colors';

export default function WorkoutScreen() {
  const { circuits, addSession } = useWorkout();
  const [selectedCircuitId, setSelectedCircuitId] = useState(null);
  const [phase, setPhase] = useState('IDLE');
  const [progress, setProgress] = useState({ round: 1, index: 0 });

  const circuit = useMemo(() => circuits.find((c) => c.id === selectedCircuitId), [circuits, selectedCircuitId]);

  const onDone = async () => {
    const duration = circuit ? circuit.rounds * (circuit.exercises.reduce((sum, ex) => sum + ex.duration + ex.rest, 0)) : 0;
    await addSession({
      startedAt: new Date().toISOString(),
      totalDuration: duration,
      circuitName: circuit?.name || 'Non definito',
      roundsCompleted: circuit?.rounds || 0,
      completed: true,
    });
    Alert.alert('Sessione finita', 'Sessione registrata nello storico');
  };

  const { status, seconds, round, index, running, start, stop } = useTimer({
    circuit: circuit || { exercises: [], rounds: 1, warmup: 0, cooldown: 0, roundRest: 0 },
    onPhaseChange: (value) => {
      setPhase(value);
      setProgress((p) => ({ ...p, round: value === 'EXERCISE' ? p.round : p.round }));
    },
    onDone,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Workout</Text>

      <Text style={styles.label}>Circuito selezionato</Text>
      {circuits.length === 0 && <Text style={styles.sub}>Nessun circuito salvato. Vai su Builder per crearne uno.</Text>}
      {circuits.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.circuitItem, selectedCircuitId === c.id ? styles.circuitSelected : null]}
          onPress={() => setSelectedCircuitId(c.id)}
        >
          <Text style={styles.circuitText}>{c.name}</Text>
          <Text style={styles.circuitHint}>{`Esercizi: ${c.exercises.length}`}</Text>
        </TouchableOpacity>
      ))}

      <TimerDisplay
        phase={phase}
        seconds={seconds}
        round={round}
        totalRounds={circuit?.rounds || 1}
        exerciseName={circuit?.exercises?.[index]?.name}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.startButton} onPress={start} disabled={!circuit || running}>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButton} onPress={stop} disabled={!running}>
          <Text style={styles.stopText}>Stop</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.status}>Stato: {status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.primary, fontSize: 22, fontWeight: '700' },
  label: { color: colors.textSecondary, marginTop: 12 },
  sub: { color: colors.text, marginTop: 6 },
  circuitItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  circuitSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  circuitText: { color: colors.text, fontWeight: '600' },
  circuitHint: { color: colors.textSecondary, fontSize: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  startButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 10, width: '45%' },
  stopButton: { backgroundColor: colors.error, padding: 12, borderRadius: 10, width: '45%' },
  startText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  stopText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  status: { color: colors.textSecondary, marginTop: 12 },
});
