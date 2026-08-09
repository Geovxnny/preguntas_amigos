import styles from './QuestionCard.module.css';

/**
 * Molecule: QuestionCard
 * Card que muestra el texto de la pregunta en el Modo TV.
 */
export function QuestionCard({ numero, total, texto }) {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>
        Pregunta {numero} <span className={styles.total}>/ {total}</span>
      </div>
      <p className={styles.texto}>{texto}</p>
    </div>
  );
}
