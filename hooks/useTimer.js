import { useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { Audio } from 'expo-av';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { speak, stopSpeech } from '../utils/speech';
import { showWorkoutNotification, hideWorkoutNotification } from '../utils/workoutNotification';

function buildSteps(circuit) {
  const steps = [];
  if (!circuit) return steps;

  if (circuit.warmup > 0) {
    steps.push({ type: 'WARMUP', duration: circuit.warmup, label: 'Preparati' });
  }

  for (let r = 1; r <= circuit.rounds; r++) {
    for (let i = 0; i < circuit.exercises.length; i++) {
      const exercise = circuit.exercises[i];
      steps.push({
        type: 'EXERCISE',
        duration: exercise.duration,
        name: exercise.name,
        round: r,
        index: i,
      });

      if (exercise.rest > 0) {
        steps.push({
          type: 'REST',
          duration: exercise.rest,
          round: r,
          index: i,
        });
      }
    }

    if (r < circuit.rounds && circuit.roundRest > 0) {
      steps.push({ type: 'ROUND_REST', duration: circuit.roundRest, round: r });
    }
  }

  if (circuit.cooldown > 0) {
    steps.push({ type: 'COOLDOWN', duration: circuit.cooldown, label: 'Cooldown' });
  }

  return steps;
}

export default function useTimer({ circuit, onPhaseChange, onDone }) {
  const [status, setStatus] = useState('IDLE');
  const [seconds, setSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [steps, setSteps] = useState([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const stepsRef = useRef([]);
  const stepIndexRef = useRef(-1);
  const intervalRef = useRef(null);
  const soundRef = useRef(null);
  const stepStartTimeRef = useRef(null);
  const pausedAtRef = useRef(null);
  const totalPausedMsRef = useRef(0);
  const completedStepsRef = useRef([]);

  const makeBeep = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      } else {
        Vibration.vibrate(100);
      }
    } catch (error) {
      Vibration.vibrate(100);
    }
  };

  const enterStep = (stepIndex, stepsOverride) => {
    const currentSteps = stepsOverride || stepsRef.current;
    const step = currentSteps[stepIndex];
    if (!step) return;

    // Track completed step before entering new one
    if (stepIndexRef.current >= 0 && stepStartTimeRef.current) {
      const previousStep = stepsRef.current[stepIndexRef.current];
      if (previousStep) {
        const actualDuration = Math.floor((Date.now() - stepStartTimeRef.current - totalPausedMsRef.current) / 1000);
        completedStepsRef.current.push({
          name: previousStep.name,
          type: previousStep.type,
          round: previousStep.round,
          index: previousStep.index,
          actualDuration: actualDuration
        });
      }
    }

    if (stepsOverride) {
      setSteps(stepsOverride);
    }
    stepIndexRef.current = stepIndex;
    setCurrentStepIndex(stepIndex);
    setStatus(step.type);
    setSeconds(step.duration);
    showWorkoutNotification(step.type, step.duration);

    // Reset timing for new step
    stepStartTimeRef.current = Date.now();
    totalPausedMsRef.current = 0;
    pausedAtRef.current = null;

    if (onPhaseChange) {
      onPhaseChange(step.type, step);
    }

    if (step.type === 'WARMUP') speak('Preparati');
    else if (step.type === 'EXERCISE') speak(step.name || 'Esercizio');
    else if (step.type === 'REST') speak('Recupero');
    else if (step.type === 'ROUND_REST') speak('Pausa round');
    else if (step.type === 'COOLDOWN') speak('Ottimo lavoro');
  };

  const nextStep = () => {
    const currentIndex = stepIndexRef.current;
    const currentSteps = stepsRef.current;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= currentSteps.length) {
      // Track the last completed step before finishing
      if (stepStartTimeRef.current) {
        const previousStep = stepsRef.current[stepIndexRef.current];
        if (previousStep) {
          const actualDuration = Math.floor((Date.now() - stepStartTimeRef.current - totalPausedMsRef.current) / 1000);
          completedStepsRef.current.push({
            name: previousStep.name,
            type: previousStep.type,
            round: previousStep.round,
            index: previousStep.index,
            actualDuration: actualDuration
          });
        }
      }

      setStatus('DONE');
      setSeconds(0);
      setRunning(false);
      setCurrentStepIndex(-1);
      stepIndexRef.current = -1;
      onPhaseChange?.('DONE');
      onDone?.();
      return;
    }
    enterStep(nextIndex);
  };

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    stepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/beep.mp3'));
        soundRef.current = sound;
      } catch (error) {
        console.error('Failed to load beep sound:', error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const currentStep = stepsRef.current[stepIndexRef.current];
          if (!currentStep) return s;

          // Calculate remaining time using timestamp-based approach
          const elapsed = Date.now() - stepStartTimeRef.current - totalPausedMsRef.current;
          const remaining = Math.max(0, currentStep.duration - Math.floor(elapsed / 1000));

          showWorkoutNotification(currentStep.type, remaining);

          if (remaining <= 0) {
            nextStep();
            return 0;
          }
          if (remaining <= 10) {
            makeBeep();
          }
          return remaining;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
    return () => {};
  }, [running, paused]);

  const start = () => {
    completedStepsRef.current = [];
    if (!circuit || !circuit.exercises?.length) return;
    const builtSteps = buildSteps(circuit);
    if (builtSteps.length === 0) return;

    stepsRef.current = builtSteps;
    setSteps(builtSteps);
    setRunning(true);
    setPaused(false);
    enterStep(0, builtSteps);

    // Configure audio to stay active in background
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    }).catch((error) => console.error('Failed to set audio mode:', error));
  };

  const stop = () => {
    stopSpeech();
    hideWorkoutNotification();
    setRunning(false);
    setPaused(false);
    setStatus('IDLE');
    setSeconds(0);
    setCurrentStepIndex(-1);
    setSteps([]);
    onPhaseChange?.('IDLE');

    // Reset timing refs
    stepStartTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedMsRef.current = 0;
    completedStepsRef.current = [];

    // Reset audio mode
    Audio.setAudioModeAsync({
      staysActiveInBackground: false,
    }).catch((error) => console.error('Failed to reset audio mode:', error));
  };

  const togglePause = () => {
    if (!running) return;
    setPaused((v) => {
      if (!v) {
        // Pausing: record the pause time
        pausedAtRef.current = Date.now();
      } else {
        // Resuming: accumulate pause duration
        if (pausedAtRef.current !== null) {
          totalPausedMsRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
      }
      if (!v && currentStepIndex >= 0) {
        onPhaseChange?.(status, steps[currentStepIndex]);
      }
      return !v;
    });
  };

  return {
    status,
    seconds,
    running,
    paused,
    currentStepIndex,
    currentStep: steps[currentStepIndex] || null,
    nextStep: steps[currentStepIndex + 1] || null,
    getCompletedSteps: () => completedStepsRef.current,
    start,
    stop,
    togglePause,
  };
}

