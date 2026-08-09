import { useEffect, useState } from 'react';
import { PodiumCard } from '../../molecules/PodiumCard/PodiumCard';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { COLOR_POR_AMIGO } from '../../constants/friends';
import { useVotes } from '../../hooks/useVotes';
import { desempateGrupo } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import styles from './RankingPanel.module.css';

function calcularRanking(todosVotos, amigos, desempates) {
  const puntos = {};
  amigos.forEach(a => { puntos[a] = 0; });

  Object.values(todosVotos).forEach(conteo => {
    const total = Object.values(conteo).reduce((s, v) => s + v, 0);
    if (total === 0) return;
    const maxVotos = Math.max(...Object.values(conteo));
    Object.entries(conteo).forEach(([amigo, v]) => {
      if (v === maxVotos && v > 0 && amigo in puntos) puntos[amigo]++;
    });
  });

  return Object.entries(puntos)
    .map(([amigo, pts]) => ({ amigo, puntos: pts, desempatePts: desempates[amigo] || 0 }))
    .sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return b.desempatePts - a.desempatePts;
    });
}

const AMIGOS_NOMBRES = ['Kyu', 'Elaina', 'Superboy', 'Emilio', 'Hally', 'JL', 'Lucho', 'Gio'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(76,53,181,0.9)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: '8px 12px',
        color: 'white',
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        {payload[0].value} {payload[0].value === 1 ? 'pregunta ganada' : 'preguntas ganadas'}
      </div>
    );
  }
  return null;
};

