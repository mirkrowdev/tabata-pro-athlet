import { useEffect, useRef, useState } from 'react';
import * as KeepAwake from 'expo-keep-awake';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';
import useSpeech from './useSpeech';

const TIMER_TASK = 'TABATA_TIMER_TASK';

const stateSequence = ['IDLE', 'WARMUP', 'EXERCISE', 'REST', 'ROUND_REST', 'COOLDOWN', 'DONE'];

export default function useTimer({ circuit, onTick, onPhaseChange, onDone }) {
  const [status, setStatus] = useState('IDLE');
  const [seconds, setSeconds] = useState(0);
  const [round, setRound] = useState(1);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const { speak } = useSpeech();
  const intervalRef = useRef(null);

  const makeBeep = async () => {
    // Se non c'è un file bip, realizziamo solo un fallback di log.
    // Per un’app completa aggiungere un file bip.mp3 in /assets e riprodurlo con expo-av.
    try {
      const soundObject = new Audio.Sound();
      // const source = require('../assets/bip.mp3');
      // await soundObject.loadAsync(source);
      // await soundObject.playAsync();
      await soundObject.loadAsync({ uri: 'https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3' });
      await soundObject.playAsync();
      setTimeout(() => soundObject.unloadAsync(), 500);
    } catch (e) {
      console.warn('Impossibile riprodurre bip', e);
    }
  };

  useEffect(() => {
    if (running) {
      KeepAwake.activate();
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            nextState();
            return 0;
          }
          if (s <= 11) makeBeep();
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(intervalRef.current);
      KeepAwake.deactivate();
    };
  }, [running]);

  const start = () => {
    if (!circuit || !circuit.exercises?.length) return;
    setStatus('WARMUP');
    setSeconds(circuit.warmup || 0);
    setRound(1);
    setIndex(0);
    setRunning(true);
    onPhaseChange?.('WARMUP');
    speak('Preparati');
  };

  const stop = () => {
    setRunning(false);
    setStatus('IDLE');
    setSeconds(0);
    setRound(1);
    setIndex(0);
    onPhaseChange?.('IDLE');
  };

  const nextState = () => {
    if (status === 'WARMUP') {
      if (!circuit.exercises.length) {
        finish();
        return;
      }
      setStatus('EXERCISE');
      setSeconds(circuit.exercises[0].duration);
      onPhaseChange?.('EXERCISE');
      speak(circuit.exercises[0].name || 'Esercizio');
      return;
    }

    if (status === 'EXERCISE') {
      if (circuit.exercises[index].rest > 0) {
        setStatus('REST');
        setSeconds(circuit.exercises[index].rest);
        onPhaseChange?.('REST');
        speak('Recupero');
        return;
      }
    }

    if (status === 'REST' || status === 'EXERCISE') {
      const nextIdx = status === 'EXERCISE' ? index + 1 : index;
      if (nextIdx < circuit.exercises.length) {
        setStatus('EXERCISE');
        setIndex(nextIdx);
        setSeconds(circuit.exercises[nextIdx].duration);
        onPhaseChange?.('EXERCISE');
        speak(circuit.exercises[nextIdx].name || 'Esercizio');
        return;
      }

      if (round < circuit.rounds) {
        setStatus('ROUND_REST');
        setSeconds(circuit.roundRest || 0);
        setRound(round + 1);
        setIndex(0);
        onPhaseChange?.('ROUND_REST');
        speak('Pausa round');
        return;
      }

      if (circuit.cooldown > 0) {
        setStatus('COOLDOWN');
        setSeconds(circuit.cooldown);
        onPhaseChange?.('COOLDOWN');
        speak('Ottimo lavoro');
        return;
      }

      finish();
      return;
    }

    if (status === 'ROUND_REST') {
      setStatus('EXERCISE');
      setSeconds(circuit.exercises[0].duration);
      onPhaseChange?.('EXERCISE');
      speak(circuit.exercises[0].name || 'Esercizio');
      return;
    }

    if (status === 'COOLDOWN') {
      finish();
      return;
    }
  };

  const finish = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setStatus('DONE');
    setSeconds(0);
    onPhaseChange?.('DONE');
    onDone?.();
    KeepAwake.deactivate();
  };

  return {
    status,
    seconds,
    round,
    index,
    running,
    start,
    stop,
    setStatus,
  };
}
