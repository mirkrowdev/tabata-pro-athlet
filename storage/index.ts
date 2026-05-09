import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Exercise {
  name: string;
  duration: number;
  rest: number;
}

export interface Circuit {
  id: string;
  name: string;
  exercises: Exercise[];
  rounds: number;
  warmup: number;
  cooldown: number;
  roundRest: number;
  updatedAt?: string;
}

export interface CompletedStep {
  name?: string;
  type: string;
  round?: number;
  index?: number;
  actualDuration: number;
}

export interface Session {
  id: string;
  startedAt: string;
  totalDuration: number;
  circuitName: string;
  roundsCompleted: number;
  completed: boolean;
  completedExercises?: CompletedStep[];
}

const CIRCUIT_KEY = '@tabata:circuits';
const SESSION_KEY = '@tabata:sessions';
const ACTIVE_CIRCUIT_KEY = '@tabata:activeCircuit';

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('storage getJSON error', error);
    return fallback;
  }
}

async function setJSON(key: string, data: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('storage setJSON error', error);
    return false;
  }
}

export async function getCircuits(): Promise<Circuit[]> {
  return await getJSON<Circuit[]>(CIRCUIT_KEY, []);
}

export async function saveCircuit(circuit: Circuit): Promise<boolean> {
  const existing = await getCircuits();
  const updated = [...existing];

  const index = updated.findIndex(c => c.id === circuit.id);
  if (index >= 0) {
    updated[index] = { ...updated[index], ...circuit };
  } else {
    updated.push({ ...circuit, id: circuit.id || Date.now().toString() });
  }

  const success = await setJSON(CIRCUIT_KEY, updated);
  return success;
}

export async function deleteCircuit(id: string): Promise<boolean> {
  const existing = await getCircuits();
  const updated = existing.filter(c => c.id !== id);
  const success = await setJSON(CIRCUIT_KEY, updated);
  return success;
}

export async function getSessions(): Promise<Session[]> {
  return await getJSON<Session[]>(SESSION_KEY, []);
}

export async function saveSession(session: Session): Promise<boolean> {
  const existing = await getSessions();
  const updated = [...existing, { ...session, id: session.id || Date.now().toString() }];
  const success = await setJSON(SESSION_KEY, updated);
  return success;
}

export async function getActiveCircuit(): Promise<Circuit | null> {
  return await getJSON<Circuit | null>(ACTIVE_CIRCUIT_KEY, null);
}

export async function setActiveCircuit(circuit: Circuit): Promise<boolean> {
  return await setJSON(ACTIVE_CIRCUIT_KEY, circuit);
}

