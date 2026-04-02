import { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';

export default function useWorkout() {
  return useContext(WorkoutContext);
}
