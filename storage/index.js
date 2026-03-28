import AsyncStorage from '@react-native-async-storage/async-storage';

const CIRCUIT_KEY = '@tabata:circuits';
const SESSION_KEY = '@tabata:sessions';
const ACTIVE_CIRCUIT_KEY = '@tabata:activeCircuit';

async function getJSON(key, fallback) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('storage getJSON error', error);
    return fallback;
  }
}

async function setJSON(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('storage setJSON error', error);
    return false;
  }
}

export async function getCircuits() {
  return await getJSON(CIRCUIT_KEY, []);
}

export async function saveCircuit(circuit) {
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

export async function getSessions() {
  return await getJSON(SESSION_KEY, []);
}

export async function saveSession(session) {
  const existing = await getSessions();
  const updated = [...existing, { ...session, id: session.id || Date.now().toString() }];
  const success = await setJSON(SESSION_KEY, updated);
  return success;
}

export async function getActiveCircuit() {
  return await getJSON(ACTIVE_CIRCUIT_KEY, null);
}

export async function setActiveCircuit(circuit) {
  return await setJSON(ACTIVE_CIRCUIT_KEY, circuit);
}

export default {
  getCircuits,
  saveCircuit,
  getSessions,
  saveSession,
  getActiveCircuit,
  setActiveCircuit,
};
