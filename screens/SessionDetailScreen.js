import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { formatDuration } from '../utils/time';

export default function SessionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { session } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.backText}>Indietro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{session.circuitName || 'Sessione senza nome'}</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data inizio:</Text>
              <Text style={styles.detailValue}>{new Date(session.startedAt).toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Durata totale:</Text>
              <Text style={styles.detailValue}>{formatDuration(session.totalDuration)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Round completati:</Text>
              <Text style={styles.detailValue}>{session.roundsCompleted}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Completata:</Text>
              <Text style={[styles.detailValue, session.completed ? styles.completed : styles.notCompleted]}>
                {session.completed ? 'Sì' : 'No'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  completed: {
    color: colors.accent,
  },
  notCompleted: {
    color: colors.error,
  },
});