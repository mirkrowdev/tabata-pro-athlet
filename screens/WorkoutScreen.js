import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveCircuit } from '../storage';
import { useKeepAwake } from 'expo-keep-awake';
import useTimer from '../hooks/useTimer';
import useWorkout from '../hooks/useWorkout';

const { width } = Dimensions.get('window');

const phaseColors = {
  IDLE: '#666',
  WARMUP: '#BA7517',
  EXERCISE: '#e63946',
  REST: '#1D9E75',
  ROUND_REST: '#BA7517',
  COOLDOWN: '#BA7517',
  DONE: '#666',
};

const phaseLabels = {
  IDLE: 'PRONTO',
  WARMUP: 'PREPARATI',
  EXERCISE: 'ESERCIZIO',
  REST: 'RECUPERO',
  ROUND_REST: 'PAUSA ROUND',
  COOLDOWN: 'OTTIMO LAVORO',
  DONE: 'FINITO',
};

export default function WorkoutScreen() {
  const [circuit, setCircuit] = useState(null);
  const [status, setStatus] = useState('IDLE');
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const onDoneRef = useRef();

  const { addSession } = useWorkout();

  useKeepAwake();

  useFocusEffect(
    React.useCallback(() => {
      const loadActive = async () => {
        const active = await getActiveCircuit();
        setCircuit(active);
      };
      loadActive();
    }, [])
  );

  const {
    seconds,
    currentStep,
    running,
    paused,
    start,
    stop,
    togglePause,
    nextStep: nextStepData,
  } = useTimer({
    circuit,
    onPhaseChange: (phaseType) => setStatus(phaseType),
    onDone: () => onDoneRef.current?.(),
  });

  useEffect(() => {
    if (running && !paused) {
      setElapsedSeconds(prev => prev + 1);
    }
  }, [seconds, running, paused]);

  const handleDone = async () => {
    const duration = startTimestamp ? Math.floor((new Date() - startTimestamp) / 1000) : 0;
    await addSession({
      startedAt: startTimestamp?.toISOString(),
      totalDuration: duration,
      circuitName: circuit?.name || 'Non definito',
      roundsCompleted: circuit?.rounds || 0,
      completed: true,
    });
    Alert.alert('Sessione completata', 'Sessione salvata in storico.');
    setStatus('DONE');
  };

  onDoneRef.current = handleDone;

  const totalDuration = useMemo(() => {
    if (!circuit) return 0;
    const exerciseTotal = circuit.exercises.reduce((sum, ex) => sum + ex.duration + ex.rest, 0);
    return circuit.warmup + exerciseTotal * circuit.rounds + circuit.roundRest * (circuit.rounds - 1) + circuit.cooldown;
  }, [circuit]);

  const progressPercent = useMemo(() => {
    if (totalDuration === 0) return 0;
    return Math.min(100, Math.max(0, (elapsedSeconds / totalDuration) * 100));
  }, [elapsedSeconds, totalDuration]);

  if (!circuit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
        <View style={styles.container}>
        <Text style={styles.noCircuit}>Nessun circuito attivo. Vai su Builder per crearne uno.</Text>
      </View>
      </SafeAreaView>
    );
  }

  if (status === 'DONE') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
        <View style={styles.container}>
        <Text style={styles.doneTitle}>Sessione completata!</Text>
        <Text style={styles.doneText}>Durata totale: {totalDuration} secondi (stimato)</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => setStatus('IDLE')}>
          <Text style={styles.doneButtonText}>Chiudi</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  const nextUpText = (() => {
    if (!nextStepData) return 'Fine allenamento';
    if (nextStepData.type === 'EXERCISE') return nextStepData.name || 'Esercizio';
    if (nextStepData.type === 'REST') return 'Recupero';
    if (nextStepData.type === 'ROUND_REST') return 'Pausa round';
    if (nextStepData.type === 'COOLDOWN') return 'Cool down';
    return '...';
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLeft}>{circuit.name}</Text>
        <Text style={styles.headerRight}>{phaseLabels[status] || status}</Text>
      </View>

      <View style={[styles.phaseBadge, { backgroundColor: phaseColors[status] || '#444' }]}>
        <Text style={styles.phaseText}>{phaseLabels[status] || status}</Text>
      </View>

      <Text style={styles.exerciseName}>{currentStep?.name || (status === 'IDLE' ? 'Pronto' : status)}</Text>
      <Text style={styles.subtitle}>{currentStep?.type === 'EXERCISE' ? `Esercizio ${currentStep.index + 1} di ${circuit.exercises.length} · Round ${currentStep.round}/${circuit.rounds}` : ''}</Text>

      <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progressPercent}%` }]} /></View>

      <View style={[styles.timerCircle, { borderColor: phaseColors[status] || '#666' }]}>
        <Text style={styles.timerText}>{seconds}</Text>
        <Text style={styles.timerLabel}>sec</Text>
      </View>

      <View style={styles.bipDots}>{Array.from({ length: 10 }, (_, i) => i < (seconds <= 10 ? 10 - seconds : 0)).map((active, i) => (<View key={i} style={[styles.dot, active && styles.dotActive]} />))}</View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={stop}>
          <Text style={styles.controlText}>■</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.playButton]} onPress={() => {
          if (!running) {
            setStartTimestamp(new Date());
            start();
          } else {
            togglePause();
          }
        }}>
          <Text style={styles.controlText}>{running ? (paused ? '▶' : '⏸') : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={stop}>
          <Text style={styles.controlText}>⏭</Text>
          {/* TODO: implement skip functionality instead of stop */}
        </TouchableOpacity>
      </View>

      <View style={styles.nextUp}>
        <Text style={styles.nextLabel}>PROSSIMO</Text>
        <Text style={styles.nextText}>{nextUpText}</Text>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  noCircuit: { color: '#fff', textAlign: 'center', marginTop: 100 },
  doneTitle: { color: '#fff', fontSize: 24, textAlign: 'center', marginTop: 100 },
  doneText: { color: '#666', textAlign: 'center', marginTop: 20 },
  doneButton: { backgroundColor: '#e63946', padding: 12, borderRadius: 8, marginTop: 20, alignSelf: 'center' },
  doneButtonText: { color: '#fff', fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerLeft: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerRight: { color: '#666', fontSize: 14 },
  phaseBadge: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 20 },
  phaseText: { color: '#fff', fontWeight: 'bold' },
  exerciseName: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  subtitle: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 8 },
  progressBar: { height: 2, backgroundColor: '#1a1a1a', marginTop: 20, width: '100%' },
  progressFill: { height: 2, backgroundColor: '#e63946' },
  timerCircle: { width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, borderWidth: 4, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  timerText: { color: '#fff', fontSize: 56, fontWeight: 'bold', fontFamily: 'monospace' },
  timerLabel: { color: '#666', fontSize: 14, marginTop: 4 },
  bipDots: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a1a1a', marginHorizontal: 2 },
  dotActive: { backgroundColor: '#e63946' },
  controls: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  controlButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  playButton: { backgroundColor: '#e63946', width: 80, height: 80, borderRadius: 40 },
  controlText: { color: '#fff', fontSize: 20 },
  nextUp: { backgroundColor: '#151515', padding: 16, borderRadius: 8, marginTop: 40 },
  nextLabel: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  nextText: { color: '#fff', fontSize: 16, marginTop: 4 },
});
