import { useEffect, useState } from 'react';
import { AppLayout } from './templates/AppLayout/AppLayout';
import { MobileVotePanel } from './organisms/MobileVotePanel/MobileVotePanel';
import { TVResultsPanel } from './organisms/TVResultsPanel/TVResultsPanel';
import { RankingPanel } from './organisms/RankingPanel/RankingPanel';
import { Icon } from './atoms/Icon/Icon';
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
    apiOnline,
    fetchEstado,
    siguiente,
    anterior,
  } = useGameState();

  const [preguntas, setPreguntas] = useState([]);

  useEffect(() => {
    getPreguntas()
      .then(data => {
        setPreguntas(data.preguntas);
        setTotalPreguntas(data.total);
      })
      .catch(() => {
        // API offline — use default question count, app still renders
      });
  }, []);

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
      {/* Offline banner */}
      {!apiOnline && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(244,63,94,0.85)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
        }}>
          <Icon name="WifiOff" size={16} />
          API offline — start the server: <code style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: 6, marginLeft: 4 }}>uvicorn api:app --reload</code>
        </div>
      )}

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
