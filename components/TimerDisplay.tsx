import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

interface TimerDisplayProps {
  phase: string;
  seconds: number;
  round: number;
  totalRounds: number;
  exerciseName?: string;
}

export default function TimerDisplay({ phase, seconds, round, totalRounds, exerciseName }: TimerDisplayProps) {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.phase}>{phase}</Text>
      <Text style={styles.time}>{`${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`}</Text>
      <Text style={styles.sub}>{`Round ${round} / ${totalRounds}`}</Text>
      {exerciseName ? <Text style={styles.sub}>{exerciseName}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
  },
  phase: {
    color: colors.accent,
    fontSize: 18,
    marginVertical: 4,
  },
  time: {
    fontSize: 48,
    color: colors.text,
    fontWeight: '700',
  },
  sub: {
    color: colors.textSecondary,
    marginTop: 6,
  },
});
