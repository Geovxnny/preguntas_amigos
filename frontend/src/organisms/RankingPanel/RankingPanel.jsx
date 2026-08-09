import { useEffect } from 'react';
import { PodiumCard } from '../../molecules/PodiumCard/PodiumCard';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { COLOR_POR_AMIGO } from '../../constants/friends';
import { useVotes } from '../../hooks/useVotes';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import styles from './RankingPanel.module.css';

function calcularRanking(todosVotos, amigos) {
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
    .map(([amigo, pts]) => ({ amigo, puntos: pts }))
    .sort((a, b) => b.puntos - a.puntos);
}

const AMIGOS_NOMBRES = ['Kyu', 'Elaina', 'Superboy', 'Emilio', 'Hally', 'JL', 'Lucho', 'Gio'];

/**
 * Organism: RankingPanel
 * Podio animado + tabla de ranking acumulado.
 */
export function RankingPanel() {
  const { todosVotos, fetchTodosVotos } = useVotes();

  useEffect(() => {
    fetchTodosVotos();
  }, []);

  const ranking = calcularRanking(todosVotos, AMIGOS_NOMBRES);
  const top3 = ranking.slice(0, 3);
  const totalPuntos = ranking.reduce((s, r) => s + r.puntos, 0);

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          <Icon name="Trophy" size={32} color="#FBBF24" /> Ranking Final
        </h1>
        <Button variant="ghost" size="sm" onClick={fetchTodosVotos} id="ranking-refresh">
          <Icon name="RefreshCw" size={16} /> Actualizar
        </Button>
      </div>

      {totalPuntos === 0 ? (
        <div className={styles.empty}>
          <Icon name="Users" size={48} color="rgba(255,255,255,0.4)" />
          <p>¡Aún no hay votos! Empieza a jugar.</p>
        </div>
      ) : (
        <>
          {/* Podio */}
          <div className={styles.podium}>
            {top3.map((r, i) => (
              <PodiumCard
                key={r.amigo}
                amigo={r.amigo}
                puntos={r.puntos}
                posicion={i}
                delay={i * 150}
              />
            ))}
          </div>

          {/* Gráfico de barras */}
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ranking} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="amigo"
                  tick={{ fill: 'white', fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(76,53,181,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 12,
                    color: 'white',
                    fontFamily: "'Nunito', sans-serif",
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                  formatter={(v) => [`${v} preguntas ganadas`, '']}
                />
                <Bar dataKey="puntos" radius={[10, 10, 0, 0]} isAnimationActive animationDuration={700}>
                  <LabelList
                    dataKey="puntos"
                    position="top"
                    style={{ fill: 'white', fontWeight: 800, fontSize: 16, fontFamily: "'Nunito', sans-serif" }}
                  />
                  {ranking.map((entry) => (
                    <Cell key={entry.amigo} fill={COLOR_POR_AMIGO[entry.amigo] || '#A855F7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
