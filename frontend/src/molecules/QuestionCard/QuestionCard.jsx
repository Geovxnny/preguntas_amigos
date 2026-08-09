import { Icon } from '../../atoms/Icon/Icon';
import styles from './QuestionCard.module.css';

/**
 * Molecule: QuestionCard
 * Displays question text on the TV screen.
 */
export function QuestionCard({ numero, total, texto }) {
  const parts = texto.split('. ¿');
  let title = texto;
  let question = '';
  
  if (parts.length > 1) {
    title = parts[0] + '.';
    question = '¿' + parts[1];
  }

  return (
    <div className={styles.card}>
      <div className={styles.badge}>
        <Icon name="HelpCircle" size={16} color="#1E1B4B" />
        Pregunta {numero} <span className={styles.total}>/ {total}</span>
      </div>
      <div className={styles.texto}>
        {question ? (
          <>
            <div style={{ fontWeight: 800, color: '#FBBF24', marginBottom: '8px' }}>
              {title}
            </div>
            <div style={{ fontSize: '1.1em', opacity: 0.9 }}>
              {question}
            </div>
          </>
        ) : (
          <p>{texto}</p>
        )}
      </div>
    </div>
  );
}
