import { useState, useEffect } from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import { AMIGOS } from '../../constants/friends';
import styles from './RoulettePanel.module.css';

const INITIAL_RETOS = [
  "Te salvaste",
  "Tómate 2 vasos de cerveza o de lo que estén bebiendo",
  "Nombre de la ultima persona que besaste",
  "¿Quién fue tu \"casi algo\" más doloroso o vergonzoso?",
  "Haz un brindis por la ocasión",
  "Dale 1 shot a alguien",
  "Haz 15 flexiones de pecho",
  "Cántale una canción romántica a una botella por 15 segundos",
  "Todos en la mesa toman 1 shot (¡salud general!)",
  "Elige a 2 personas para que se tomen un shot contigo",
  "Doble castigo: Tómate 1 shot y haz 10 sentadillas seguidas",
  "Te salvaste",
];

export function RoulettePanel() {
  const [activeTab, setActiveTab] = useState('amigos'); // 'amigos' | 'retos'
  const [spinning, setSpinning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [winner, setWinner] = useState(null);

  const [availableRetos, setAvailableRetos] = useState(() => {
    const saved = localStorage.getItem('retos_disponibles_v2');
    if (saved) return JSON.parse(saved);
    return [...INITIAL_RETOS];
  });

  const items = activeTab === 'amigos' ? AMIGOS : availableRetos;

  const resetRetos = () => {
    setAvailableRetos([...INITIAL_RETOS]);
    localStorage.setItem('retos_disponibles_v2', JSON.stringify([...INITIAL_RETOS]));
  };

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
        const wonItem = items[winnerIndex];
        setWinner(wonItem);
        
        if (activeTab === 'retos') {
          setAvailableRetos((prev) => {
            const newRetos = [...prev];
            newRetos.splice(winnerIndex, 1);
            localStorage.setItem('retos_disponibles_v2', JSON.stringify(newRetos));
            return newRetos;
          });
        }
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
              {spinning ? items[activeIndex] : (typeof winner === 'string' ? winner : (items.length > 0 ? "¿Quién será la próxima víctima?" : "No hay retos disponibles"))}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'retos' && availableRetos.length === 0 && !spinning && !winner && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#FBBF24', fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>¡Ya no hay más retos en la lista!</p>
          <Button onClick={resetRetos} size="md" variant="danger">
            <Icon name="RefreshCw" size={20} /> Reiniciar Retos
          </Button>
        </div>
      )}

      {!(activeTab === 'retos' && availableRetos.length === 0) && !spinning && !winner && (
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
