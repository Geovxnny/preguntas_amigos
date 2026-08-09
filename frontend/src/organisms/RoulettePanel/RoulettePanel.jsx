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
  const [extraAmigos, setExtraAmigos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [winner, setWinner] = useState(null);

  const [availableRetos, setAvailableRetos] = useState(() => {
    const saved = localStorage.getItem('retos_disponibles_v2');
    if (saved) return JSON.parse(saved);
    return [...INITIAL_RETOS];
  });

  const friendsItems = [...AMIGOS, ...extraAmigos];
  const items = activeTab === 'amigos' ? friendsItems : availableRetos;

  const resetRetos = () => {
    setAvailableRetos([...INITIAL_RETOS]);
    localStorage.setItem('retos_disponibles_v2', JSON.stringify([...INITIAL_RETOS]));
    setWinner(null);
    setSpinning(false);
  };

  const handleAddClick = () => {
    setNewItemText("");
    setModalOpen(true);
  };

  const confirmAdd = () => {
    if (!newItemText || newItemText.trim() === '') return;
    const isAmigo = activeTab === 'amigos';

    if (isAmigo) {
      setExtraAmigos([...extraAmigos, { nombre: newItemText.trim(), icono: 'User', color: '#FBBF24' }]);
    } else {
      const newRetos = [...availableRetos, newItemText.trim()];
      setAvailableRetos(newRetos);
      localStorage.setItem('retos_disponibles_v2', JSON.stringify(newRetos));
    }
    setModalOpen(false);
  };

  // Si cambiamos de tab, reseteamos la ruleta
  useEffect(() => {
    setSpinning(false);
    setWinner(null);
    setActiveIndex(0);
  }, [activeTab]);

  const spinRoulette = () => {
    if (spinning || items.length === 0) return;
    
    // Si solo hay un item, no girar, solo mostrarlo
    if (items.length === 1) {
      setWinner(items[0]);
      if (activeTab === 'retos') {
        setAvailableRetos([]);
        localStorage.setItem('retos_disponibles_v2', JSON.stringify([]));
      }
      return;
    }

    setSpinning(true);
    setWinner(null);

    const winnerIndex = Math.floor(Math.random() * items.length);
    let current = activeIndex;
    let spins = 0;
    
    const distanceToWinner = (winnerIndex - activeIndex + items.length) % items.length;
    // Si quedan pocos retos, nos aseguramos de que haya un número mínimo de giros (ej: 20)
    const baseSpins = activeTab === 'amigos' ? (items.length * 3) : Math.max(items.length * 2, 25);
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
        
        <button 
          className={styles.addBtn}
          onClick={handleAddClick}
          disabled={spinning}
          title={activeTab === 'amigos' ? "Añadir persona" : "Añadir reto"}
        >
          <Icon name="Plus" size={18} />
        </button>
      </div>

      {activeTab === 'amigos' && (
        <div className={styles.grid}>
          {friendsItems.map((amigo, index) => (
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

      {activeTab === 'retos' && availableRetos.length === 0 && !spinning && (
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
            {!(activeTab === 'retos' && availableRetos.length === 0) && (
              <Button size="md" variant="ghost" onClick={spinRoulette}>
                <Icon name="RefreshCw" size={18} /> Girar de nuevo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Agregar */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
              <Icon name="X" size={24} />
            </button>
            <h2 className={styles.modalTitle}>
               {activeTab === 'amigos' ? 'Añadir Persona' : 'Añadir Reto'}
            </h2>
            <div style={{ marginTop: '24px' }}>
               <input 
                 autoFocus
                 type="text" 
                 value={newItemText} 
                 onChange={e => setNewItemText(e.target.value)} 
                 onKeyDown={e => { if(e.key === 'Enter') confirmAdd(); }}
                 placeholder={activeTab === 'amigos' ? "Nombre del amigo..." : "Escribe el reto..."}
                 className={styles.modalInput}
               />
               <Button style={{ marginTop: '24px', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={confirmAdd}>
                 <Icon name="Check" size={20} /> Guardar
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
