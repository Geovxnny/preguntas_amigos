import { useState } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import { AMIGOS } from '../../constants/friends';
import styles from './RoulettePanel.module.css';

// =========================================================
// AQUÍ PUEDES AGREGAR TODOS TUS CASTIGOS
// La ruleta elegirá uno al azar cuando alguien pierda
// =========================================================
const CASTIGOS = [
  "Tomar 1 shot",
  "Hacer 10 flexiones de pecho",
  "Llamar a tu ex y colgar",
  "Mandar una foto vergonzosa al grupo",
  "Cantar una canción a todo pulmón",
  "Contar tu secreto más oscuro",
  "Dejar que el grupo envíe un mensaje desde tu celular",
  "Tomar 2 vasos de agua seguidos",
  // TODO: ¡Agrega más castigos aquí!
];

export function RoulettePanel() {
  const [spinning, setSpinning] = useState(false);
  const [activeFriendIndex, setActiveFriendIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [castigo, setCastigo] = useState(null);

  const spinRoulette = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setCastigo(null);

    // Calcular ganador y castigo
    const winnerIndex = Math.floor(Math.random() * AMIGOS.length);
    const winnerCastigo = CASTIGOS.length > 0 
      ? CASTIGOS[Math.floor(Math.random() * CASTIGOS.length)] 
      : "No hay castigos configurados";

    let current = activeFriendIndex;
    let spins = 0;
    // Forzamos al menos 3 vueltas completas + la distancia al ganador
    const distanceToWinner = (winnerIndex - activeFriendIndex + AMIGOS.length) % AMIGOS.length;
    const totalSpins = (AMIGOS.length * 3) + distanceToWinner;

    const spin = () => {
      spins++;
      current = (current + 1) % AMIGOS.length;
      setActiveFriendIndex(current);

      if (spins < totalSpins) {
        // Hacemos que gire rápido al principio y más lento al final
        const delay = 40 + (spins * spins * 0.08); 
        setTimeout(spin, delay);
      } else {
        setSpinning(false);
        setWinner(AMIGOS[winnerIndex]);
        setCastigo(winnerCastigo);
      }
    };
    spin();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Icon name="Dices" size={36} color="#EC4899" /> 
          La Ruleta del Castigo
        </h1>
        <p className={styles.subtitle}>Gira la ruleta para elegir una víctima al azar</p>
      </div>

      <div className={styles.grid}>
        {AMIGOS.map((amigo, index) => (
          <div 
            key={amigo.nombre}
            className={`${styles.card} ${index === activeFriendIndex ? styles.cardActive : ''}`}
            style={{ '--card-color': amigo.color }}
          >
            <div className={styles.iconWrap}>
              <Icon name={amigo.icono} size={32} color="white" />
            </div>
            <span className={styles.name}>{amigo.nombre}</span>
          </div>
        ))}
      </div>

      {!spinning && !winner && (
        <Button size="lg" onClick={spinRoulette} style={{ padding: '0 40px', fontSize: '1.2rem' }}>
          <Icon name="PlayCircle" size={24} /> ¡Girar Ruleta!
        </Button>
      )}

      {spinning && (
        <Button size="lg" disabled variant="ghost">
          Girando...
        </Button>
      )}

      {winner && !spinning && (
        <div className={styles.result}>
          <h2 className={styles.winnerName} style={{ '--winner-color': winner.color }}>
            ¡{winner.nombre}!
          </h2>
          <div className={styles.castigoBox} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <Icon name="Flame" size={28} color="#F97316" /> Castigo: {castigo}
          </div>
          <div style={{ marginTop: '24px' }}>
            <Button size="md" variant="ghost" onClick={spinRoulette}>
              <Icon name="RefreshCw" size={18} /> Girar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
