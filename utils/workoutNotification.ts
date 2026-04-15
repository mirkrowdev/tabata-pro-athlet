import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';

export async function setupNotifications(): Promise<void> {
  await notifee.createChannel({
    id: 'workout',
    name: 'Workout Timer',
    importance: AndroidImportance.LOW,
  });

  await notifee.requestPermission();
}

export async function showWorkoutNotification(phaseName: string, secondsRemaining: number): Promise<void> {
  await notifee.displayNotification({
    id: 'workout-timer',
    title: 'Tabata Pro Athlete',
    body: `${phaseName} — ${secondsRemaining}s`,
    android: {
      channelId: 'workout',
      asForegroundService: true,
      ongoing: true,
      pressAction: { id: 'default' },
      category: AndroidCategory.SERVICE,
    },
  });
}

export async function hideWorkoutNotification(): Promise<void> {
  await notifee.stopForegroundService();
  await notifee.cancelNotification('workout-timer');
}

notifee.registerForegroundService(() => {
  return new Promise(() => {});
});
