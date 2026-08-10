import { useState, useEffect } from 'react';
import { FriendCard } from '../../molecules/FriendCard/FriendCard';
import { Icon } from '../../atoms/Icon/Icon';
import { AMIGOS } from '../../constants/friends';
import { votar } from '../../services/api';
import styles from './MobileVotePanel.module.css';

/**
 * Organism: MobileVotePanel
 * Grid 2x4 de botones de votación. El usuario toca para votar.
 */
export function MobileVotePanel({ preguntaActiva, onSync }) {
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastVote, setLastVote] = useState(() => localStorage.getItem(`vote_q${preguntaActiva}`));

  useEffect(() => {
    setLastVote(localStorage.getItem(`vote_q${preguntaActiva}`));
  }, [preguntaActiva]);

  const handleVote = async (nombre) => {
    try {
      await votar(preguntaActiva - 1, nombre);
      localStorage.setItem(`vote_q${preguntaActiva}`, nombre);
      setLastVote(nombre);
      setToast({ text: `¡Votaste por ${nombre}!`, type: 'success' });
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setToast({ text: `Error: ${err.message}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.preguntaBadge}>
          <Icon name="Eye" size={18} />
          <span>Pregunta {preguntaActiva}</span>
        </div>
        <button
          className={styles.syncBtn}
          onClick={async () => {
            setIsSyncing(true);
            await onSync();
            setTimeout(() => setIsSyncing(false), 500); // short delay for visual feedback
          }}
          id="sync-btn"
          aria-label="Sincronizar"
          disabled={isSyncing}
        >
          <div className={isSyncing ? styles.spin : ''}>
            <Icon name="RefreshCw" size={18} />
          </div>
        </button>
      </div>

      <div className={styles.cta}>
        <Icon name="MousePointerClick" size={20} />
        <span>Elige tu respuesta</span>
      </div>

      {/* Grid de amigos */}
      <div className={styles.grid}>
        {AMIGOS.map((amigo) => (
          <FriendCard
            key={amigo.nombre}
            nombre={amigo.nombre}
            icono={amigo.icono}
            color={amigo.color}
            gradient={amigo.grad}
            onVote={handleVote}
            disabled={lastVote !== null}
          />
        ))}
      </div>

      {/* Confirmation toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          <Icon name={toast.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
          <span style={{ marginLeft: '8px' }}>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
