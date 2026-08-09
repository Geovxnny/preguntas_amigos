import { useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Icon } from '../../atoms/Icon/Icon';
import { Button } from '../../atoms/Button/Button';
import { PinInput } from '../../molecules/PinInput/PinInput';
import styles from './AppLayout.module.css';

/**
 * Template: AppLayout
 * Main layout: left sidebar + content area.
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
      {/* Mobile hamburger button */}
      <button
        className={styles.menuToggle}
        onClick={() => setSidebarOpen(p => !p)}
        id="menu-toggle"
        aria-label="Open menu"
      >
        <Icon name={sidebarOpen ? 'X' : 'Menu'} size={24} />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Scrollable top section */}
        <div className={styles.sidebarScroll}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Icon name="Sparkles" size={22} color="#FBBF24" />
            </div>
            <div>
              <div className={styles.logoTitle}>Trivia</div>
              <div className={styles.logoSub}>entre Amigos</div>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Active question status */}
          <div className={styles.statusCard}>
            <Icon name="Radio" size={16} color="rgba(255,255,255,0.6)" />
            <span className={styles.statusText}>
              Active question: <strong>{preguntaActiva}</strong> / {totalPreguntas}
            </span>
          </div>

          {/* QR Code */}
          <div className={styles.qrWrap}>
            <p className={styles.qrLabel}>
              <Icon name="Wifi" size={14} /> WiFi Access
            </p>
            <div className={styles.qrBox}>
              <QRCode value={appUrl} size={120} fgColor="#1E1B4B" bgColor="white" />
            </div>
            <code className={styles.qrUrl}>{appUrl}</code>
          </div>
        </div>

        {/* Fixed bottom: host auth — always visible */}
        <div className={styles.sidebarFooter}>
          <div className={styles.divider} />
          {!isHost ? (
            <div className={styles.hostSection}>
              <p className={styles.hostLabel}>
                <Icon name="Lock" size={14} /> Host mode
              </p>
              <PinInput onSubmit={onLogin} error={authError} />
            </div>
          ) : (
            <div className={styles.hostSection}>
              <div className={styles.hostActive}>
                <Icon name="Unlock" size={16} color="#22C55E" />
                <span>Host active</span>
              </div>
              <Button variant="ghost" size="sm" fullWidth onClick={onLogout} id="logout-btn">
                <Icon name="LogOut" size={14} /> Sign out
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
