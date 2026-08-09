import { Icon } from '../../atoms/Icon/Icon';
import styles from './QuestionCard.module.css';

/**
 * Molecule: QuestionCard
 * Displays question text on the TV screen.
 */
export function QuestionCard({ numero, total, texto }) {
  const separatorIndex = texto.indexOf('. ');
  let title = texto;
  let question = '';
  
  if (separatorIndex !== -1) {
    title = texto.slice(0, separatorIndex + 1);
    question = texto.slice(separatorIndex + 2);
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
            <div style={{ fontWeight: 800, color: 'white', marginBottom: '8px', fontSize: '1.2em' }}>
              {title}
            </div>
            <div style={{ fontSize: '1.1em', opacity: 0.85 }}>
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
