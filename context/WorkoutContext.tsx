import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { getCircuits, getSessions, saveCircuit, saveSession, deleteCircuit as deleteCircuitStorage, Circuit, Session } from '../storage';

export interface WorkoutContextType {
  circuits: Circuit[];
  sessions: Session[];
  addCircuit(circuit: Circuit): Promise<boolean>;
  deleteCircuit(id: string): Promise<boolean>;
  addSession(session: Session): Promise<boolean>;
  refresh(): Promise<void>;
}

const defaultValue: WorkoutContextType = {
  circuits: [],
  sessions: [],
  addCircuit: async () => false,
  addSession: async () => false,
  refresh: async () => {},
};

export const WorkoutContext = createContext<WorkoutContextType>(defaultValue);

interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

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

  const addCircuit = async (circuit: Circuit) => {
    const success = await saveCircuit(circuit);
    if (success) {
      await loadCircuits();
    }
    return success;
  };

  const deleteCircuit = async (id: string) => {
    const success = await deleteCircuitStorage(id);
    if (success) {
      await loadCircuits();
    }
    return success;
  };

  const addSession = async (session: Session) => {
    const success = await saveSession(session);
    if (success) {
      await loadSessions();
    }
    return success;
  };

  return (
    <WorkoutContext.Provider value={{ circuits, sessions, addCircuit, deleteCircuit, addSession, refresh }}>
      {children}
    </WorkoutContext.Provider>
  );
}
