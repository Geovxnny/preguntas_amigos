import { useState } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import styles from './PinInput.module.css';

/**
 * Molecule: PinInput
 * Input de PIN con botón de desbloqueo para el anfitrión.
 */
export function PinInput({ onSubmit, error }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(pin);
    setLoading(false);
    setPin('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} id="pin-form">
      <div className={styles.label}>
        <Icon name="Lock" size={18} />
        <span>PIN de anfitrión</span>
      </div>
      <div className={styles.row}>
        <input
          id="pin-input"
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="••••"
          className={styles.input}
          maxLength={8}
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={!pin}
          id="pin-submit"
        >
          <Icon name="Unlock" size={18} />
        </Button>
      </div>
      {error && (
        <p className={styles.error}>
          <Icon name="AlertCircle" size={14} /> {error}
        </p>
      )}
    </form>
  );
}
