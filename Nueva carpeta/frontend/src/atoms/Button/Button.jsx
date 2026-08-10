import styles from './Button.module.css';

/**
 * Atom: Button
 * Botón base reutilizable con variantes de estilo.
 */
export function Button({
  children,
  variant = 'primary',  // 'primary' | 'ghost' | 'danger' | 'icon'
  size = 'md',          // 'sm' | 'md' | 'lg'
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  id,
  className = '',
  style = {},
  ...props
}) {
  return (
    <button
      id={id}
      className={[
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        fullWidth ? styles['btn--full'] : '',
        loading ? styles['btn--loading'] : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}
