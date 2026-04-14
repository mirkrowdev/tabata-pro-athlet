import * as Notifications from 'expo-notifications';

export async function setupNotifications() {
  await Notifications.requestPermissionsAsync();

  await Notifications.setNotificationChannelAsync('workout', {
    name: 'Workout Timer',
    importance: Notifications.AndroidImportance.LOW,
    sound: false,
  });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function showWorkoutNotification(phaseName, secondsRemaining) {
  try {
    try {
      await Notifications.dismissNotificationAsync('workout-timer');
    } catch (dismissError) {
      // Ignore failures from dismissing a previous notification.
    }

    await Notifications.scheduleNotificationAsync({
      identifier: 'workout-timer',
      content: {
        title: 'Tabata Pro Athlete',
        body: `${phaseName} — ${secondsRemaining}s`,
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.LOW,
        channelId: 'workout',
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Failed to show workout notification:', error);
  }
}

export async function hideWorkoutNotification() {
  try {
    await Notifications.dismissNotificationAsync('workout-timer');
  } catch (error) {
    console.error('Failed to hide workout notification:', error);
  }
}
