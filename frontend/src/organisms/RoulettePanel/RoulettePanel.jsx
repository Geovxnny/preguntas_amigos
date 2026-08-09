import { useState, useEffect } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import { AMIGOS } from '../../constants/friends';
import styles from './RoulettePanel.module.css';

const RETOS = [
  "¿Cuándo diste tu último beso y a quién?",
  "Muestra la última foto de tu galería en el teléfono",
  "¿A quién de este grupo salvarías primero en un incendio?",
  "Imita a alguien del grupo hasta que adivinemos quién es",
  "Toma 1 shot o dale 1 shot a alguien",
  "¿Cuál es tu mayor arrepentimiento amoroso?",
  "Muestra el último mensaje de WhatsApp que enviaste",
  "¿Cuál es el rumor más falso que has escuchado de ti?",
  "Si tuvieras que eliminar a uno del grupo para sobrevivir, ¿quién sería?",
  "Llama a una pizzería e intenta pedir unos tacos",
  "Verdad cruda: ¿qué es lo que más te molesta del grupo?",
  "Haz 15 flexiones de pecho ahora mismo",
  "Dejar que el grupo envíe un mensaje desde tu celular al azar",
];

export function RoulettePanel() {
  const [activeTab, setActiveTab] = useState('amigos'); // 'amigos' | 'retos'
  const [spinning, setSpinning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [winner, setWinner] = useState(null);

  const items = activeTab === 'amigos' ? AMIGOS : RETOS;

  // Si cambiamos de tab, reseteamos la ruleta
  useEffect(() => {
    setSpinning(false);
    setWinner(null);
    setActiveIndex(0);
  }, [activeTab]);

  const spinRoulette = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    const winnerIndex = Math.floor(Math.random() * items.length);
    let current = activeIndex;
    let spins = 0;
    
    // Forzamos al menos 3-4 vueltas completas para amigos, menos para retos
    const distanceToWinner = (winnerIndex - activeIndex + items.length) % items.length;
    const baseSpins = activeTab === 'amigos' ? (items.length * 3) : (items.length * 2);
    const totalSpins = baseSpins + distanceToWinner;

    const spin = () => {
      spins++;
      current = (current + 1) % items.length;
      setActiveIndex(current);

      if (spins < totalSpins) {
        // Hacemos que gire rápido al principio y más lento al final
        const deceleration = activeTab === 'amigos' ? 0.05 : 0.02;
        const delay = 40 + (spins * spins * deceleration); 
        setTimeout(spin, delay);
      } else {
        setSpinning(false);
        setWinner(items[winnerIndex]);
      }
    };
    spin();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Icon name="Dices" size={36} color="#EC4899" /> 
          La Ruleta
        </h1>
        <p className={styles.subtitle}>Gira la ruleta al azar</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'amigos' ? styles.tabBtnActive : ''}`}
          onClick={() => !spinning && setActiveTab('amigos')}
        >
          <Icon name="Users" size={18} /> Amigos
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'retos' ? styles.tabBtnActive : ''}`}
          onClick={() => !spinning && setActiveTab('retos')}
        >
          <Icon name="Flame" size={18} /> Retos y Preguntas
        </button>
      </div>

      {activeTab === 'amigos' && (
        <div className={styles.grid}>
          {AMIGOS.map((amigo, index) => (
            <div 
              key={amigo.nombre}
              className={`${styles.card} ${index === activeIndex ? styles.cardActive : ''}`}
              style={{ '--card-color': amigo.color }}
            >
              <div className={styles.iconWrap}>
                <Icon name={amigo.icono} size={32} color="white" />
              </div>
              <span className={styles.name}>{amigo.nombre}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'retos' && (
        <div className={styles.retoContainer}>
          <div className={`${styles.retoCard} ${(!spinning && winner && typeof winner === 'string') ? styles.retoCardActive : ''}`}>
            <span className={styles.retoText}>
              {spinning ? items[activeIndex] : (typeof winner === 'string' ? winner : "¿Quién será la próxima víctima?")}
            </span>
          </div>
        </div>
      )}

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
          {activeTab === 'amigos' && (
            <h2 className={styles.winnerName} style={{ '--winner-color': winner.color }}>
              ¡{winner.nombre}!
            </h2>
          )}
          <div style={{ marginTop: activeTab === 'amigos' ? '0' : '24px' }}>
            <Button size="md" variant="ghost" onClick={spinRoulette}>
              <Icon name="RefreshCw" size={18} /> Girar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
