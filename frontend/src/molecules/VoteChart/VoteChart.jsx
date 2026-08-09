import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { COLOR_POR_AMIGO } from '../../constants/friends';
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
      <div className={styles.total}>
        🗳️ <strong>{total}</strong> votos totales
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="amigo"
            tick={{ fill: 'white', fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
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
