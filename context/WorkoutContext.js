import React, { createContext, useEffect, useState } from 'react';
import { getCircuits, getSessions, saveCircuit, saveSession } from '../storage';

export const WorkoutContext = createContext({
  circuits: [],
  sessions: [],
  addCircuit: async () => false,
  addSession: async () => false,
  refresh: async () => {},
});

export function WorkoutProvider({ children }) {
  const [circuits, setCircuits] = useState([]);
  const [sessions, setSessions] = useState([]);

  const loadCircuits = async () => {
    const storedCircuits = await getCircuits();
    setCircuits(storedCircuits || []);
  };

  const loadSessions = async () => {
    const storedSessions = await getSessions();
    setSessions(storedSessions || []);
  };

  const refresh = async () => {
    await Promise.all([loadCircuits(), loadSessions()]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const addCircuit = async (circuit) => {
    const success = await saveCircuit(circuit);
    if (success) {
      await loadCircuits();
    }
    return success;
  };

  const addSession = async (session) => {
    const success = await saveSession(session);
    if (success) {
      await loadSessions();
    }
    return success;
  };

  return (
    <WorkoutContext.Provider value={{ circuits, sessions, addCircuit, addSession, refresh }}>
      {children}
    </WorkoutContext.Provider>
  );
}
