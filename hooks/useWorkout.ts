import { useContext } from 'react';
import { WorkoutContext, WorkoutContextType } from '../context/WorkoutContext';

export default function useWorkout(): WorkoutContextType {
  return useContext(WorkoutContext);
}
