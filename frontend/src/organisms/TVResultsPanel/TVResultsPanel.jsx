import { useState, useEffect } from 'react';
import { QuestionCard } from '../../molecules/QuestionCard/QuestionCard';
import { VoteChart } from '../../molecules/VoteChart/VoteChart';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { useVotes } from '../../hooks/useVotes';
import styles from './TVResultsPanel.module.css';

/**
 * Organism: TVResultsPanel
 * Vista del proyector/TV: pregunta grande → botón revelar → gráfico de votos.
 */
export function TVResultsPanel({ preguntaActiva, totalPreguntas, preguntas, onAnterior, onSiguiente }) {
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const { votosPregunta, loading, fetchVotosPregunta, startPolling, stopPolling } = useVotes();

  // Cuando cambia la pregunta, ocultamos resultados y detenemos polling
  useEffect(() => {
    setMostrarResultados(false);
    stopPolling();
  }, [preguntaActiva]);

  const handleMostrar = async () => {
    await fetchVotosPregunta(preguntaActiva - 1);
    setMostrarResultados(true);
    startPolling(preguntaActiva - 1, 5000);
  };

  const handleOcultar = () => {
    setMostrarResultados(false);
    stopPolling();
  };

  const preguntaTexto = preguntas?.[preguntaActiva - 1] || '…';

  return (
    <div className={styles.panel}>
      {/* Controles de navegación */}
      <div className={styles.nav}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAnterior}
          disabled={preguntaActiva <= 1}
          id="tv-btn-anterior"
        >
          <Icon name="ChevronLeft" size={20} /> Anterior
        </Button>

        <div className={styles.counter}>
          {preguntaActiva} / {totalPreguntas}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSiguiente}
          disabled={preguntaActiva >= totalPreguntas}
          id="tv-btn-siguiente"
        >
          Siguiente <Icon name="ChevronRight" size={20} />
        </Button>
      </div>

      {/* Tarjeta de la pregunta */}
      <QuestionCard
        numero={preguntaActiva}
        total={totalPreguntas}
        texto={preguntaTexto}
      />

      {/* Resultados */}
      {!mostrarResultados ? (
        <div className={styles.revealWrap}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleMostrar}
            loading={loading}
            id="tv-btn-revelar"
          >
            <Icon name="BarChart2" size={22} /> Mostrar resultados
          </Button>
          <p className={styles.hint}>
            <Icon name="Smartphone" size={14} /> Tus amigos ya pueden votar desde el celular
          </p>
        </div>
      ) : (
        <div className={styles.chartWrap}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOcultar}
            id="tv-btn-ocultar"
          >
            <Icon name="EyeOff" size={16} /> Ocultar resultados
          </Button>
          {Object.keys(votosPregunta).length > 0 && (
            <VoteChart votos={votosPregunta} />
          )}
        </div>
      )}
    </div>
  );
}
