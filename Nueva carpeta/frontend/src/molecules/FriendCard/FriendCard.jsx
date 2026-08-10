import { useState } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './FriendCard.module.css';

/**
 * Molecule: FriendCard
 * Botón de votación de un amigo con icono Lucide, color de fondo y animación al votar.
 */
export function FriendCard({ nombre, icono, color, gradient, onVote, disabled }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    if (clicked || disabled) return;
    setClicked(true);
    await onVote(nombre);
    setTimeout(() => setClicked(false), 2000);
  };

  return (
    <button
      className={`${styles.card} ${clicked ? styles['card--voted'] : ''}`}
      style={{ background: gradient || color }}
      onClick={handleClick}
      disabled={disabled}
      id={`friend-btn-${nombre.toLowerCase()}`}
      aria-label={`Votar por ${nombre}`}
    >
      {/* Efecto de brillo al hacer clic */}
      <span className={styles.glow} />

      <span className={styles.iconWrap}>
        <Icon name={icono} size={36} color="white" strokeWidth={2.5} />
      </span>
      <span className={styles.name}>{nombre}</span>

      {/* Checkmark de confirmación */}
      {clicked && (
        <span className={styles.check}>
          <Icon name="CheckCircle" size={22} color="white" />
        </span>
      )}
    </button>
  );
}
