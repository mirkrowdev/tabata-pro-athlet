import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const TABATA_TIMER_TASK = 'TABATA_TIMER';

TaskManager.defineTask(TABATA_TIMER_TASK, async () => {
  try {
    // Timer logic will be handled by the foreground app
    // This task ensures the app can continue running in the background
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background timer task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default TABATA_TIMER_TASK;
