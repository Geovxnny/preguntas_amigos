import { useState, useEffect, useCallback, useRef } from 'react';
import { getEstado, setEstado } from '../services/api';

export function useGameState(isHost) {
  const [preguntaActiva, setPreguntaActiva] = useState(1);
  const [totalPreguntas, setTotalPreguntas] = useState(53);
  const [mode, setMode] = useState('mobile'); // 'mobile' | 'tv' | 'ranking'
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchEstado = useCallback(async () => {
    try {
      const data = await getEstado();
      setPreguntaActiva(data.pregunta_activa);
    } catch (err) {
      console.error('Error fetching estado:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling automático para el modo celular (sigue al TV)
  useEffect(() => {
    fetchEstado();
    if (mode === 'mobile') {
      intervalRef.current = setInterval(fetchEstado, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [mode, fetchEstado]);

  const irAPregunta = useCallback(async (num) => {
    try {
      await setEstado(num);
      setPreguntaActiva(num);
    } catch (err) {
      console.error('Error cambiando pregunta:', err);
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
    fetchEstado,
    irAPregunta,
    siguiente,
    anterior,
  };
}
