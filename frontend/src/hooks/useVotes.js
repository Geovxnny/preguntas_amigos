import { useState, useCallback, useRef } from 'react';
import { getVotosPregunta, getTodosVotos } from '../services/api';

export function useVotes() {
  const [votosPregunta, setVotosPregunta] = useState({});
  const [todosVotos, setTodosVotos] = useState({});
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchVotosPregunta = useCallback(async (idx) => {
    setLoading(true);
    try {
      const data = await getVotosPregunta(idx);
      setVotosPregunta(data.votos);
    } catch (err) {
      console.error('Error fetching votos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodosVotos = useCallback(async () => {
    try {
      const data = await getTodosVotos();
      setTodosVotos(data);
    } catch (err) {
      console.error('Error fetching todos votos:', err);
    }
  }, []);

  const startPolling = useCallback((idx, intervalMs = 5000) => {
    stopPolling();
    fetchVotosPregunta(idx);
    intervalRef.current = setInterval(() => fetchVotosPregunta(idx), intervalMs);
  }, [fetchVotosPregunta]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    votosPregunta,
    todosVotos,
    loading,
    fetchVotosPregunta,
    fetchTodosVotos,
    startPolling,
    stopPolling,
  };
}
