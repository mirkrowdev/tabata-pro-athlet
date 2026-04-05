import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function ExerciseCard({ item, index, onChange, onDelete, onMoveUp, onMoveDown, total }) {
  const [durationText, setDurationText] = useState(String(item.duration));
  const [restText, setRestText] = useState(String(item.rest));

  useEffect(() => {
    setDurationText(String(item.duration));
    setRestText(String(item.rest));
  }, [item.duration, item.rest]);
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Esercizio {index + 1}</Text>
      <TextInput
        style={styles.input}
        value={item.name}
        placeholder="Nome esercizio"
        placeholderTextColor={colors.textSecondary}
        onChangeText={(v) => onChange(index, { ...item, name: v })}
      />
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Durata (s)</Text>
          <TextInput
            style={styles.input}
            value={durationText}
            keyboardType="number-pad"
            onChangeText={setDurationText}
            onBlur={() => {
              const value = durationText.trim() ? Math.max(1, Math.min(300, Number(durationText))) : 1;
              setDurationText(String(value));
              onChange(index, { ...item, duration: value });
            }}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Recupero (s)</Text>
          <TextInput
            style={styles.input}
            value={restText}
            keyboardType="number-pad"
            onChangeText={setRestText}
            onBlur={() => {
              const value = restText.trim() ? Math.max(0, Math.min(120, Number(restText))) : 0;
              setRestText(String(value));
              onChange(index, { ...item, rest: value });
            }}
          />
        </View>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onMoveUp(index)} disabled={index === 0}>
          <Text style={styles.actionText}>Su</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onMoveDown(index)} disabled={index === total - 1}>
          <Text style={styles.actionText}>Giù</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.delete]} onPress={() => onDelete(index)}>
          <Text style={styles.actionText}>Elimina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  header: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  field: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
  },
  delete: {
    backgroundColor: colors.error,
    marginRight: 0,
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
  },
});
