import { useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { Audio } from 'expo-av';
import { speak, stopSpeech } from '../utils/speech';

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

    if (stepsOverride) {
      setSteps(stepsOverride);
    }
    stepIndexRef.current = stepIndex;
    setCurrentStepIndex(stepIndex);
    setStatus(step.type);
    setSeconds(step.duration);

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
          if (s <= 1) {
            nextStep();
            return 0;
          }
          if (s <= 11) {
            makeBeep();
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
    return () => {};
  }, [running, paused]);

  const start = () => {
    if (!circuit || !circuit.exercises?.length) return;
    const builtSteps = buildSteps(circuit);
    if (builtSteps.length === 0) return;

    stepsRef.current = builtSteps;
    setSteps(builtSteps);
    setRunning(true);
    setPaused(false);
    enterStep(0, builtSteps);
  };

  const stop = () => {
    stopSpeech();
    setRunning(false);
    setPaused(false);
    setStatus('IDLE');
    setSeconds(0);
    setCurrentStepIndex(-1);
    setSteps([]);
    onPhaseChange?.('IDLE');
  };

  const togglePause = () => {
    if (!running) return;
    setPaused((v) => !v);
    if (paused && currentStepIndex >= 0) {
      onPhaseChange?.(status, steps[currentStepIndex]);
    }
  };

  return {
    status,
    seconds,
    running,
    paused,
    currentStepIndex,
    currentStep: steps[currentStepIndex] || null,
    nextStep: steps[currentStepIndex + 1] || null,
    start,
    stop,
    togglePause,
  };
}

