import { Icon } from '../../atoms/Icon/Icon';
import { COLOR_POR_AMIGO, AMIGOS, MEDALLAS } from '../../constants/friends';
import styles from './PodiumCard.module.css';

const ICONO_POR_AMIGO = Object.fromEntries(AMIGOS.map(a => [a.nombre, a.icono]));

/**
 * Molecule: PodiumCard
 * Tarjeta de podio con medalla, nombre, icono y puntos.
 */
export function PodiumCard({ amigo, puntos, posicion, delay = 0 }) {
  const medal = MEDALLAS[posicion] || '🏅';
  const color = COLOR_POR_AMIGO[amigo] || '#A855F7';
  const icono = ICONO_POR_AMIGO[amigo] || 'User';

  return (
    <div
      className={styles.card}
      style={{ '--card-color': color, animationDelay: `${delay}ms` }}
    >
      <div className={styles.medal}>{medal}</div>
      <div className={styles.iconWrap} style={{ background: color }}>
        <Icon name={icono} size={32} color="white" />
      </div>
      <div className={styles.name}>{amigo}</div>
      <div className={styles.points}>
        <Icon name="Trophy" size={16} color={color} />
        <span>{puntos} <small>preguntas</small></span>
      </div>
    </div>
  );
}
