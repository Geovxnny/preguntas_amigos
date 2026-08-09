import { useState, useEffect, useCallback, useRef } from 'react';
import { getEstado, setEstado } from '../services/api';

export function useGameState() {
  const [preguntaActiva, setPreguntaActiva] = useState(1);
  const [totalPreguntas, setTotalPreguntas] = useState(53);
  const [mode, setMode] = useState('mobile'); // 'mobile' | 'tv' | 'ranking'
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);
  const intervalRef = useRef(null);
  const failCountRef = useRef(0);

  const fetchEstado = useCallback(async () => {
    try {
      const data = await getEstado();
      setPreguntaActiva(data.pregunta_activa);
      failCountRef.current = 0;
      setApiOnline(true);
    } catch {
      failCountRef.current += 1;
      if (failCountRef.current === 1) setApiOnline(false);
      // Stop logging after 3 consecutive failures — API is clearly offline
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-poll in mobile mode, but slow down after repeated failures
  useEffect(() => {
    fetchEstado();

    if (mode !== 'mobile') return;

    const INTERVAL_NORMAL = 4000;
    const INTERVAL_OFFLINE = 15000; // Check less often when offline

    const tick = () => {
      const interval = failCountRef.current >= 3 ? INTERVAL_OFFLINE : INTERVAL_NORMAL;
      intervalRef.current = setTimeout(async () => {
        await fetchEstado();
        tick();
      }, interval);
    };

    tick();
    return () => clearTimeout(intervalRef.current);
  }, [mode, fetchEstado]);

  const irAPregunta = useCallback(async (num) => {
    try {
      await setEstado(num);
      setPreguntaActiva(num);
    } catch (err) {
      console.error('Error changing question:', err);
    }
  }, []);

  const siguiente = useCallback(() => {
    if (preguntaActiva < totalPreguntas) irAPregunta(preguntaActiva + 1);
  }, [preguntaActiva, totalPreguntas, irAPregunta]);

  const anterior = useCallback(() => {
    if (preguntaActiva > 1) irAPregunta(preguntaActiva - 1);
  }, [preguntaActiva, irAPregunta]);

  return {
    preguntaActiva,
    totalPreguntas,
    setTotalPreguntas,
    mode,
    setMode,
    loading,
    apiOnline,
    fetchEstado,
    irAPregunta,
    siguiente,
    anterior,
  };
}
