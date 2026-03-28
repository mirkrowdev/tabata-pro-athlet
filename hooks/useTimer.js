import { useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import useSpeech from './useSpeech';

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
  const { speak } = useSpeech();
  const intervalRef = useRef(null);

  const makeBeep = () => {
    Vibration.vibrate(100);
  };

  const enterStep = (stepIndex) => {
    const step = steps[stepIndex];
    if (!step) return;

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
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) {
      setStatus('DONE');
      setSeconds(0);
      setRunning(false);
      setCurrentStepIndex(-1);
      onPhaseChange?.('DONE');
      onDone?.();
      return;
    }
    enterStep(nextIndex);
  };

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
  }, [running, paused, currentStepIndex, steps]);

  const start = () => {
    if (!circuit || !circuit.exercises?.length) return;
    const builtSteps = buildSteps(circuit);
    if (builtSteps.length === 0) return;

    setSteps(builtSteps);
    setRunning(true);
    setPaused(false);
    enterStep(0);
  };

  const stop = () => {
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
    start,
    stop,
    togglePause,
  };
}

