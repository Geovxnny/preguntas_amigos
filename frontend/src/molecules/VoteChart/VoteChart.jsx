import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { COLOR_POR_AMIGO } from '../../constants/friends';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './VoteChart.module.css';

const CustomLabel = ({ x, y, width, value }) => (
  <text
    x={x + width / 2}
    y={y - 8}
    fill="white"
    textAnchor="middle"
    fontSize={18}
    fontWeight={800}
    fontFamily="'Nunito', sans-serif"
  >
    {value}
  </text>
);

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
        {payload[0].value} {payload[0].value === 1 ? 'voto' : 'votos'}
      </div>
    );
  }
  return null;
};

/**
 * Molecule: VoteChart
 * Gráfico de barras animado con los resultados de votación.
 */
export function VoteChart({ votos }) {
  const data = Object.entries(votos)
    .map(([amigo, count]) => ({ amigo, votos: count }))
    .sort((a, b) => b.votos - a.votos);

  const total = data.reduce((sum, d) => sum + d.votos, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.total} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <Icon name="Inbox" size={20} color="#FBBF24" /> <strong>{total}</strong> votos totales
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 40, right: 20, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="amigo"
            tick={{ fill: 'white', fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={false}
            content={<CustomTooltip />}
          />
          <Bar dataKey="votos" radius={[12, 12, 0, 0]} isAnimationActive animationDuration={600}>
            <LabelList content={<CustomLabel />} />
            {data.map((entry) => (
              <Cell
                key={entry.amigo}
                fill={COLOR_POR_AMIGO[entry.amigo] || '#A855F7'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
