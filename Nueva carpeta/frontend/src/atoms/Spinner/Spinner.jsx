import styles from './Spinner.module.css';

/** Atom: Spinner — indicador de carga */
export function Spinner({ size = 'md', color = 'white' }) {
  return (
    <div
      className={`${styles.spinner} ${styles[`spinner--${size}`]}`}
      style={{ borderTopColor: color }}
      role="status"
      aria-label="Cargando..."
    />
  );
}
