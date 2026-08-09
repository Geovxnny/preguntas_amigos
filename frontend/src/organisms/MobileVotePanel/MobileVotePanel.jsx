import { useState } from 'react';
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
  const [lastVote, setLastVote] = useState(null);

  const handleVote = async (nombre) => {
    try {
      await votar(preguntaActiva - 1, nombre);
      setLastVote(nombre);
      setToast(`¡Votaste por ${nombre}! 🎉`);
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setToast(`Error: ${err.message}`);
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
          onClick={onSync}
          id="sync-btn"
          aria-label="Sincronizar"
        >
          <Icon name="RefreshCw" size={18} />
        </button>
      </div>

      <h2 className={styles.cta}>👇 Elige tu respuesta</h2>

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

      {/* Toast de confirmación */}
      {toast && (
        <div className={`${styles.toast} ${toast.startsWith('Error') ? styles.toastError : ''}`}>
          {toast}
        </div>
      )}
    </div>
  );
}
