import { Icon } from '../../atoms/Icon/Icon';
import { COLOR_POR_AMIGO, AMIGOS } from '../../constants/friends';
import styles from './PodiumCard.module.css';

const ICONO_POR_AMIGO = Object.fromEntries(AMIGOS.map(a => [a.nombre, a.icono]));

// Medal icons and colors per position — no emoji needed
const MEDAL_CONFIG = [
  { icon: 'Trophy', color: '#FBBF24', label: '1º' },  // gold
  { icon: 'Medal',  color: '#CBD5E1', label: '2º' },  // silver
  { icon: 'Award',  color: '#D97706', label: '3º' },  // bronze
];

/**
 * Molecule: PodiumCard
 * Podium card with Lucide medal icon, friend icon and points.
 */
export function PodiumCard({ amigo, puntos, posicion, delay = 0, isTie = false }) {
  const medal = MEDAL_CONFIG[posicion] || { icon: 'Star', color: '#A855F7', label: `${posicion + 1}º` };
  const color = COLOR_POR_AMIGO[amigo] || '#A855F7';
  const icono = ICONO_POR_AMIGO[amigo] || 'User';
  const isTop3 = posicion < 3;

  return (
    <div
      className={`${styles.card} ${!isTop3 ? styles.cardSmall : ''}`}
      style={{ '--card-color': color, animationDelay: `${delay}ms` }}
    >
      <div className={styles.medal}>
        <Icon name={medal.icon} size={36} color={medal.color} strokeWidth={2} />
        <span className={styles.medalLabel} style={{ color: medal.color }}>
          {medal.label}
          {isTie && <small style={{ fontSize: '0.4em', display: 'block' }}>(Empate)</small>}
        </span>
      </div>
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