export function RankingPanel() {
  const { todosVotos, desempates, fetchTodosVotos } = useVotes();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Tie Breaker State
  const [tieBreakerOpen, setTieBreakerOpen] = useState(false);
  const [selectedTieGroup, setSelectedTieGroup] = useState(null);
  const [remainingTied, setRemainingTied] = useState([]);
  const [resolvedTied, setResolvedTied] = useState([]);
  const [tieWinner, setTieWinner] = useState(null);
  const [resolvingTie, setResolvingTie] = useState(false);

  useEffect(() => {
    fetchTodosVotos();
  }, [fetchTodosVotos]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTodosVotos();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const ranking = calcularRanking(todosVotos, AMIGOS_NOMBRES, desempates || {});
  
  const rankedWithPos = [];
  let currentPos = 0;
  let currentPoints = -1;
  let currentDes = -1;
  let countAtPos = 0;
  
  ranking.forEach((r) => {
    if (r.puntos !== currentPoints || r.desempatePts !== currentDes) {
      currentPos += countAtPos + (currentPoints === -1 ? 0 : 1);
      if (currentPoints === -1) currentPos = 0;
      countAtPos = 0;
      currentPoints = r.puntos;
      currentDes = r.desempatePts;
    } else {
      countAtPos++;
    }
    rankedWithPos.push({ ...r, posicion: currentPos });
  });

  const totalPuntos = rankedWithPos.reduce((s, r) => s + r.puntos, 0);
  const top3 = rankedWithPos.filter(r => r.posicion < 3);

  const ties = {};
  rankedWithPos.forEach(r => {
    const key = `${r.puntos}-${r.desempatePts}`;
    if (!ties[key]) ties[key] = [];
    ties[key].push(r);
  });
  const tiedGroups = Object.values(ties).filter(group => group.length > 1 && group[0].puntos > 0);

  const reyGroup = rankedWithPos.slice(0, 1).filter(r => r.puntos > 0);
  const entonadosGroup = rankedWithPos.slice(1, 3).filter(r => r.puntos > 0);
  const aprendicesGroup = rankedWithPos.slice(3, 5).filter(r => r.puntos > 0);
  const aguaGroup = rankedWithPos.slice(5, 7).filter(r => r.puntos > 0);
  const cartonGroup = rankedWithPos.slice(7, 8).filter(r => r.puntos > 0);

  const startTieBreaker = (group) => {
    setSelectedTieGroup(group);
    setRemainingTied(group);
    setResolvedTied([]);
    setTieWinner(null);
  };

  const closeTieBreaker = () => {
    setTieBreakerOpen(false);
    setSelectedTieGroup(null);
    setRemainingTied([]);
    setResolvedTied([]);
    setTieWinner(null);
  };

  const throwCoin = () => {
    if (remainingTied.length < 2) return;
    setTieWinner(null);
    setResolvingTie(true);
    let spins = 0;
    
    const interval = setInterval(() => {
      spins++;
      // Just for visual effect during spin, pick random
      setTieWinner(remainingTied[spins % remainingTied.length]);
      if (spins > 30) {
        clearInterval(interval);
        setResolvingTie(false);
        const finalWinner = remainingTied[Math.floor(Math.random() * remainingTied.length)];
        setTieWinner(finalWinner);
        
        const newResolved = [...resolvedTied, finalWinner];
        const newRemaining = remainingTied.filter(g => g.amigo !== finalWinner.amigo);
        
        setResolvedTied(newResolved);
        setRemainingTied(newRemaining);
        
        if (newRemaining.length === 1) {
          const finalOrder = [...newResolved, newRemaining[0]];
          setResolvedTied(finalOrder);
          setRemainingTied([]);
          desempateGrupo(finalOrder.map(g => g.amigo)).then(() => {
            fetchTodosVotos();
          });
        }
      }
    }, 80);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          <Icon name="Trophy" size={32} color="#FBBF24" /> Ranking Final
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {tiedGroups.length > 0 && (
            <Button variant="danger" size="sm" onClick={() => setTieBreakerOpen(true)}>
              <Icon name="Swords" size={16} /> Desempatar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleRefresh} loading={isRefreshing} id="ranking-refresh">
            <Icon name="RefreshCw" size={16} /> Actualizar
          </Button>
        </div>
      </div>

      {totalPuntos === 0 ? (
        <div className={styles.empty}>
          <Icon name="Users" size={48} color="rgba(255,255,255,0.4)" />
          <p>¡Aún no hay votos! Empieza a jugar.</p>
        </div>
      ) : (
        <>
          <div className={styles.podium}>
            {top3.map((r, i) => (
              <PodiumCard
                key={r.amigo}
                amigo={r.amigo}
                puntos={r.puntos}
                posicion={r.posicion}
                delay={i * 150}
                isTie={ties[`${r.puntos}-${r.desempatePts}`] && ties[`${r.puntos}-${r.desempatePts}`].length > 1}
              />
            ))}
          </div>

          <div className={styles.titlesRow}>
            {reyGroup.length > 0 && (
              <div className={styles.titleCard} style={{ borderColor: '#FBBF24' }}>
                <div className={styles.titleIcon}>
                  <Icon name="Crown" size={28} color="#FBBF24" />
                </div>
                <div className={styles.titleText}>
                  <span>Rey del Chuchaqui</span>
                  <strong>{reyGroup.map(r => r.amigo).join(' & ')}</strong>
                </div>
              </div>
            )}
            
            {entonadosGroup.length > 0 && (
              <div className={styles.titleCard} style={{ borderColor: '#F97316' }}>
                <div className={styles.titleIcon}>
                  <Icon name="Flame" size={28} color="#F97316" />
                </div>
                <div className={styles.titleText}>
                  <span>Los Entonados</span>
                  <strong>{entonadosGroup.map(r => r.amigo).join(' & ')}</strong>
                </div>
              </div>
            )}

            {aprendicesGroup.length > 0 && (
              <div className={styles.titleCard} style={{ borderColor: '#38BDF8' }}>
                <div className={styles.titleIcon}>
                  <Icon name="Users" size={28} color="#38BDF8" />
                </div>
                <div className={styles.titleText}>
                  <span>Aprendices del Chuchaqui</span>
                  <strong>{aprendicesGroup.map(r => r.amigo).join(' & ')}</strong>
                </div>
              </div>
            )}

            {aguaGroup.length > 0 && (
              <div className={styles.titleCard} style={{ borderColor: '#22C55E' }}>
                <div className={styles.titleIcon}>
                  <Icon name="Droplet" size={28} color="#22C55E" />
                </div>
                <div className={styles.titleText}>
                  <span>Bebedores de Agua</span>
                  <strong>{aguaGroup.map(r => r.amigo).join(' & ')}</strong>
                </div>
              </div>
            )}

            {cartonGroup.length > 0 && (
              <div className={styles.titleCard} style={{ borderColor: '#94A3B8' }}>
                <div className={styles.titleIcon}>
                  <Icon name="Package" size={28} color="#94A3B8" />
                </div>
                <div className={styles.titleText}>
                  <span>Chuchaqui de Cartón</span>
                  <strong>{cartonGroup.map(r => r.amigo).join(' & ')}</strong>
                </div>
              </div>
            )}
          </div>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rankedWithPos} margin={{ top: 60, right: 16, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="amigo"
                  tick={{ fill: 'white', fontFamily: "'Fredoka', sans-serif", fontSize: 14, fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={false}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="puntos" 
                  radius={[10, 10, 0, 0]} 
                  isAnimationActive 
                  animationDuration={700}
                  className={styles.bouncingBar}
                >
                  <LabelList
                    dataKey="posicion"
                    position="top"
                    offset={25}
                    formatter={(val) => `${val + 1}º`}
                    style={{ fill: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: 24, fontFamily: "'Nunito', sans-serif" }}
                  />
                  {rankedWithPos.map((entry) => (
                    <Cell key={entry.amigo} fill={COLOR_POR_AMIGO[entry.amigo] || '#A855F7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Modal de Desempate */}
      {tieBreakerOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeTieBreaker}>
              <Icon name="X" size={24} />
            </button>
            <h2 className={styles.modalTitle}>⚖️ Zona de Desempate</h2>
            
            {!selectedTieGroup ? (
              <div className={styles.tieGroupsList}>
                <p>Selecciona un grupo para desempatar al azar:</p>
                {tiedGroups.map((group, idx) => (
                  <button key={idx} className={styles.tieGroupBtn} onClick={() => startTieBreaker(group)}>
                    Empate por el <strong>{group[0].posicion + 1}º lugar</strong> ({group[0].puntos} pts)
                    <br/>
                    <small>{group.map(g => g.amigo).join(' vs ')}</small>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.tieArena}>
                <div className={styles.tieColumns}>
                  {/* Columna Izquierda: Lanzar Moneda */}
                  <div className={styles.coinSection}>
                    <h3 style={{ marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>
                      En juego: <strong>{remainingTied.map(g => g.amigo).join(' vs ')}</strong>
                    </h3>
                    
                    <div className={styles.coinWrapper}>
                      <div className={`${styles.coin3D} ${resolvingTie ? styles.isFlipping : ''}`}>
                        <div className={styles.coinFront} style={{ backgroundColor: tieWinner && !resolvingTie ? COLOR_POR_AMIGO[tieWinner.amigo] : '#1E1B4B' }}>
                          {tieWinner && !resolvingTie ? tieWinner.amigo : '?'}
                        </div>
                        <div className={styles.coinBack}>
                          <Icon name="Coins" size={48} color="#FBBF24" />
                        </div>
                      </div>
                    </div>
                    
                    {remainingTied.length > 0 ? (
                      <Button onClick={throwCoin} disabled={resolvingTie}>
                        <Icon name="Coins" size={20} /> Lanzar Moneda
                      </Button>
                    ) : (
                      <p style={{ color: '#FBBF24', fontSize: '1rem', marginTop: '16px', fontWeight: 600 }}>
                        ¡Desempate finalizado! Ranking actualizado.
                      </p>
                    )}
                  </div>
                  
                  {/* Columna Derecha: Mini Ranking */}
                  <div className={styles.miniRankingSection}>
                    <h4>Mini Ranking</h4>
                    <div className={styles.miniRankingList}>
                      {resolvedTied.map((r, i) => (
                        <div key={r.amigo} className={styles.miniRankItem} style={{ '--amigo-color': COLOR_POR_AMIGO[r.amigo] }}>
                          <span className={styles.miniRankPos}>{selectedTieGroup[0].posicion + 1 + i}º</span>
                          <span className={styles.miniRankName}>{r.amigo}</span>
                        </div>
                      ))}
                      {remainingTied.map((r, i) => (
                        <div key={r.amigo} className={styles.miniRankItemPending}>
                          <span className={styles.miniRankPos}>{selectedTieGroup[0].posicion + 1 + resolvedTied.length + i}º</span>
                          <span className={styles.miniRankName}>...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <Button variant="ghost" size="sm" onClick={() => { if(tiedGroups.length <= 1) closeTieBreaker(); else setSelectedTieGroup(null); }}>
                    Volver a Empates
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
