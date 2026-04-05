import React, { useMemo, useReducer, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import { DEFAULT_CIRCUIT, DEFAULT_EXERCISE } from '../constants/defaults';
import ExerciseCard from '../components/ExerciseCard';
import { setActiveCircuit } from '../storage';
import useWorkout from '../hooks/useWorkout';
import useEntitlements from '../hooks/useEntitlements';

const initialState = {
  name: '',
  exercises: [],
  rounds: DEFAULT_CIRCUIT.rounds,
  warmup: DEFAULT_CIRCUIT.warmup,
  cooldown: DEFAULT_CIRCUIT.cooldown,
  roundRest: DEFAULT_CIRCUIT.roundRest,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.payload };
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [...state.exercises, { ...DEFAULT_EXERCISE, name: 'Nuovo esercizio' }],
      };
    case 'UPDATE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map((item, i) => (i === action.index ? action.payload : item)),
      };
    case 'REMOVE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter((_, i) => i !== action.index),
      };
    case 'SWAP_EXERCISE': {
      const arr = [...state.exercises];
      const from = action.from;
      const to = action.to;
      [arr[from], arr[to]] = [arr[to], arr[from]];
      return { ...state, exercises: arr };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function BuilderScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [roundsText, setRoundsText] = useState(String(initialState.rounds));
  const [warmupText, setWarmupText] = useState(String(initialState.warmup));
  const [cooldownText, setCooldownText] = useState(String(initialState.cooldown));
  const [roundRestText, setRoundRestText] = useState(String(initialState.roundRest));
  const { circuits, addCircuit } = useWorkout();
  const { isPro } = useEntitlements();

  useEffect(() => {
    setRoundsText(String(state.rounds));
    setWarmupText(String(state.warmup));
    setCooldownText(String(state.cooldown));
    setRoundRestText(String(state.roundRest));
  }, [state.rounds, state.warmup, state.cooldown, state.roundRest]);

  const totalTime = useMemo(() => {
    const exerciseTotal = state.exercises.reduce((sum, cur) => sum + cur.duration + (cur.rest || 0), 0);
    const roundsTotal = exerciseTotal * state.rounds;
    return state.warmup + roundsTotal + state.roundRest * (state.rounds - 1) + state.cooldown;
  }, [state]);

  const onSaveCircuit = async () => {
    if (!state.name.trim()) {
      Alert.alert('Nome richiesto', 'Inserisci un nome per il circuito');
      return;
    }
    if (!state.exercises.length) {
      Alert.alert('Nessun esercizio', 'Aggiungi almeno un esercizio');
      return;
    }

    setIsLoading(true);
    const success = await addCircuit({ ...state, updatedAt: new Date().toISOString() });
    if (success) {
      await setActiveCircuit({ ...state, updatedAt: new Date().toISOString() });
      Alert.alert('Salvato', 'Circuito salvato e impostato come attivo');
    } else {
      Alert.alert('Errore', 'Impossibile salvare il circuito');
    }
    setIsLoading(false);
  };

  const onLoadCircuit = (circuit) => {
    dispatch({ type: 'SET', payload: { ...circuit } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Builder Circuito</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome circuito"
        placeholderTextColor={colors.textSecondary}
        value={state.name}
        onChangeText={(v) => dispatch({ type: 'SET', payload: { name: v } })}
      />

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Round</Text>
          <TextInput
            style={styles.input}
            value={roundsText}
            keyboardType="number-pad"
            onChangeText={setRoundsText}
            onBlur={() => {
              const value = roundsText.trim() ? Math.max(1, Math.min(20, Number(roundsText))) : 1;
              setRoundsText(String(value));
              dispatch({ type: 'SET', payload: { rounds: value } });
            }}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Warm-up</Text>
          <TextInput
            style={styles.input}
            value={warmupText}
            keyboardType="number-pad"
            onChangeText={setWarmupText}
            onBlur={() => {
              const value = warmupText.trim() ? Math.max(0, Math.min(60, Number(warmupText))) : 0;
              setWarmupText(String(value));
              dispatch({ type: 'SET', payload: { warmup: value } });
            }}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Cool-down</Text>
          <TextInput
            style={styles.input}
            value={cooldownText}
            keyboardType="number-pad"
            onChangeText={setCooldownText}
            onBlur={() => {
              const value = cooldownText.trim() ? Math.max(0, Math.min(120, Number(cooldownText))) : 0;
              setCooldownText(String(value));
              dispatch({ type: 'SET', payload: { cooldown: value } });
            }}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Riposo round</Text>
          <TextInput
            style={styles.input}
            value={roundRestText}
            keyboardType="number-pad"
            onChangeText={setRoundRestText}
            onBlur={() => {
              const value = roundRestText.trim() ? Math.max(0, Math.min(120, Number(roundRestText))) : 0;
              setRoundRestText(String(value));
              dispatch({ type: 'SET', payload: { roundRest: value } });
            }}
          />
        </View>
      </View>

      <Text style={[styles.subTitle, { marginTop: 16 }]}>Esercizi</Text>
      {state.exercises.map((item, index) => (
        <ExerciseCard
          key={`ex-${index}`}
          item={item}
          index={index}
          total={state.exercises.length}
          onChange={(idx, updated) => dispatch({ type: 'UPDATE_EXERCISE', index: idx, payload: updated })}
          onDelete={(idx) => dispatch({ type: 'REMOVE_EXERCISE', index: idx })}
          onMoveUp={(idx) => idx > 0 && dispatch({ type: 'SWAP_EXERCISE', from: idx, to: idx - 1 })}
          onMoveDown={(idx) => idx < state.exercises.length - 1 && dispatch({ type: 'SWAP_EXERCISE', from: idx, to: idx + 1 })}
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={() => dispatch({ type: 'ADD_EXERCISE' })}>
        <Text style={styles.buttonText}>Aggiungi esercizio</Text>
      </TouchableOpacity>

      <Text style={[styles.previewItem, { color: colors.text, fontWeight: 'bold', marginTop: 16 }]}>Durata totale stimata: {totalTime} secondi</Text>

      {!isPro && circuits.length >= 3 && (
        <Text style={styles.limitMessage}>Limite gratuito: 3 circuiti. Aggiorna a Pro per salvarne di più.</Text>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSaveCircuit}
        disabled={isLoading || (!isPro && circuits.length >= 3)}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Salvataggio...' : (!isPro && circuits.length >= 3) ? 'Limite raggiunto' : 'Salva circuito'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.subTitle, { marginTop: 16 }]}>Circuiti salvati</Text>
      {circuits.length === 0 ? <Text style={styles.empty}>Nessun circuito trovato</Text> : null}
      {circuits.map((c) => (
        <TouchableOpacity key={c.id} style={styles.savedCard} onPress={() => onLoadCircuit(c)}>
          <Text style={styles.savedTitle}>{c.name || 'Circuito senza nome'}</Text>
          <Text style={styles.savedMeta}>{`Aggiornato: ${new Date(c.updatedAt || c.createdAt || '').toLocaleString()}`}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.primary, fontSize: 22, fontWeight: '700', marginBottom: 10 },
  subTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  field: { flex: 1, marginRight: 8 },
  label: { color: colors.textSecondary, marginBottom: 4 },
  button: { backgroundColor: colors.accent, padding: 12, borderRadius: 10, marginVertical: 8 },
  buttonText: { color: '#000', textAlign: 'center', fontWeight: '700' },
  saveButton: { backgroundColor: colors.primary, padding: 14, borderRadius: 10, marginVertical: 8 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  summary: { marginTop: 12 },
  summaryText: { color: colors.textSecondary, marginBottom: 2 },
  empty: { color: colors.textSecondary, marginBottom: 8 },
  savedCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 10, borderRadius: 10, marginBottom: 6 },
  savedTitle: { color: colors.text, fontWeight: '700' },
  savedMeta: { color: colors.textSecondary, fontSize: 12 },
  limitMessage: { color: colors.error, textAlign: 'center', marginVertical: 8, fontWeight: '600' },

});
