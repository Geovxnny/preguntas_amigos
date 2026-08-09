import { useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import { PinInput } from '../../molecules/PinInput/PinInput';
import styles from './AppLayout.module.css';

/**
 * Template: AppLayout
 * Layout principal: sidebar izquierda + área de contenido.
 */
export function AppLayout({ children, mode, onModeChange, isHost, onLogin, onLogout, authError, preguntaActiva, totalPreguntas }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const appUrl = window.location.origin;

  const navItems = [
    { id: 'mobile',  label: 'Votar',     icon: 'Smartphone' },
    ...(isHost ? [
      { id: 'tv',      label: 'Pantalla TV', icon: 'Monitor' },
      { id: 'ranking', label: 'Ranking',     icon: 'Trophy'  },
    ] : []),
  ];

  return (
    <div className={styles.layout}>
      {/* Botón hamburguesa para móvil */}
      <button
        className={styles.menuToggle}
        onClick={() => setSidebarOpen(p => !p)}
        id="menu-toggle"
        aria-label="Abrir menú"
      >
        <Icon name={sidebarOpen ? 'X' : 'Menu'} size={24} />
      </button>

      {/* Overlay en móvil */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarInner}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoEmoji}>🎉</span>
            <div>
              <div className={styles.logoTitle}>Trivia</div>
              <div className={styles.logoSub}>entre Amigos</div>
            </div>
          </div>

          {/* Navegación */}
          <nav className={styles.nav}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${mode === item.id ? styles.navItemActive : ''}`}
                onClick={() => { onModeChange(item.id); setSidebarOpen(false); }}
                id={`nav-${item.id}`}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.divider} />

          {/* Info de pregunta activa */}
          <div className={styles.statusCard}>
            <Icon name="Radio" size={16} color="rgba(255,255,255,0.6)" />
            <span className={styles.statusText}>
              Pregunta activa: <strong>{preguntaActiva}</strong> / {totalPreguntas}
            </span>
          </div>

          {/* QR Code */}
          <div className={styles.qrWrap}>
            <p className={styles.qrLabel}>
              <Icon name="Wifi" size={14} /> Acceso WiFi
            </p>
            <div className={styles.qrBox}>
              <QRCode value={appUrl} size={120} fgColor="#1E1B4B" bgColor="white" />
            </div>
            <code className={styles.qrUrl}>{appUrl}</code>
          </div>

          <div className={styles.divider} />

          {/* Autenticación de anfitrión */}
          {!isHost ? (
            <div className={styles.hostSection}>
              <p className={styles.hostLabel}>
                <Icon name="Lock" size={14} /> Modo anfitrión
              </p>
              <PinInput onSubmit={onLogin} error={authError} />
            </div>
          ) : (
            <div className={styles.hostSection}>
              <div className={styles.hostActive}>
                <Icon name="Unlock" size={16} color="#22C55E" />
                <span>Anfitrión activo</span>
              </div>
              <Button variant="ghost" size="sm" fullWidth onClick={onLogout} id="logout-btn">
                <Icon name="LogOut" size={14} /> Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
