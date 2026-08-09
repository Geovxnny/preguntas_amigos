import { useEffect, useState } from 'react';
import { AppLayout } from './templates/AppLayout/AppLayout';
import { MobileVotePanel } from './organisms/MobileVotePanel/MobileVotePanel';
import { TVResultsPanel } from './organisms/TVResultsPanel/TVResultsPanel';
import { RankingPanel } from './organisms/RankingPanel/RankingPanel';
import { Spinner } from './atoms/Spinner/Spinner';
import { useHostAuth } from './hooks/useHostAuth';
import { useGameState } from './hooks/useGameState';
import { getPreguntas } from './services/api';

export default function App() {
  const { isHost, error: authError, validatePin, logout } = useHostAuth();
  const {
    preguntaActiva,
    totalPreguntas,
    setTotalPreguntas,
    mode,
    setMode,
    loading,
    fetchEstado,
    siguiente,
    anterior,
  } = useGameState(isHost);

  const [preguntas, setPreguntas] = useState([]);

  // Cargar preguntas al iniciar
  useEffect(() => {
    getPreguntas().then(data => {
      setPreguntas(data.preguntas);
      setTotalPreguntas(data.total);
    }).catch(console.error);
  }, []);

  if (loading && preguntas.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppLayout
      mode={mode}
      onModeChange={setMode}
      isHost={isHost}
      onLogin={validatePin}
      onLogout={logout}
      authError={authError}
      preguntaActiva={preguntaActiva}
      totalPreguntas={totalPreguntas}
    >
      {mode === 'mobile' && (
        <MobileVotePanel
          preguntaActiva={preguntaActiva}
          onSync={fetchEstado}
        />
      )}

      {mode === 'tv' && isHost && (
        <TVResultsPanel
          preguntaActiva={preguntaActiva}
          totalPreguntas={totalPreguntas}
          preguntas={preguntas}
          onAnterior={anterior}
          onSiguiente={siguiente}
        />
      )}

      {mode === 'ranking' && isHost && (
        <RankingPanel />
      )}
    </AppLayout>
  );
}
