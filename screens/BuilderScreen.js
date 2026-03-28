import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import colors from '../constants/colors';
import defaults from '../constants/defaults';
import ExerciseCard from '../components/ExerciseCard';
import { getCircuits, saveCircuit } from '../storage';

const initialState = {
  name: '',
  exercises: [],
  rounds: defaults.handOff.rounds,
  warmup: defaults.handOff.warmup,
  cooldown: defaults.handOff.cooldown,
  roundRest: defaults.handOff.roundRest,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.payload };
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [...state.exercises, { name: 'Nuovo esercizio', duration: 30, rest: 15 }],
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
  const [savedCircuits, setSavedCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCircuits = async () => {
    const existing = await getCircuits();
    setSavedCircuits(existing || []);
  };

  useEffect(() => {
    loadCircuits();
  }, []);

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
    const success = await saveCircuit({ ...state, updatedAt: new Date().toISOString() });
    setIsLoading(false);
    if (success) {
      Alert.alert('Salvato', 'Circuito salvato correttamente');
      loadCircuits();
    } else {
      Alert.alert('Errore', 'Impossibile salvare il circuito');
    }
  };

  const onLoadCircuit = (circuit) => {
    dispatch({ type: 'SET', payload: { ...circuit } });
  };

  return (
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
            value={String(state.rounds)}
            keyboardType="number-pad"
            onChangeText={(v) => dispatch({ type: 'SET', payload: { rounds: Math.max(1, Math.min(20, Number(v) || 1)) } })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Warm-up</Text>
          <TextInput
            style={styles.input}
            value={String(state.warmup)}
            keyboardType="number-pad"
            onChangeText={(v) => dispatch({ type: 'SET', payload: { warmup: Math.max(0, Math.min(60, Number(v) || 0)) } })}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Cool-down</Text>
          <TextInput
            style={styles.input}
            value={String(state.cooldown)}
            keyboardType="number-pad"
            onChangeText={(v) => dispatch({ type: 'SET', payload: { cooldown: Math.max(0, Math.min(120, Number(v) || 0)) } })}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Riposo round</Text>
          <TextInput
            style={styles.input}
            value={String(state.roundRest)}
            keyboardType="number-pad"
            onChangeText={(v) => dispatch({ type: 'SET', payload: { roundRest: Math.max(0, Math.min(120, Number(v) || 0)) } })}
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

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Durata totale stimata: {totalTime} secondi</Text>
        <Text style={styles.summaryText}>Numero esercizi: {state.exercises.length}</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSaveCircuit} disabled={isLoading}>
        <Text style={styles.saveButtonText}>{isLoading ? 'Salvataggio...' : 'Salva circuito'}</Text>
      </TouchableOpacity>

      <Text style={[styles.subTitle, { marginTop: 16 }]}>Circuiti salvati</Text>
      {savedCircuits.length === 0 ? <Text style={styles.empty}>Nessun circuito trovato</Text> : null}
      {savedCircuits.map((c) => (
        <TouchableOpacity key={c.id} style={styles.savedCard} onPress={() => onLoadCircuit(c)}>
          <Text style={styles.savedTitle}>{c.name || 'Circuito senza nome'}</Text>
          <Text style={styles.savedMeta}>{`Aggiornato: ${new Date(c.updatedAt || c.createdAt || '').toLocaleString()}`}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
});
