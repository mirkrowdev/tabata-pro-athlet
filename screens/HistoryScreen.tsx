import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import colors from '../constants/colors';
import useWorkout from '../hooks/useWorkout';
import { formatDuration } from '../utils/time';
import { Session } from '../storage';

export default function HistoryScreen() {
  const { sessions } = useWorkout();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Storico sessioni</Text>
        {sessions.length === 0 ? (
          <Text style={styles.empty}>Nessuna sessione registrata</Text>
        ) : (
          sessions
            .slice()
            .reverse()
            .map((session: Session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.card}
                onPress={() => navigation.navigate('SessionDetail', { session })}
              >
                <Text style={styles.circuitName}>{session.circuitName}</Text>
                <Text style={styles.field}>{`Inizio: ${new Date(session.startedAt).toLocaleString()}`}</Text>
                <Text style={styles.field}>{`Durata: ${formatDuration(session.totalDuration)}`}</Text>
                <Text style={styles.field}>{`Round completati: ${session.roundsCompleted}`}</Text>
                <Text style={styles.field}>{`Completata: ${session.completed ? 'Sì' : 'No'}`}</Text>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.primary, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  empty: { color: colors.textSecondary },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 10 },
  circuitName: { color: colors.accent, fontWeight: '700', marginBottom: 4 },
  field: { color: colors.text, fontSize: 13 },
});
