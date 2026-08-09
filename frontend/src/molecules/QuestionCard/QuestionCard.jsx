import { Icon } from '../../atoms/Icon/Icon';
import styles from './QuestionCard.module.css';

/**
 * Molecule: QuestionCard
 * Displays question text on the TV screen.
 */
export function QuestionCard({ numero, total, texto }) {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>
        <Icon name="HelpCircle" size={16} color="#1E1B4B" />
        Question {numero} <span className={styles.total}>/ {total}</span>
      </div>
      <p className={styles.texto}>{texto}</p>
    </div>
  );
}
