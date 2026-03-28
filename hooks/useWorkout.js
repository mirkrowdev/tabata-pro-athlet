import { useCallback, useEffect, useState } from 'react';
import * as storage from '../storage';

export default function useWorkout() {
  const [circuits, setCircuits] = useState([]);
  const [sessions, setSessions] = useState([]);

  const loadData = useCallback(async () => {
    const storedCircuits = await storage.getCircuits();
    const storedSessions = await storage.getSessions();
    setCircuits(storedCircuits || []);
    setSessions(storedSessions || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addCircuit = async (circuit) => {
    const success = await storage.saveCircuit(circuit);
    if (success) loadData();
    return success;
  };

  const addSession = async (session) => {
    const success = await storage.saveSession(session);
    if (success) loadData();
    return success;
  };

  return {
    circuits,
    sessions,
    refresh: loadData,
    addCircuit,
    addSession,
  };
}
